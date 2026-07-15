// ---------- Include loader ----------
function loadIncludes() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    var promises = nodes.map(function(el) {
        var path = el.getAttribute('data-include');
        return fetch(path)
            .then(function(res) {
                if (!res.ok) { throw new Error('Failed to load include: ' + path); }
                return res.text();
            })
            .then(function(html) { el.outerHTML = html; })
            .catch(function(err) {
                el.outerHTML = '';
                console.error(err);
            });
    });
    return Promise.all(promises);
}

loadIncludes().then(initPage);

// ---------- Page logic (runs once every include is in the DOM) ----------
function initPage() {

    // ---------- i18n ----------
    var translations = {
        nav_aboutme: { es: "Sobre mi", en: "About me" },
        nav_mixes: { es: "Mixes", en: "Mixes" },
        nav_socials: { es: "Redes", en: "Socials" },
        nav_booking: { es: "Contacto", en: "Contact" },
        nav_cta: { es: "Contact", en: "Contact" },

        hero_eyebrow: { es: "Horario de contratación 12h – 00h", en: "Booking window 12 PM – 12 AM" },
        hero_sub: {
            es: "Sesiones con groove desde el mediodía hasta la noche — terrazas, jardines, sesiones de domingo, brunches y todo lo que venga después. Actualmente disponible para reservas.",
            en: "Groove-first sets from midday into the night — rooftop terraces, garden parties, Sunday sessions, brunch floors, and everything after dark. Currently open for bookings."
        },
        cta_listen: { es: "Escuchar mixes", en: "Listen to mixes" },
        dial_label: { es: "Horario de contratación · 12h – 00h", en: "Booking window · 12 PM – 12 AM" },

        marquee_booking: { es: "Horario de contratación 12h – 00h", en: "Booking window 12 PM – 12 AM" },

        mixes_eyebrow: { es: "Últimas sesiones", en: "Latest sets" },
        mixes_h2: { es: "Mixes en Mixcloud", en: "Mixes on Mixcloud" },
        mixes_fallback: {
            es: "¿El reproductor no carga? Mixcloud bloquea las inserciones hasta que la cuenta tenga subidas públicas.",
            en: "Player not loading? Mixcloud blocks embeds until the account has public uploads."
        },
        mixes_open: { es: "Ver perfil de Mixcloud →", en: "Open Mixcloud profile →" },

        socials_eyebrow: { es: "Sígueme", en: "Follow along" },
        socials_h2: { es: "Redes sociales", en: "On socials" },
        socials_desc: {
            es: "Mis directos, mi día a día y lo que hago en mi tiempo libre.",
            en: "My live sets, my day-to-day, and what I get up to in my free time."
        },

        booking_eyebrow: { es: "Reservas abiertas", en: "Now booking" },
        booking_h2: { es: "Sesiones, 12h – 00h", en: "Gigs, 12 PM – 12 AM" },
        booking_p: {
            es: "Tardeos, sesiones en rooftop, jardines, terrazas de hotel, brunches de domingo, escenarios diurnos de festivales y sesiones que se alargan hasta la noche — escríbeme.",
            en: "Day parties, rooftop sessions, garden bars, hotel terraces, Sunday brunch floors, festival day-stages, and sets running on into the night — get in touch below."
        },
        label_email: { es: "Contactar usando correo electrónico", en: "Contact using e-mail address" },
        label_ig_dm: { es: "Contactar usando Instagram DM", en: "Contact using Instagram DM" },

        form_name_label: { es: "Tu nombre", en: "Your name" },
        form_email_label: { es: "Correo electrónico", en: "Email" },
        form_date_label: { es: "Fecha del evento", en: "Date of event" },
        form_venue_label: { es: "Local / evento", en: "Venue / event" },
        form_venue_placeholder: { es: "ej. terraza, jardín privado, brunch", en: "e.g. rooftop bar, private garden, brunch" },
        form_details_label: { es: "Detalles", en: "Details" },
        form_details_placeholder: { es: "Horarios, ambiente, número de invitados...", en: "Timings, vibe, guest count..." },

        // Nuevas claves del formulario Web3Forms
        form_success_title: { es: "¡Solicitud enviada correctamente!", en: "Booking Request Sent Successfully!" },
        form_success_text: { es: "Gracias por contactar. Revisaré los detalles del evento y te responderé lo antes posible.", en: "Thank you for reaching out. I will review your event details and get back to you as soon as possible." },
        captcha_error: { es: "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.", en: "There was a problem submitting the form. Please try again." },
        network_error: { es: "Error de conexión. Asegúrate de tener internet e inténtalo más tarde.", en: "Connection error. Please check your internet connection and try again." },

        submit_btn: { es: "Enviar solicitud", en: "Send enquiry" },
        form_note: {
            es: "Tu solicitud se enviará de forma segura y directa por correo electrónico.",
            en: "Your request will be sent securely and directly via email."
        }
    };

    var pageTitle = { es: "George Alexander DJ — Reservas 12h – 00h", en: "George Alexander DJ — Booking 12 PM – 12 AM" };
    var dialAria = { es: "Vinilo que marca el horario de reservas, de 12h a 00h", en: "Vinyl dial marking the booking window, 12 PM through 12 AM" };

    var currentLang = 'es';

    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;

        var titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = pageTitle[lang];

        var dialEl = document.getElementById('dial-svg');
        if (dialEl) dialEl.setAttribute('aria-label', dialAria[lang]);

        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            if (translations[key]) { el.textContent = translations[key][lang]; }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (translations[key]) { el.placeholder = translations[key][lang]; }
        });

        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
        });
    }

    // ---------- Lógica interna para manejar el envío del Formulario ----------
    function setupBookingForm() {
        var form = document.getElementById('booking-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var formData = new FormData(form);
            var url = 'https://api.web3forms.com/submit';
            var submitBtn = form.querySelector('.submit-btn');
            var captchaError = document.getElementById('captcha-error');

            if (captchaError) {
                captchaError.hidden = true;
            }

            var originalBtnText = submitBtn ? submitBtn.innerText : '...';
            if (submitBtn) {
                submitBtn.innerText = '...';
                submitBtn.disabled = true;
            }

            fetch(url, {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    if (data.success) {
                        form.innerHTML = `
                        <div class="form-success-message" style="text-align: center; padding: 2rem;">
                            <h3 style="color: #fff; margin-bottom: 1rem;" data-i18n="form_success_title">¡Solicitud enviada correctamente!</h3>
                            <p style="color: #ccc;" data-i18n="form_success_text">Gracias por contactar. Revisaré los detalles del evento y te responderé lo antes posible.</p>
                        </div>
                    `;
                        // Forzamos la traducción inmediata del nuevo bloque de éxito inyectado
                        applyLanguage(currentLang);
                    } else {
                        if (captchaError) {
                            captchaError.setAttribute('data-i18n', 'captcha_error');
                            captchaError.textContent = translations['captcha_error'][currentLang];
                            captchaError.hidden = false;
                        }
                        if (submitBtn) {
                            submitBtn.innerText = originalBtnText;
                            submitBtn.disabled = false;
                        }
                    }
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    if (captchaError) {
                        captchaError.setAttribute('data-i18n', 'network_error');
                        captchaError.textContent = translations['network_error'][currentLang];
                        captchaError.hidden = false;
                    }
                    if (submitBtn) {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                });
        });
    }

    // Inicializar manejadores de botones de idioma
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { applyLanguage(btn.getAttribute('data-lang')); });
    });

    // Traducir la página completa por primera vez con el idioma por defecto
    applyLanguage('es');

    // Configurar y preparar el formulario (ahora sí puede leer applyLanguage y currentLang)
    setupBookingForm();
}