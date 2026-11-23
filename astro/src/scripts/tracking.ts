// Pomiar konwersji wspólny dla całej strony.
// 1. Kliknięcia w telefon i e-mail trafiają do dataLayer (GTM -> Google Ads / GA4).
// 2. Źródło wizyty (UTM, gclid, fbclid, strona wejścia, referrer) jest zapamiętywane na czas sesji
//    i dołączane do każdego zapytania z formularza, żeby w mailu było widać, skąd przyszedł klient.

const TRACK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
const STORAGE_KEY = 'wc_utm';

export const pushEvent = (data: Record<string, unknown>) => {
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(data);
};

/** Dane o źródle wizyty z bieżącego adresu, zapisane w sessionStorage. */
export function getTracking(): Record<string, string> {
  const tracking: Record<string, string> = {};
  try { Object.assign(tracking, JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')); } catch {}
  const params = new URLSearchParams(location.search);
  TRACK_KEYS.forEach((k) => { const v = params.get(k); if (v) tracking[k] = v.slice(0, 200); });
  if (!tracking.landing) tracking.landing = location.pathname;
  if (!tracking.referrer && document.referrer && !document.referrer.includes(location.host)) tracking.referrer = document.referrer.slice(0, 200);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracking)); } catch {}
  return tracking;
}

/** Tekst do ukrytego pola `tracking` w formularzu (jedna para klucz=wartość w linii). */
export const trackingText = (t: Record<string, string> = getTracking()) =>
  Object.entries(t).map(([k, v]) => `${k}=${v}`).join('\n');

/** Gdzie na stronie kliknięto link: data-track albo najbliższy obszar strony. */
function locationOf(a: HTMLElement): string {
  const explicit = a.closest<HTMLElement>('[data-track]')?.dataset.track;
  if (explicit) return explicit;
  if (a.closest('header')) return 'header';
  if (a.closest('footer')) return 'footer';
  if (a.closest('#kontakt')) return 'contact';
  return 'content';
}

export function initClickTracking() {
  getTracking(); // zapamiętaj źródło już przy wejściu, nawet jeśli formularz jest na innej podstronie
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    const isPhone = a.href.startsWith('tel:');
    pushEvent({
      event: isPhone ? 'phone_click' : 'email_click',
      link_location: locationOf(a),
      page_path: location.pathname,
    });
  }, { capture: true });
}
