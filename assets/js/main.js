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
    // Ahora translations empieza vacío y se rellena dinámicamente con el JSON
    var translations = {};

    var pageTitle = { es: "George Alexander DJ — Reservas 12h – 00h", en: "George Alexander DJ — Booking 12 PM – 12 AM" };
    var dialAria = { es: "Vinilo que marca el horario de reservas, de 12h a 00h", en: "Vinyl dial marking the booking window, 12 PM through 12 AM" };

    var currentLang = 'es';

    function applyLanguage(lang, callback) {
        currentLang = lang;
        document.documentElement.lang = lang;


        fetch('assets/lang/' + lang + '.json')
            .then(function(res) {
                if (!res.ok) { throw new Error('Failed to load language file: ' + lang); }
                return res.json();
            })
            .then(function(data) {
                translations = data; // Almacenamos los textos en memoria

                // Actualizamos elementos globales
                var titleEl = document.getElementById('page-title');
                if (titleEl) titleEl.textContent = pageTitle[lang];

                var dialEl = document.getElementById('dial-svg');
                if (dialEl) dialEl.setAttribute('aria-label', dialAria[lang]);

                // Traducimos textos fijos
                document.querySelectorAll('[data-i18n]').forEach(function(el) {
                    var key = el.getAttribute('data-i18n');
                    if (translations[key]) { el.textContent = translations[key]; }
                });

                document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
                    var key = el.getAttribute('data-i18n-html');
                    if (translations[key]) { el.innerHTML = translations[key]; }
                });

                // Traducimos placeholders
                document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
                    var key = el.getAttribute('data-i18n-placeholder');
                    if (translations[key]) { el.placeholder = translations[key]; }
                });

                // Actualizamos estado visual de los botones del selector
                document.querySelectorAll('.lang-btn').forEach(function(btn) {
                    btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
                });

                // Si hay alguna acción pendiente que dependa de la traducción (como iniciar el form), la ejecutamos
                if (typeof callback === 'function') { callback(); }
            })
            .catch(function(err) {
                console.error('Error loading translation file:', err);
            });
    }

    // ---------- Lógica interna para manejar el envío del Formulario ----------
    function setupBookingForm() {
        var form = document.getElementById('booking-form');
        if (!form || form.dataset.listenerAttached) return; // Evitamos duplicar eventos

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
                            <h3 style="color: #fff; margin-bottom: 1rem;" data-i18n="form_success_title"></h3>
                            <p style="color: #ccc;" data-i18n="form_success_text"></p>
                        </div>
                    `;
                        // Forzamos la re-traducción para rellenar los datos recién inyectados en el HTML
                        applyLanguage(currentLang);
                    } else {
                        if (captchaError) {
                            captchaError.setAttribute('data-i18n', 'captcha_error');
                            captchaError.textContent = translations['captcha_error'] || '';
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
                        captchaError.textContent = translations['network_error'] || '';
                        captchaError.hidden = false;
                    }
                    if (submitBtn) {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                });
        });

        // Marcamos que este formulario ya tiene el listener activo
        form.dataset.listenerAttached = "true";
    }

    // Inicializar manejadores de botones de idioma al hacer clic
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            applyLanguage(btn.getAttribute('data-lang'));
        });
    });

    // Carga inicial: cargamos el JSON de español y, justo cuando termine, levantamos el formulario
    applyLanguage('es', setupBookingForm);
}