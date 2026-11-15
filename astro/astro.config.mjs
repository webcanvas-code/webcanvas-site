// @ts-check
import { defineConfig } from 'astro/config';

// Strona jest statyczna i wdrażana na zwykły hosting (Apache + contact.php).
// build.format: 'file' zachowuje obecne adresy, np. /realizacje.html.
export default defineConfig({
  site: 'https://web-canvas.pl',
  build: {
    format: 'file',
  },
  trailingSlash: 'ignore',
});
