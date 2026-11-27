/*
 * WebCanvas – Piksel Meta (zbiór danych „WebCanvas”, ten sam co integracja CRM).
 *
 * Ładuje się TYLKO po zgodzie na cookies marketingowe (localStorage wc_consent = 'granted').
 * Bez zgody nic nie jest pobierane z facebook.net i nie powstają cookies _fbp / _fbc.
 * cookies.js wywołuje window.wcMetaPixel.enable() po kliknięciu „Akceptuję”.
 * Zdarzenie Lead wysyła window.wcMetaPixel.lead() po potwierdzonym wysłaniu formularza.
 */
(function () {
    'use strict';

    var PIXEL_ID = '1635560591155137';
    var loaded = false;

    function hasConsent() {
        try { return localStorage.getItem('wc_consent') === 'granted'; } catch (e) { return false; }
    }

    function load() {
        if (loaded) return;
        loaded = true;
        /* Oficjalny kod bazowy Meta */
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');
    }

    window.wcMetaPixel = {
        enable: load,
        lead: function (params) {
            if (loaded && window.fbq) window.fbq('track', 'Lead', params || {});
        }
    };

    if (hasConsent()) load();
})();
