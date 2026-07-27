(function() {
    // Si la página principal ya gestionó el initPage, simplemente ejecutamos la configuración
    if (typeof setupBookingForm === 'function') {
        setupBookingForm();
    }
})();