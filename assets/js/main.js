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
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;
        }

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                window.location.href = 'thank-you.html';
            } else {
                if (data.message && data.message.toLowerCase().includes('captcha')) {
                    if (captchaError) {
                        captchaError.hidden = false;
                        captchaError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else {
                    alert('Error al enviar el formulario: ' + (data.message || 'Inténtalo de nuevo.'));
                }
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        })
        .catch(function(err) {
            console.error(err);
            alert('Ocurrió un error de conexión al enviar el formulario.');
            if (submitBtn) {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    });

    form.dataset.listenerAttached = 'true';
};

// ---------- Sistema de Traducciones (i18n) ----------
window.applyLanguage = function(lang) {
    // Actualizar el título de la pestaña del navegador
    
    fetch('assets/i18n/' + lang + '.json')
        .then(function(res) { return res.json(); })
        .then(function(translations) {
            window.translations = translations;
            document.documentElement.lang = lang;
            localStorage.setItem('preferredLanguage', lang);

            // Cambiar título de la página
            if (window.translations['page_title']) {
                document.title = window.translations['page_title'];
            }

            // 1. Texto / HTML estándar
            document.querySelectorAll('[data-i18n]').forEach(function(el) {
                var key = el.getAttribute('data-i18n');
                if (window.translations[key]) {
                    el.innerHTML = window.translations[key];
                }
            });

            // 2. Párrafos de la Bio en HTML (data-i18n-html)
            document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
                var key = el.getAttribute('data-i18n-html');
                if (window.translations[key]) {
                    el.innerHTML = window.translations[key];
                }
            });

            // 3. Alt de imágenes (data-i18n-alt)
            document.querySelectorAll('[data-i18n-alt]').forEach(function(el) {
                var key = el.getAttribute('data-i18n-alt');
                if (window.translations[key]) {
                    el.alt = window.translations[key];
                }
            });

            // 4. Placeholders de formularios (data-i18n-placeholder)
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
                var key = el.getAttribute('data-i18n-placeholder');
                if (window.translations[key]) {
                    el.placeholder = window.translations[key];
                }
            });

            // Actualizar estado activo en botones de idioma
            document.querySelectorAll('.lang-btn').forEach(function(btn) {
                btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
            });

            if (typeof callback === 'function') { callback(); }
        })
        .catch(function(err) {
            console.error('Error loading translation file:', err);
        });
};
// ---------- Listener de Email Anti-Spam ----------
document.addEventListener('click', function(e) {
    var targetLink = e.target.closest('#email-link') || e.target.closest('[data-email-link]');
    if (targetLink) {
        e.preventDefault();
        
        var user = "contact";
        var domain = "georgealexanderdj.com";
        var email = user + "@" + domain;

        // Abrir ventana de redacción de Gmail directamente en la web
        var gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(email);
        window.open(gmailUrl, '_blank');
    }
});

// ---------- Control de Visibilidad del Botón Sticky ----------
function initStickyButton() {
    var stickyBtn = document.getElementById('sticky-booking-btn');
    if (!stickyBtn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            stickyBtn.classList.add('is-visible');
        } else {
            stickyBtn.classList.remove('is-visible');
        }
    });
}

// Inicialización de la página tras cargar los HTMLs
function initPage() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            window.applyLanguage(btn.getAttribute('data-lang'));
        });
    });

    var savedLang = localStorage.getItem('preferredLanguage') || 'es';
    window.applyLanguage(savedLang);

    if (window.setupBookingForm) {
        window.setupBookingForm();
    }

    initStickyButton();
}

document.addEventListener('DOMContentLoaded', function() {
    loadIncludes().then(function() {
        initPage();
    });
});