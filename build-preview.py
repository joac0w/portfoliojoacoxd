"""Genera preview.html: un unico archivo con el CSS, el JS y las miniaturas embebidas.

Uso: python3 build-preview.py
"""
import base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
html = open(f"{ROOT}/index.html").read()
css  = open(f"{ROOT}/assets/css/style.css").read()
js   = open(f"{ROOT}/assets/js/main.js").read()

# miniaturas -> data URIs (galería y visor)
def data_uri(path):
    return "data:image/webp;base64," + base64.b64encode(open(path, "rb").read()).decode()

embed = {}
for name in sorted(os.listdir(f"{ROOT}/assets/thumbs")):
    embed["t:" + os.path.splitext(name)[0]] = data_uri(f"{ROOT}/assets/thumbs/{name}")
for name in sorted(os.listdir(f"{ROOT}/assets/full")):
    embed["f:" + os.path.splitext(name)[0]] = data_uri(f"{ROOT}/assets/full/{name}")

old = """  var thumbOf = function (i) { return 'assets/thumbs/' + MEDIA[i].s + '.webp'; };
  var fullOf = function (i) { return 'assets/full/' + MEDIA[i].s + '.webp'; };"""
assert old in js, "no se encontro el bloque de rutas de miniaturas"
new = ("  var EMBED = {\n" +
       ",\n".join("    '" + k + "': '" + v + "'" for k, v in embed.items()) +
       "\n  };\n" +
       "  var thumbOf = function (i) { return EMBED['t:' + MEDIA[i].s]; };\n" +
       "  var fullOf = function (i) { return EMBED['f:' + MEDIA[i].s]; };")
js = js.replace(old, new)

# logo e iconos de herramientas -> data URIs
html = html.replace("assets/brand/joaco-logo.webp", data_uri(f"{ROOT}/assets/brand/joaco-logo.webp"))
for name in sorted(os.listdir(f"{ROOT}/assets/logos")):
    svg = open(f"{ROOT}/assets/logos/{name}", "rb").read()
    html = html.replace(
        f"assets/logos/{name}",
        "data:image/svg+xml;base64," + base64.b64encode(svg).decode())

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
