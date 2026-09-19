# Banner del link (Open Graph)

Esta es la imagen que sale cuando pegás el link del sitio en Discord, WhatsApp,
X, Telegram, etc.

## Cambiarla

Reemplazá `banner.png` por tu diseño, con el mismo nombre. Medida recomendada:
**1200 × 630** (o cualquier cosa cerca de 1.9:1). Mínimo 600 × 315, si no algunas
plataformas la muestran chiquita al costado en vez de grande abajo.

Si cambiás la medida, actualizá también estas dos líneas del `index.html`:

```html
<meta property="og:image:width" content="722" />
<meta property="og:image:height" content="372" />
```

## Ponerle un GIF animado

1. Exportá el GIF y guardalo acá como `banner.gif`.
2. En `index.html`, cambiá las dos líneas que terminan en `banner.png` por
   `banner.gif` (son `og:image` y `twitter:image`).
3. Actualizá `og:image:width` / `og:image:height` con la medida del GIF.

**Dónde se anima y dónde no:**

| Plataforma | Qué hace con el GIF |
| --- | --- |
| Discord | lo anima |
| Telegram | lo anima |
| X / Twitter | muestra el primer cuadro, quieto |
| WhatsApp | muestra el primer cuadro, quieto |
| Facebook / LinkedIn | muestran el primer cuadro, quieto |

Por eso conviene que **el primer cuadro del GIF ya se entienda solo**: que tenga el
nombre y lo que hacés, sin depender de la animación.

**Peso:** que no pase de 8 MB, y si podés dejalo abajo de 3 MB. Un GIF de 720 px de
ancho, 12–15 fps y 2–4 segundos entra cómodo. Si pesa mucho, Discord no lo anima.

## Ojo con el caché

Discord se guarda la tarjeta del link por un rato largo. Si ya compartiste el link
antes del cambio, te va a seguir mostrando la vieja. Para forzar la nueva, pegá el
link con algo al final: `https://tu-sitio.netlify.app/?v=2`.
