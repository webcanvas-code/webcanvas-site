/*
 * WebCanvas – baner zgody na cookies + Google Consent Mode v2.
 *
 * Domyślny stan zgody ("denied") ustawia skrypt inline w <head> każdej strony,
 * PRZED załadowaniem Google Tag Managera. Ten plik tylko pokazuje baner
 * i aktualizuje zgodę po decyzji użytkownika.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'wc_consent'; // 'granted' | 'denied'
    var GRANTED = {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
    };
    var DENIED = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
    };

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    function readChoice() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function saveChoice(value) {
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* tryb prywatny */ }
        try { localStorage.removeItem('cookieConsent'); } catch (e) { /* stary klucz */ }
    }

    // Usuwa cookies Google Analytics i Piksela Meta po wycofaniu zgody.
    function clearAnalyticsCookies() {
        var host = location.hostname.replace(/^www\./, '');
        document.cookie.split(';').forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (/^(_ga|_gid|_gat|_gcl_|_fbp|_fbc)/.test(name)) {
                ['', host, '.' + host].forEach(function (domain) {
                    document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
                });
            }
        });
    }

    var css =
        '#wc-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:520px;' +
        'background:#fffdfa;color:#4d443e;border:1px solid rgba(26,21,19,.12);border-radius:20px;' +
        'box-shadow:0 30px 60px -24px rgba(26,21,19,.35);padding:24px;' +
        'font:15px/1.6 "Onest Variable",Onest,system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-direction:column;gap:20px;' +
        'transform:translateY(calc(100% + 32px));opacity:0;transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .3s}' +
        '#wc-cookie-banner.wc-show{transform:none;opacity:1}' +
        '#wc-cookie-banner p{margin:0}' +
        '#wc-cookie-banner strong{color:#1a1513;display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:17px;font-weight:620;letter-spacing:-.01em}' +
        '#wc-cookie-banner strong:before{content:"";width:8px;height:8px;border-radius:2px;background:#e11d48;transform:rotate(45deg)}' +
        '#wc-cookie-banner a{color:#be123c;font-weight:500;text-underline-offset:3px}' +
        '#wc-cookie-banner .wc-btns{display:flex;gap:10px;flex-wrap:wrap}' +
        '#wc-cookie-banner button{flex:1 1 140px;min-height:48px;padding:0 22px;border-radius:999px;font:580 15px/1.2 inherit;cursor:pointer;' +
        'border:1px solid rgba(26,21,19,.22);transition:background-color .2s,color .2s,border-color .2s,transform .2s}' +
        '#wc-cookie-banner button:active{transform:translateY(1px) scale(.985)}' +
        '#wc-cookie-banner .wc-reject{background:transparent;color:#1a1513}' +
        '#wc-cookie-banner .wc-reject:hover{border-color:#1a1513;background:rgba(26,21,19,.04)}' +
        '#wc-cookie-banner .wc-accept{background:#e11d48;border-color:#e11d48;color:#fff}' +
        '#wc-cookie-banner .wc-accept:hover{background:#be123c;border-color:#be123c}' +
        '#wc-cookie-banner button:focus-visible,#wc-cookie-banner a:focus-visible{outline:2px solid #e11d48;outline-offset:3px}' +
        '@media (min-width:640px){#wc-cookie-banner{left:24px;right:auto;bottom:24px}}' +
        '@media (prefers-reduced-motion:reduce){#wc-cookie-banner{transition:none}}' +
        '.wc-footer-links{display:inline-flex;gap:16px;align-items:center;flex-wrap:wrap}' +
        '.wc-cookie-settings{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}' +
        '.wc-cookie-settings:hover{color:#f6f1ea}';

    var banner;

    function injectStyle() {
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildBanner() {
        banner = document.createElement('div');
        banner.id = 'wc-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'Zgoda na pliki cookies');
        banner.innerHTML =
            '<div><strong>Pliki cookies</strong>' +
            '<p>Używamy cookies analitycznych (Google Analytics), żeby wiedzieć, jak korzystasz ze strony, ' +
            'oraz marketingowych (Google Ads, Piksel Meta) do mierzenia skuteczności reklam. Włączymy je tylko za Twoją zgodą. ' +
            'Decyzję możesz zmienić w każdej chwili w stopce („Ustawienia cookies”). ' +
            '<a href="/polityka-prywatnosci.html#cookies">Polityka prywatności</a></p></div>' +
            '<div class="wc-btns">' +
            '<button type="button" class="wc-reject">Odrzuć</button>' +
            '<button type="button" class="wc-accept">Akceptuję</button>' +
            '</div>';

        banner.querySelector('.wc-accept').addEventListener('click', function () { decide(true); });
        banner.querySelector('.wc-reject').addEventListener('click', function () { decide(false); });
        document.body.appendChild(banner);
    }

    function show() {
        if (!banner) buildBanner();
        banner.style.display = 'flex';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { banner.classList.add('wc-show'); });
        });
    }

    function hide() {
        if (!banner) return;
        banner.classList.remove('wc-show');
        setTimeout(function () { banner.style.display = 'none'; }, 300);
    }

    function decide(accepted) {
        var previous = readChoice();
        saveChoice(accepted ? 'granted' : 'denied');
        gtag('consent', 'update', accepted ? GRANTED : DENIED);
        if (accepted) {
            window.dataLayer.push({ event: 'cookie_consent_update' });
            if (window.wcMetaPixel) window.wcMetaPixel.enable();
        } else {
            clearAnalyticsCookies();
            // Wycofanie wcześniej udzielonej zgody: przeładowanie zatrzymuje już działające tagi.
            if (previous === 'granted') {
                location.reload();
                return;
            }
        }
        hide();
    }

    // Link „Ustawienia cookies” obok „Polityka prywatności” w stopce.
    function addSettingsLink() {
        var links = document.querySelectorAll('footer a[href="polityka-prywatnosci.html"]');
        Array.prototype.forEach.call(links, function (link) {
            var wrap = document.createElement('span');
            wrap.className = 'wc-footer-links';
            link.parentNode.insertBefore(wrap, link);
            wrap.appendChild(link);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = link.className + ' wc-cookie-settings';
            btn.textContent = 'Ustawienia cookies';
            btn.addEventListener('click', show);
            wrap.appendChild(btn);
        });
    }

    window.wcCookies = { open: show };

    function init() {
        injectStyle();
        addSettingsLink();
        if (!readChoice()) show();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
