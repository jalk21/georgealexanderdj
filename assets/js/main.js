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

// Global scope para setupBookingForm por si contact.js u otros scripts la llaman
window.setupBookingForm = function() {
    var form = document.getElementById('booking-form');
    if (!form || form.dataset.listenerAttached) return;

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
                    if (typeof window.applyLanguage === 'function') {
                        window.applyLanguage(window.currentLang || 'es');
                    }
                } else {
                    if (captchaError) {
                        captchaError.setAttribute('data-i18n', 'captcha_error');
                        captchaError.textContent = (window.translations && window.translations['captcha_error']) || '';
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
                    captchaError.textContent = (window.translations && window.translations['network_error']) || '';
                    captchaError.hidden = false;
                }
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
    });

    form.dataset.listenerAttached = "true";
};

// Global scope para variables compartidas de traducción
window.translations = {};
window.currentLang = 'es';

window.applyLanguage = function(lang, callback) {
    window.currentLang = lang;
    document.documentElement.lang = lang;

    var pageTitle = { es: "George Alexander DJ — Reservas 12h – 00h", en: "George Alexander DJ — Booking 12 PM – 12 AM" };
    var dialAria = { es: "Vinilo que marca el horario de reservas, de 12h a 00h", en: "Vinyl dial marking the booking window, 12 PM through 12 AM" };

    fetch('assets/lang/' + lang + '.json')
        .then(function(res) {
            if (!res.ok) { throw new Error('Failed to load language file: ' + lang); }
            return res.json();
        })
        .then(function(data) {
            window.translations = data;

            var titleEl = document.getElementById('page-title');
            if (titleEl) titleEl.textContent = pageTitle[lang];

            var dialEl = document.getElementById('dial-svg');
            if (dialEl) dialEl.setAttribute('aria-label', dialAria[lang]);

            document.querySelectorAll('[data-i18n]').forEach(function(el) {
                var key = el.getAttribute('data-i18n');
                if (window.translations[key]) { el.textContent = window.translations[key]; }
            });

            document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
                var key = el.getAttribute('data-i18n-html');
                if (window.translations[key]) { el.innerHTML = window.translations[key]; }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
                var key = el.getAttribute('data-i18n-placeholder');
                if (window.translations[key]) { el.placeholder = window.translations[key]; }
            });

            document.querySelectorAll('.lang-btn').forEach(function(btn) {
                btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
            });

            if (typeof callback === 'function') { callback(); }
        })
        .catch(function(err) {
            console.error('Error loading translation file:', err);
        });
};

// ---------- Listener de Email Anti-Spam (Escuchando globalmente) ----------
document.addEventListener('click', function(e) {
    var targetLink = e.target.closest('#email-link') || e.target.closest('[data-email-link]');
    if (targetLink) {
        e.preventDefault();
        var user = "contact";
        var domain = "georgealexanderdj.com";
        window.location.href = "mailto:" + user + "@" + domain;
    }
});

// Inicialización de la página tras cargar los HTMLs
function initPage() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            window.applyLanguage(btn.getAttribute('data-lang'));
        });
    });

    window.applyLanguage('es', window.setupBookingForm);
}

// Iniciar carga de includes y posteriomente la lógica de la página
loadIncludes().then(initPage);