# Portfolio de miniaturas — Joaco XD

Sitio de una sola página: header blanco con el wordmark y las herramientas cortadas al ras del
marco, galería de miniaturas en movimiento continuo, visor a pantalla completa y un embudo con
calendario para agendar reuniones. Todo en español, sin frameworks ni build: HTML, CSS y
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
assets/brand/         El logo (la cara) que acompaña al wordmark
assets/logos/*.svg    Íconos de Premiere, After Effects, Photoshop y CapCut
assets/thumbs/*.webp  Miniaturas para la galería y la grilla (720 px de ancho)
assets/full/*.webp    Las mismas piezas en 1600 px, para el visor a pantalla completa
preview.html          Build de un solo archivo, para abrir sin servidor
build-preview.py      Regenera preview.html desde index.html + assets/
```

## Secciones

1. **Header blanco** — el wordmark *joaco* con el logo al lado (más grande que el texto), el
   claim *+6 años de experiencia real* y, abajo, una pared gris que sube desde el marco
   inferior. Los íconos de Premiere, After Effects, Photoshop y CapCut quedan apoyados contra
   esa pared, cruzados por la línea del marco a media altura, con rotación 3D que sigue al
   mouse, sombra de estudio proyectada y un halo del color de cada app.
2. **Galería** — 5 columnas (4 en tablet, 3 en mobile) que se mueven solas en direcciones
   alternadas; el scroll las empuja y cambia la inclinación 3D del conjunto. Cada miniatura se
   puede clickear.
3. **Visor a pantalla completa** — destello al hacer clic, vuelo desde la posición de la
   miniatura con desenfoque de movimiento, y la pieza queda levitando en 3D con bordes
   redondeados, sombra profunda y un halo tomado de la propia imagen. Flechas, teclado y Escape.
4. **todas mis miniaturas** — el título entra en 3D y después acompaña al mouse. Debajo, las
   categorías (Faceless / Gaming, IRL, y las que vengan) y la grilla completa.
5. **Reseñas** y **Preguntas frecuentes**.
6. **Contacto** — embudo de tres pasos: qué necesita, calendario para elegir día y horario, y
   sus datos. Al confirmar se arma el correo con todo el detalle.

Todo lo que entra en pantalla aparece con fade y desenfoque, y al scrollear rápido la grilla y
las preguntas toman un desenfoque de movimiento que se disuelve al frenar.

El texto de la página no se puede seleccionar (salvo dentro de los campos del embudo) y no hay
ningún efecto glitch.

## Qué cambiar para hacerlo tuyo

| Qué | Dónde |
| --- | --- |
| Nombre / wordmark (`joaco`) | `index.html`, buscá `joaco` (nav, preloader, hero, footer) |
| Logo de la cara | reemplazá `assets/brand/joaco-logo.webp` |
| Íconos de herramientas | reemplazá los SVG de `assets/logos/` por los oficiales (mismo nombre) |
| Horarios y días de la agenda | `SLOTS` en `assets/js/main.js` (los fines de semana y los días pasados ya se bloquean solos) |
| Textos, títulos y FAQ | `index.html` |
| Email de contacto | `index.html` (link `mailto:`) y `assets/js/main.js` (final del embudo) |
| Redes (WhatsApp, Instagram, X) | `index.html`, sección `.contact__links` |
| Miniaturas | poné el archivo en `assets/thumbs/` (720 px) y en `assets/full/` (1600 px) con el mismo nombre, y sumá la entrada al array `MEDIA` de `main.js` |
| Títulos, canal y categoría de cada pieza | array `MEDIA` en `assets/js/main.js` (`t` título, `c` canal, `cat` categoría: `faceless` o `irl`) |
| Categorías nuevas (Finanzas, IA…) | en `index.html` sacá el `disabled` y la clase `is-soon` del chip y ponele `data-filter="finanzas"`; después usá ese mismo valor en el `cat` de las piezas |
| Reseñas | array `REVIEWS` en `assets/js/main.js` |
| Preguntas del embudo | bloques `.opts` en `index.html` (el `data-group` es la clave que se guarda) |
| Palabras de la cinta que gira | array `TICKER_WORDS` en `assets/js/main.js` |
| Números de resultados | atributos `data-to` / `data-suffix` en `index.html` |

Las miniaturas son las piezas reales, convertidas a WebP desde los PNG originales:

```bash
cwebp -q 78 -resize 720 0 -m 6 "original.png" -o assets/thumbs/nombre.webp   # galería
cwebp -q 84 -resize 1600 0 -m 6 "original.png" -o assets/full/nombre.webp    # visor
```

Los títulos y los filtros salen de lo que se ve en cada miniatura; cambialos en `MEDIA` cuando
quieras ajustarlos.

## Dos cosas para tener en cuenta

- **El calendario no reserva de verdad.** Es el embudo: guarda lo que elige la persona y arma un
  correo con la fecha, el horario y el detalle del proyecto. Si querés que bloquee tu agenda de
  verdad, el paso siguiente es embeber Cal.com o Calendly en el paso 2, o mandar los datos a un
  formulario tipo Formspree.
- **Los íconos de las apps** están recortados del archivo 3D que pasaste, uno por app, con fondo
  transparente. Para cambiarlos, pisá los `.webp` de `assets/logos/` con el mismo nombre.
- **La tipografía del wordmark es Space Grotesk**, que es lo más parecido a Clash Display que hay
  en Google Fonts. Si querés la Clash Display real, sumá el link de Fontshare en el `<head>` y
  cambiá `'Space Grotesk'` por `'Clash Display'` en `style.css`.

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
- La barra de navegación cambia sola a su versión clara mientras el header blanco está en
  pantalla y vuelve a la oscura al pasar a la galería.
- El desenfoque de movimiento del scroll se cuantiza a medio píxel y sólo corre en escritorio,
  para no repintar de más.
- Las columnas viven en una capa 3D animada y a veces el navegador entrega el clic al
  contenedor: por eso el clic también se resuelve por coordenadas con `elementsFromPoint`.
- Un solo `requestAnimationFrame` maneja galería, parallax y reseñas; el scroll se suaviza con
  interpolación para que el empuje no sea brusco.
- Respeta `prefers-reduced-motion`: si el sistema pide menos movimiento, se frenan las
  animaciones y los reveals aparecen directo.
