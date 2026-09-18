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
