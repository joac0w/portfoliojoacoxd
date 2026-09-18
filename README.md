# Portfolio de miniaturas — Joaco XD

Sitio de una sola página inspirado en la estética de [neoworks.site](https://neoworks.site):
fondo negro con humo animado, tipografía grande con efecto *glitch*, galería de miniaturas
en movimiento continuo y parallax en todo el scroll. Todo en español, sin frameworks ni build:
HTML, CSS y JavaScript plano.

## Cómo verlo

Lo más rápido: abrí **`preview.html`** haciendo doble clic. Es el mismo sitio pero en un
solo archivo (CSS, JS y miniaturas embebidas), así que funciona sin servidor y sin internet
—salvo la tipografía, que cae a una de sistema si no hay red.

Para trabajar sobre el código, usá `index.html` con un servidor local:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Se publica tal cual en GitHub Pages, Netlify, Vercel o cualquier hosting estático.

Después de tocar el HTML, el CSS, el JS o las miniaturas, regenerá el archivo único con:

```bash
python3 build-preview.py
```

## Estructura

```
index.html            Marcado de todas las secciones
assets/css/style.css  Estilos, humo, glitch, galería 3D, responsive
assets/js/main.js     Galería infinita, parallax, contadores, filtros, formulario
assets/thumbs/*.svg   20 miniaturas de ejemplo (placeholders generados)
preview.html          Build de un solo archivo, para abrir sin servidor
build-preview.py      Regenera preview.html desde index.html + assets/
```

## Secciones

1. **Hero** — humo animado + título con glitch permanente (se intensifica al pasar el mouse).
2. **Galería** — 5 columnas (4 en tablet, 3 en mobile) que se mueven solas en direcciones
   alternadas; el scroll las empuja y cambia la inclinación 3D del conjunto.
3. **Resultados** — contadores animados al entrar en pantalla.
4. **Servicios**, **Proyectos** (con filtros y glitch RGB al hover), **Proceso**.
5. **Reseñas** — dos filas que se desplazan en sentidos opuestos.
6. **Preguntas frecuentes** — acordeón.
7. **Contacto** — formulario con validación que abre el cliente de correo, más links.

## Qué cambiar para hacerlo tuyo

| Qué | Dónde |
| --- | --- |
| Nombre / logo (`JOACO XD`) | `index.html`, buscá `JOACO XD` (nav, preloader, footer) |
| Textos, títulos y FAQ | `index.html` |
| Email de contacto | `index.html` (link `mailto:`) y `assets/js/main.js` (final del `submit`) |
| Redes (WhatsApp, Instagram, X) | `index.html`, sección `.contact__links` |
| Miniaturas reales | reemplazá los archivos de `assets/thumbs/` (16:9) y ajustá `THUMBS` en `main.js` |
| Proyectos y reseñas | arrays `PROJECTS` y `REVIEWS` en `assets/js/main.js` |
| Números de resultados | atributos `data-to` / `data-suffix` en `index.html` |

Las miniaturas incluidas son **placeholders** generados en SVG: están para que el sitio se vea
completo. Cuando pongas las tuyas, alcanza con respetar el nombre (`01.svg`, `02.svg`, …) o
cambiar la lista `THUMBS` por las rutas de tus archivos (`.jpg`, `.webp`, lo que uses).

## Detalles técnicos

- El humo son dos capas de `feTurbulence` en SVG (como data URI) con `mix-blend-mode: screen`,
  rotando lento; el grano es otra capa de ruido.
- El loop de la galería calcula cuántas miniaturas necesita cada columna según la altura del
  contenedor y duplica el set, así nunca quedan huecos al hacer el wrap.
- Un solo `requestAnimationFrame` maneja galería, parallax y reseñas; el scroll se suaviza con
  interpolación para que el empuje no sea brusco.
- Respeta `prefers-reduced-motion`: si el sistema pide menos movimiento, se frenan las
  animaciones y los reveals aparecen directo.
