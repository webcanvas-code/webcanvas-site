// Kopiuje zbudowaną stronę (astro/dist) do katalogu głównego repozytorium,
// który hosting pobiera z gałęzi master i serwuje jako stronę.
// Użycie (z katalogu astro/): npm run publish
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const ROOT = path.resolve('..');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Brak dist/index.html. Najpierw uruchom: npm run build');
  process.exit(1);
}

// 1. Usuń z katalogu głównego wygenerowane wcześniej pliki, których nie ma już w nowym buildzie:
//    strony .html i folder _astro (pliki z hashami w nazwach).
const removed = [];
for (const name of fs.readdirSync(ROOT)) {
  const isPage = name.endsWith('.html');
  if ((isPage && !fs.existsSync(path.join(DIST, name))) || name === '_astro') {
    fs.rmSync(path.join(ROOT, name), { recursive: true, force: true });
    if (name !== '_astro') removed.push(name);
  }
}

// 2. Skopiuj cały build (nadpisując istniejące pliki).
fs.cpSync(DIST, ROOT, { recursive: true, force: true });

const pages = fs.readdirSync(DIST).filter((f) => f.endsWith('.html')).length;
console.log(`Opublikowano ${pages} stron w katalogu głównym repozytorium.`);
if (removed.length) console.log('Usunięte stare strony:', removed.join(', '));
console.log('Teraz zrób commit i push na master, hosting pobierze zmiany.');
