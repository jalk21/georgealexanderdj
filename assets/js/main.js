// ---------- Include loader ----------
// Fetches each [data-include] fragment from /includes and swaps it into place.
// Requires the page to be served over http(s) — fetch() of local files will be
// blocked by the browser's CORS policy if you just double-click index.html.
// Any static host (Netlify, GitHub Pages, nginx, Apache, etc.) works fine.
function loadIncludes(){
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
  var promises = nodes.map(function(el){
    var path = el.getAttribute('data-include');
    return fetch(path)
      .then(function(res){
        if (!res.ok) { throw new Error('Failed to load include: ' + path); }
        return res.text();
      })
      .then(function(html){ el.outerHTML = html; })
      .catch(function(err){
        el.outerHTML = '<!-- include failed: ' + path + ' -->';
        console.error(err);
      });
  });
  return Promise.all(promises);
}

loadIncludes().then(initPage);

// ---------- Page logic (runs once every include is in the DOM) ----------
function initPage(){

  // ---------- i18n ----------
  // Page markup ships in Spanish by default (no flash of English on load).
  // Switching languages swaps text via data-i18n / data-i18n-placeholder attributes.
  var translations = {
    nav_mixes:      { es: "Mixes",   en: "Mixes" },
    nav_socials:    { es: "Redes",   en: "Socials" },
    nav_booking:    { es: "Contacto", en: "Contact" },
    nav_cta:        { es: "Reservar", en: "Book a set" },

    hero_eyebrow:   { es: "Reservas 12:00 – 00:00", en: "Booking 12 PM – 12 AM" },
    hero_sub:       { es: "Sesiones con groove desde el mediodía hasta la noche — terrazas, jardines, sesiones de domingo, brunches y todo lo que venga después. Actualmente disponible para reservas.",
                       en: "Groove-first sets from midday into the night — rooftop terraces, garden parties, Sunday sessions, brunch floors, and everything after dark. Currently open for bookings." },
    cta_book:       { es: "Reservar sesión", en: "Book a set" },
    cta_listen:     { es: "Escuchar mixes", en: "Listen to mixes" },
    dial_label:     { es: "Horario de reservas · 12:00 – 00:00", en: "Booking window · 12 PM – 12 AM" },

    marquee_booking:{ es: "Reservas Abiertas 12:00 – 00:00", en: "Now Booking 12 PM – 12 AM" },

    mixes_eyebrow:  { es: "Últimas sesiones", en: "Latest sets" },
    mixes_h2:       { es: "Mixes en Mixcloud", en: "Mixes on Mixcloud" },
    mixes_fallback: { es: "¿El reproductor no carga? Mixcloud bloquea las inserciones hasta que la cuenta tenga subidas públicas.",
                       en: "Player not loading? Mixcloud blocks embeds until the account has public uploads." },
    mixes_open:     { es: "Ver perfil de Mixcloud →", en: "Open Mixcloud profile →" },

    socials_eyebrow:{ es: "Sígueme", en: "Follow along" },
    socials_h2:     { es: "Redes sociales", en: "On socials" },
    socials_desc:   { es: "Mis directos, mi día a día y lo que hago en mi tiempo libre.",
                       en: "My live sets, my day-to-day, and what I get up to in my free time." },

    booking_eyebrow:{ es: "Reservas abiertas", en: "Now booking" },
    booking_h2:     { es: "Sesiones, 12:00 – 00:00", en: "Gigs, 12 PM – 12 AM" },
    booking_p:      { es: "Tardeos, sesiones en rooftop, jardines, terrazas de hotel, brunches de domingo, escenarios diurnos de festivales y sesiones que se alargan hasta la noche — escríbeme.",
                       en: "Day parties, rooftop sessions, garden bars, hotel terraces, Sunday brunch floors, festival day-stages, and sets running on into the night — get in touch below." },
    label_email:    { es: "Correo", en: "Email" },
    label_ig_dm:    { es: "Instagram DM · @georgealexanderdj", en: "Instagram DM · @georgealexanderdj" },

    form_name_label:      { es: "Tu nombre", en: "Your name" },
    form_email_label:     { es: "Correo electrónico", en: "Email" },
    form_date_label:      { es: "Fecha del evento", en: "Date of event" },
    form_venue_label:     { es: "Local / evento", en: "Venue / event" },
    form_venue_placeholder:{ es: "ej. terraza, jardín privado, brunch", en: "e.g. rooftop bar, private garden, brunch" },
    form_details_label:  { es: "Detalles", en: "Details" },
    form_details_placeholder:{ es: "Horarios, ambiente, número de invitados...", en: "Timings, vibe, guest count..." },
    captcha_error:  { es: "Eso no es correcto — inténtalo de nuevo.", en: "That's not quite right — try again." },
    submit_btn:     { es: "Enviar solicitud", en: "Send enquiry" },
    form_note:      { es: "Se abrirá tu app de correo con los datos ya rellenados — esta página aún no tiene servidor.",
                       en: "Opens your email app with the details filled in — there's no server behind this page yet." }
  };
  var captchaTemplate = { es: "Comprobación rápida: ¿cuánto es {a} + {b}?", en: "Quick check: what is {a} + {b}?" };
  var pageTitle = { es: "George Alexander DJ — Reservas 12:00–00:00", en: "George Alexander DJ — Booking 12 PM – 12 AM" };
  var dialAria = { es: "Vinilo que marca el horario de reservas, de 12:00 a 00:00", en: "Vinyl dial marking the booking window, 12 PM through 12 AM" };

  var currentLang = 'es';

  function applyLanguage(lang){
    currentLang = lang;
    document.documentElement.lang = lang;
    document.getElementById('page-title').textContent = pageTitle[lang];
    document.getElementById('dial-svg').setAttribute('aria-label', dialAria[lang]);

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (translations[key]) { el.textContent = translations[key][lang]; }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) { el.placeholder = translations[key][lang]; }
    });

    document.getElementById('captcha-question').textContent =
      captchaTemplate[lang].replace('{a}', captchaA).replace('{b}', captchaB);

    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ applyLanguage(btn.getAttribute('data-lang')); });
  });

  // ---------- Captcha ----------
  // Simple client-side math captcha. There's no server behind this page,
  // so this can't stop a determined human — it's here to filter out the
  // automated form-fillers that scrape static pages for mailto links.
  var captchaA = Math.floor(Math.random() * 8) + 2;   // 2-9
  var captchaB = Math.floor(Math.random() * 8) + 2;   // 2-9
  var captchaAnswer = captchaA + captchaB;

  // ---------- Contact email ----------
  // Built at runtime rather than left as a plain string in the page source —
  // keeps the address off basic scrapers that scan static HTML/JS for "name@domain" patterns.
  var contactEmail = ['contact', 'georgealexanderdj.com'].join('@');
  document.getElementById('email-link').href = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent('Contact enquiry');

  document.getElementById('captcha-question').textContent =
    captchaTemplate[currentLang].replace('{a}', captchaA).replace('{b}', captchaB);

  document.getElementById('booking-form').addEventListener('submit', function(e){
    e.preventDefault();

    var errorEl = document.getElementById('captcha-error');
    errorEl.hidden = true;

    // Honeypot: if this hidden field has been filled, silently drop it.
    var honeypot = document.getElementById('company').value;
    if (honeypot) { return; }

    var givenAnswer = document.getElementById('captcha-answer').value.trim();
    if (parseInt(givenAnswer, 10) !== captchaAnswer) {
      errorEl.hidden = false;
      return;
    }

    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var date = document.getElementById('date').value;
    var venue = document.getElementById('venue').value;
    var details = document.getElementById('details').value;
    var body = "Name: " + name + "%0AEmail: " + email + "%0ADate: " + date + "%0AVenue/event: " + venue + "%0A%0ADetails:%0A" + details;
    window.location.href = "mailto:" + contactEmail + "?subject=" + encodeURIComponent('Contact enquiry') + "&body=" + body;
  });
}
