import { next } from '@vercel/functions';

// Protects everything under /admin/ with HTTP Basic auth.
// The password is never stored here. Only its SHA-256 fingerprint is, as the
// ADMIN_PASSWORD_SHA256 environment variable in Vercel. If that variable is
// missing the admin area stays closed.
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

const REALM = 'Lunar Admin';

function deny(status, message) {
  return new Response(message, {
    status,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function middleware(request) {
  const expected = (process.env.ADMIN_PASSWORD_SHA256 || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expected)) {
    return new Response('Admin is closed.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return deny(401, 'Sign in required.');

  let password = '';
  try {
    const decoded = atob(header.slice(6));
    password = decoded.slice(decoded.indexOf(':') + 1);
  } catch (e) {
    return deny(401, 'Sign in required.');
  }

  const supplied = await sha256Hex(password);
  if (!sameText(supplied, expected)) return deny(401, 'Wrong password.');

  return next({ headers: { 'Cache-Control': 'no-store' } });
}
