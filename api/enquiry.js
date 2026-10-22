// POST /api/enquiry — receives the enquiry form.
// Delivery is configured with Vercel settings, so nothing is sent until they exist:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY   store the enquiry in the `enquiries` table
//   RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM   email the team (ENQUIRY_FROM must be a sender Resend has verified)
// If neither is configured the endpoint answers 503 and the form shows the email and phone fallback.

const LIMITS = { name: 120, email: 200, phone: 40, message: 4000 };
const hits = new Map(); // best effort only: serverless instances do not share memory

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function validate(body) {
  const data = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    message: clean(body.message, LIMITS.message),
  };
  const errors = {};
  if (!data.name) errors.name = 'Enter your full name.';
  if (!data.email) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address, like name@example.com.';
  if (data.phone && !/^\d{7,15}$/.test(data.phone.replace(/[\s()+\-.]/g, ''))) errors.phone = 'Enter a phone number with digits only, for example 082 123 4567.';
  if (!data.message) errors.message = 'Tell us a little about the trip.';
  return { data, errors };
}

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > 5;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function store(data, env) {
  const key = env.SUPABASE_SERVICE_KEY.trim();
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys are not JWTs and must only be sent as apikey.
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  const res = await fetch(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/enquiries', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone || null, message: data.message, status: 'new' }),
  });
  if (!res.ok) throw new Error('store ' + res.status);
}

async function email(data, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM,
      to: env.ENQUIRY_TO.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: data.email,
      subject: 'New enquiry from ' + data.name,
      text: 'Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + (data.phone || '-') + '\n\n' + data.message,
      html: '<p><b>Name:</b> ' + escapeHtml(data.name) + '<br><b>Email:</b> ' + escapeHtml(data.email) + '<br><b>Phone:</b> ' + escapeHtml(data.phone || '-') + '</p><p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>',
    }),
  });
  if (!res.ok) throw new Error('email ' + res.status);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'bad_request' });

  // Hidden field that people never fill in: pretend success so bots learn nothing.
  if (body.company) return res.status(200).json({ ok: true });

  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
  if (tooMany(ip)) return res.status(429).json({ error: 'too_many' });

  const { data, errors } = validate(body);
  if (Object.keys(errors).length) return res.status(422).json({ error: 'invalid', fields: errors });

  const env = process.env;
  const jobs = [];
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) jobs.push(store(data, env));
  if (env.RESEND_API_KEY && env.ENQUIRY_TO && env.ENQUIRY_FROM) jobs.push(email(data, env));
  if (!jobs.length) return res.status(503).json({ error: 'not_configured' });

  const results = await Promise.allSettled(jobs);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('enquiry delivery failed:', r.reason && r.reason.message));
  if (results.every((r) => r.status === 'rejected')) return res.status(502).json({ error: 'delivery_failed' });
  return res.status(200).json({ ok: true });
};
