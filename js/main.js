// Lunar Travel — shared site script.
// Handles the mobile menu, the enquiry form (validation and draft carry-over) and the cookie notice.
(function () {
  'use strict';

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  function read(kind, key) {
    try { var s = store(kind); return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function write(kind, key, value) {
    try { var s = store(kind); if (s) s.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }
  function remove(kind, key) {
    try { var s = store(kind); if (s) s.removeItem(key); } catch (e) { /* storage unavailable */ }
  }

  /* Mobile menu */
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-button');
  if (header && menuButton) {
    var setMenu = function (open) {
      header.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menuButton.textContent = open ? 'Close' : 'Menu';
    };
    menuButton.addEventListener('click', function () { setMenu(!header.classList.contains('menu-open')); });
    header.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); menuButton.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 800) setMenu(false); });
  }

  /* Home form: keep what was typed when moving to the enquiry page */
  var homeForm = document.getElementById('home-form');
  if (homeForm) {
    var saveDraft = function () {
      write('sessionStorage', 'lt-draft', JSON.stringify({
        name: homeForm.elements.name.value,
        email: homeForm.elements.email.value,
        message: homeForm.elements.message.value
      }));
    };
    var go = document.getElementById('continue-enquiry');
    if (go) go.addEventListener('click', saveDraft);
    homeForm.addEventListener('submit', function (e) { e.preventDefault(); saveDraft(); window.location.href = '/enquire/'; });
  }

  /* Enquiry form */
  var form = document.getElementById('enquiry-form');
  if (form) {
    var SERVICES = {
      'airport': 'Airport transfer',
      'corporate': 'Corporate travel',
      'events': 'Private event',
      'long-distance': 'Long-distance journey'
    };
    var fields = {
      name: form.elements['full-name'],
      email: form.elements['email-address'],
      phone: form.elements['phone'],
      journey: form.elements['journey']
    };
    var draft = null;
    try { draft = JSON.parse(read('sessionStorage', 'lt-draft') || 'null'); } catch (e) { draft = null; }
    if (draft) {
      if (draft.name && !fields.name.value) fields.name.value = draft.name;
      if (draft.email && !fields.email.value) fields.email.value = draft.email;
      if (draft.message && !fields.journey.value) fields.journey.value = draft.message;
      remove('sessionStorage', 'lt-draft');
    }
    var service = null;
    try { service = new URLSearchParams(window.location.search).get('service'); } catch (e) { service = null; }
    if (service && SERVICES[service] && !fields.journey.value) {
      fields.journey.value = 'Service: ' + SERVICES[service] + '\n';
    }

    var status = document.getElementById('form-status');
    var rules = {
      name: function (v) { return v.trim() ? '' : 'Enter your full name.'; },
      email: function (v) {
        if (!v.trim()) return 'Enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.';
      },
      phone: function (v) {
        if (!v.trim()) return '';
        var digits = v.replace(/[\s()+\-.]/g, '');
        return /^\d{7,15}$/.test(digits) ? '' : 'Enter a phone number with digits only, for example 082 123 4567.';
      },
      journey: function (v) { return v.trim() ? '' : 'Tell us a little about the trip.'; }
    };
    var setError = function (key, message) {
      var input = fields[key];
      var note = document.getElementById(input.id + '-error');
      if (!note) return;
      note.textContent = message;
      note.hidden = !message;
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', note.id);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    };
    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('blur', function () { if (fields[key].value) setError(key, rules[key](fields[key].value)); });
      fields[key].addEventListener('input', function () { if (fields[key].hasAttribute('aria-invalid')) setError(key, rules[key](fields[key].value)); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.hidden = true;
      var firstBad = null;
      Object.keys(fields).forEach(function (key) {
        var message = rules[key](fields[key].value);
        setError(key, message);
        if (message && !firstBad) firstBad = fields[key];
      });
      if (firstBad) { firstBad.focus(); return; }
      // Sending is not connected yet (planned for v1.2). Be honest and keep the visitor's text.
      status.innerHTML = 'We could not send your enquiry online yet, but nothing you typed has been lost. ' +
        'Please email <a href="mailto:hello@lunartravel.co">hello@lunartravel.co</a> or call <a href="tel:+27110000000">+27 11 000 0000</a>.';
      status.hidden = false;
      status.focus();
    });
  }

  /* Cookie notice. Optional cookies (analytics) will only ever load after "accepted". */
  var CONSENT_KEY = 'lt-consent';
  window.ltConsent = function () { return read('localStorage', CONSENT_KEY); };
  if (!read('localStorage', CONSENT_KEY)) {
    var notice = document.createElement('div');
    notice.className = 'cookie-notice';
    notice.setAttribute('role', 'region');
    notice.setAttribute('aria-label', 'Cookie notice');
    notice.innerHTML = '<p>We only use what the site needs to work. If we add analytics later, it will run only if you accept. See our <a href="/cookies/">cookie policy</a>.</p>' +
      '<div class="actions"><button class="button" type="button" data-choice="declined">Decline</button><button class="button" type="button" data-choice="accepted">Accept</button></div>';
    notice.addEventListener('click', function (e) {
      var choice = e.target && e.target.getAttribute && e.target.getAttribute('data-choice');
      if (!choice) return;
      write('localStorage', CONSENT_KEY, choice);
      notice.remove();
    });
    document.body.appendChild(notice);
  }
})();
