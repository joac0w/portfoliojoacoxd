# Reels / shorts

Poné acá los videos verticales (9:16) con estos nombres:

```
reel-01.mp4   reel-02.mp4   reel-03.mp4   reel-04.mp4   reel-05.mp4
```

- Formato: **.mp4 (H.264 + AAC)** es lo más compatible. Si tenés `.webm`, guardalo con
  el mismo nombre (`reel-01.webm`) y también lo toma: la página prueba primero el `.mp4`.
- Tamaño: 1080×1920 como máximo y, si podés, menos de 8 MB por pieza, así la página
  sigue abriendo rápido.
- Portada opcional: si guardás `reel-01.jpg` (o `.webp`) se usa como imagen fija antes de
  darle play. Si no hay, se muestra el primer cuadro del video.

Para cambiar los títulos o sumar más piezas, editá el array `REELS` en
`assets/js/main.js`. Mientras falte un archivo, la tarjeta se ve igual pero avisa que
todavía no está cargado.

El build de un solo archivo (`preview.html`) embebe los reels que pesen menos de 3 MB,
hasta 8 MB en total. Los más pesados quedan como archivo aparte: ahí conviene abrir
`index.html` con un servidor local, o subir el sitio a un hosting.

## Subirlos a Netlify

El sitio es estático: los videos viajan con el resto de los archivos, igual que las
miniaturas. Dos formas, según cómo lo publiques.

**1. Arrastrando la carpeta** (app.netlify.com → *Add new site* → *Deploy manually*)

Poné los `.mp4` acá adentro, arrastrá la carpeta entera del proyecto y listo. Para
cambiar un reel: reemplazás el archivo con el mismo nombre y volvés a arrastrar la
carpeta. Cada arrastre es un deploy nuevo y Netlify guarda el anterior, así que si algo
sale mal volvés atrás desde *Deploys*.

**2. Conectando el repo de GitHub** (*Add new site* → *Import an existing project*)

Cada `git push` publica solo. Para cambiar un reel: reemplazás el archivo, commit y push.
Ojo que los videos quedan guardados en el historial de Git para siempre, así que si los
vas a cambiar seguido conviene la opción 3.

**3. Los videos afuera, el sitio en Netlify**

Si los reels pesan mucho o los vas a cambiar seguido, subilos a un storage (Cloudflare
R2, Bunny, Backblaze B2) y poné el link directo en el array `REELS` de
`assets/js/main.js`:

```js
var REELS = [
  { url: 'https://cdn.tudominio.com/reel-01.mp4' },
  { f: 'reel-02' },                                  // este sigue saliendo de esta carpeta
  ...
];
```

Cuando hay `url`, se ignora la carpeta local. Así cambiás el video sin volver a publicar
el sitio: sólo reemplazás el archivo en el storage.

### Límites que conviene tener en cuenta

- Netlify no deja subir archivos de más de **100 MB** cada uno.
- El plan gratis trae **100 GB de tráfico por mes**. Un reel de 8 MB que se mira 1.000
  veces son 8 GB, así que comprimí antes de subir.
- No uses **Git LFS** para los videos: Netlify publica el archivo puntero de LFS en vez
  del video y el reel no carga. Subilos como archivos comunes, o usá la opción 3.
