"""Genera preview.html: un unico archivo con el CSS, el JS y las miniaturas embebidas.

Uso: python3 build-preview.py
"""
import base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
html = open(f"{ROOT}/index.html").read()
css  = open(f"{ROOT}/assets/css/style.css").read()
js   = open(f"{ROOT}/assets/js/main.js").read()

# miniaturas -> data URIs
uris = []
for i in range(1, 21):
    raw = open(f"{ROOT}/assets/thumbs/{i:02d}.svg", "rb").read()
    uris.append("data:image/svg+xml;base64," + base64.b64encode(raw).decode())

old = """  var THUMBS = [];
  for (var i = 1; i <= 20; i++) THUMBS.push('assets/thumbs/' + (i < 10 ? '0' + i : i) + '.svg');"""
assert old in js, "no se encontró el bloque THUMBS"
new = "  var THUMBS = [\n" + ",\n".join("    '" + u + "'" for u in uris) + "\n  ];"
js = js.replace(old, new)

# inline de css y js
html = html.replace('<link rel="stylesheet" href="assets/css/style.css" />',
                    "<style>\n" + css + "\n</style>")
html = html.replace('<script src="assets/js/main.js"></script>',
                    "<script>\n" + js + "\n</script>")
assert "assets/css" not in html and "assets/js" not in html and "assets/thumbs" not in html

# nota para quien abra el archivo
html = html.replace("<head>", "<head>\n<!-- Archivo unico autocontenido: generado desde index.html + assets/. "
                              "Para editar, toca los originales y regenera con build-preview.py -->", 1)

open(f"{ROOT}/preview.html", "w").write(html)
print("preview.html", round(os.path.getsize(f"{ROOT}/preview.html") / 1024), "KB")
