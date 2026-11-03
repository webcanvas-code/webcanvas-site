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

    // Usuwa cookies Google Analytics po wycofaniu zgody.
    function clearAnalyticsCookies() {
        var host = location.hostname.replace(/^www\./, '');
        document.cookie.split(';').forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (/^(_ga|_gid|_gat|_gcl_)/.test(name)) {
                ['', host, '.' + host].forEach(function (domain) {
                    document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
                });
            }
        });
    }

    var css =
        '#wc-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:960px;margin:0 auto;' +
        'background:#fff;color:#404040;border:1px solid #e5e5e5;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.12);' +
        'padding:20px;font:14px/1.55 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-direction:column;gap:16px;' +
        'transform:translateY(calc(100% + 32px));transition:transform .3s ease}' +
        '#wc-cookie-banner.wc-show{transform:none}' +
        '#wc-cookie-banner p{margin:0}' +
        '#wc-cookie-banner strong{color:#000;display:block;margin-bottom:4px;font-size:15px}' +
        '#wc-cookie-banner a{color:#e11d48;font-weight:500;text-decoration:underline}' +
        '#wc-cookie-banner .wc-btns{display:flex;gap:12px;flex-wrap:wrap}' +
        '#wc-cookie-banner button{flex:1 1 140px;padding:10px 20px;border-radius:10px;font:500 14px/1.2 inherit;cursor:pointer;' +
        'border:1px solid #e11d48;transition:background-color .2s,color .2s}' +
        '#wc-cookie-banner .wc-reject{background:#fff;color:#e11d48}' +
        '#wc-cookie-banner .wc-reject:hover{background:#fff1f2}' +
        '#wc-cookie-banner .wc-accept{background:#e11d48;color:#fff}' +
        '#wc-cookie-banner .wc-accept:hover{background:#be123c;border-color:#be123c}' +
        '#wc-cookie-banner button:focus-visible{outline:2px solid #000;outline-offset:2px}' +
        '@media (min-width:768px){#wc-cookie-banner{flex-direction:row;align-items:center;padding:20px 24px}' +
        '#wc-cookie-banner .wc-btns{flex-shrink:0;flex-wrap:nowrap}}' +
        '.wc-footer-links{display:inline-flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center}' +
        '.wc-cookie-settings{background:none;border:0;padding:0;font-family:inherit;cursor:pointer}';

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
            'oraz marketingowych do mierzenia skuteczności reklam. Włączymy je tylko za Twoją zgodą. ' +
            'Decyzję możesz zmienić w każdej chwili w stopce („Ustawienia cookies”). ' +
            '<a href="polityka-prywatnosci.html#cookies">Polityka prywatności</a></p></div>' +
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
