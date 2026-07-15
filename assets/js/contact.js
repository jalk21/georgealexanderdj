document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const url = 'https://api.web3forms.com/submit';
    const submitBtn = form.querySelector('.submit-btn');
    const captchaError = document.getElementById('captcha-error');

    captchaError.hidden = true;

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = '...'; // Puedes dejarlo con puntos suspensivos o una clave dinámica
    submitBtn.disabled = true;

    fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // ÉXITO: Inyectamos la estructura con etiquetas data-i18n para que tu sistema las traduzca al momento
                form.innerHTML = `
        <div class="form-success-message" style="text-align: center; padding: 2rem;">
            <h3 style="color: #fff; margin-bottom: 1rem;" data-i18n="form_success_title">¡Solicitud enviada correctamente!</h3>
            <p style="color: #ccc;" data-i18n="form_success_text">Gracias por contactar. Revisaré los detalles del evento y te responderé lo antes posible.</p>
        </div>
      `;

                // Si tu web usa una función global para forzar la traducción del contenido nuevo, la ejecutas aquí.
                // Ej: if (typeof translatePage === 'function') translatePage(form);

            } else {
                // ERROR DE LA API: Restauramos la clave original del captcha o una genérica de error
                captchaError.setAttribute('data-i18n', 'captcha_error');

                // Forzamos al sistema de traducción de tu web a que vuelva a leer este campo
                if (typeof updateElementTranslation === 'function') {
                    updateElementTranslation(captchaError);
                }

                captchaError.hidden = false;
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // ERROR DE RED: Asignamos una etiqueta específica de error de conexión
            captchaError.setAttribute('data-i18n', 'network_error');

            if (typeof updateElementTranslation === 'function') {
                updateElementTranslation(captchaError);
            }

            captchaError.hidden = false;
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
});