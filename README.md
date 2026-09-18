# Portfolio de miniaturas — Joaco XD

Sitio de una sola página inspirado en la estética de [neoworks.site](https://neoworks.site):
fondo negro con humo animado, galería de miniaturas en movimiento continuo, visor a pantalla
completa y parallax en todo el scroll. Todo en español, sin frameworks ni build: HTML, CSS y
JavaScript plano.

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
assets/thumbs/*.webp  Miniaturas para la galería y la grilla (720 px de ancho)
assets/full/*.webp    Las mismas piezas en 1600 px, para el visor a pantalla completa
preview.html          Build de un solo archivo, para abrir sin servidor
build-preview.py      Regenera preview.html desde index.html + assets/
```

## Secciones

1. **Hero** — humo animado con capas de ruido y parallax.
2. **Galería** — 5 columnas (4 en tablet, 3 en mobile) que se mueven solas en direcciones
   alternadas; el scroll las empuja y cambia la inclinación 3D del conjunto. Cada miniatura
   se puede clickear.
3. **Visor a pantalla completa** — al hacer clic sale un destello, la pieza vuela desde su
   posición con desenfoque de movimiento y queda levitando en 3D, con bordes redondeados,
   sombra profunda y un halo del color de la propia imagen. Se mueve con el mouse, se navega
   con las flechas (‹ › o teclado) y se cierra con Escape o clic afuera.
4. **Resultados** — contadores animados al entrar en pantalla.
5. **Servicios**, **Proyectos** (con filtros, también clickeables), **Proceso**.
6. **Reseñas** — dos filas que se desplazan en sentidos opuestos.
7. **Preguntas frecuentes** — acordeón.
8. **Contacto** — formulario con validación que abre el cliente de correo, más links.

El texto de la página no se puede seleccionar (salvo dentro del formulario) y no hay ningún
efecto glitch: las transiciones son de desenfoque y movimiento.

## Qué cambiar para hacerlo tuyo

| Qué | Dónde |
| --- | --- |
| Nombre / logo (`JOACO XD`) | `index.html`, buscá `JOACO XD` (nav, preloader, footer) |
| Textos, títulos y FAQ | `index.html` |
| Email de contacto | `index.html` (link `mailto:`) y `assets/js/main.js` (final del `submit`) |
| Redes (WhatsApp, Instagram, X) | `index.html`, sección `.contact__links` |
| Miniaturas | poné el archivo en `assets/thumbs/` (720 px) y en `assets/full/` (1600 px) con el mismo nombre, y sumá la entrada al array `MEDIA` de `main.js` |
| Títulos, canal y filtros de cada pieza | array `MEDIA` en `assets/js/main.js` (`t` título, `c` canal, `cat` filtro) |
| Reseñas | array `REVIEWS` en `assets/js/main.js` |
| Palabras de la cinta que gira | array `TICKER_WORDS` en `assets/js/main.js` |
| Números de resultados | atributos `data-to` / `data-suffix` en `index.html` |

Las miniaturas son las piezas reales, convertidas a WebP desde los PNG originales:

```bash
cwebp -q 78 -resize 720 0 -m 6 "original.png" -o assets/thumbs/nombre.webp   # galería
cwebp -q 84 -resize 1600 0 -m 6 "original.png" -o assets/full/nombre.webp    # visor
```

Los títulos y los filtros salen de lo que se ve en cada miniatura; cambialos en `MEDIA` cuando
quieras ajustarlos.

## Detalles técnicos

- El humo son dos capas de `feTurbulence` en SVG (como data URI) con `mix-blend-mode: screen`,
  rotando lento; el grano es otra capa de ruido.
- El loop de la galería calcula cuántas miniaturas necesita cada columna según la altura del
  contenedor y duplica el set, así nunca quedan huecos al hacer el wrap.
- La cinta de texto se arma por JavaScript repitiendo las palabras hasta superar el ancho de la
  pantalla y triplicando ese bloque: el desplazamiento vuelve a cero justo cuando la copia
  siguiente ya está en cuadro, así que nunca se ve un hueco.
- El visor usa FLIP: mide la miniatura, arranca ahí y anima hasta el centro; el desenfoque va
  por una animación aparte para no pelearse con el transform.
- Las columnas viven en una capa 3D animada y a veces el navegador entrega el clic al
  contenedor: por eso el clic también se resuelve por coordenadas con `elementsFromPoint`.
- Un solo `requestAnimationFrame` maneja galería, parallax y reseñas; el scroll se suaviza con
  interpolación para que el empuje no sea brusco.
- Respeta `prefers-reduced-motion`: si el sistema pide menos movimiento, se frenan las
  animaciones y los reveals aparecen directo.
