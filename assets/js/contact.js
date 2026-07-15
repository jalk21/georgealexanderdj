function setupBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return; // Si no está en esta página, salimos sin romper nada

    // --- NUEVO: Forzamos la traducción del formulario nada más cargarse ---
    if (typeof applyLanguage === 'function' && typeof currentLang !== 'undefined') {
        applyLanguage(currentLang);
    } else if (typeof applyLanguage === 'function') {
        // Por si acaso 'currentLang' no está declarada globalmente, usamos el idioma por defecto
        applyLanguage('es');
    }
    // ----------------------------------------------------------------------

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const url = 'https://api.web3forms.com/submit';
        const submitBtn = form.querySelector('.submit-btn');
        const captchaError = document.getElementById('captcha-error');

        if (captchaError) {
            captchaError.hidden = true;
        }

        const originalBtnText = submitBtn ? submitBtn.innerText : '...';
        if (submitBtn) {
            submitBtn.innerText = '...';
            submitBtn.disabled = true;
        }

        fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    form.innerHTML = `
                    <div class="form-success-message" style="text-align: center; padding: 2rem;">
                        <h3 style="color: #fff; margin-bottom: 1rem;" data-i18n="form_success_title">¡Solicitud enviada correctamente!</h3>
                        <p style="color: #ccc;" data-i18n="form_success_text">Gracias por contactar. Revisaré los detalles del evento y te responderé lo antes posible.</p>
                    </div>
                `;

                    // Volvemos a traducir tras inyectar el mensaje de éxito
                    if (typeof applyLanguage === 'function' && typeof currentLang !== 'undefined') {
                        applyLanguage(currentLang);
                    }

                } else {
                    if (captchaError) {
                        captchaError.setAttribute('data-i18n', 'captcha_error');
                        if (typeof updateElementTranslation === 'function') {
                            updateElementTranslation(captchaError);
                        }
                        captchaError.hidden = false;
                    }
                    if (submitBtn) {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);

                if (captchaError) {
                    captchaError.setAttribute('data-i18n', 'network_error');
                    if (typeof updateElementTranslation === 'function') {
                        updateElementTranslation(captchaError);
                    }
                    captchaError.hidden = false;
                }
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
    });
}