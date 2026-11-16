// Comprueba que la Content-Security-Policy de index.html coincide con su <script> y su <style>.
// Si cambias el código, ejecuta `node tests/csp.test.js --fix` para actualizar los hashes.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const archivo = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(archivo, "utf8");
const hash = s => "'sha256-" + crypto.createHash("sha256").update(s.replace(/\r\n?/g, "\n"), "utf8").digest("base64") + "'";
const interior = (etiqueta) => {
  const ini = html.indexOf(`<${etiqueta}>`) + etiqueta.length + 2;
  return html.slice(ini, html.indexOf(`</${etiqueta}>`, ini));
};
const politica = () => [
  "default-src 'none'",
  `script-src ${hash(interior("script"))}`,
  `style-src ${hash(interior("style"))}`,
  "img-src 'none'", "connect-src 'none'", "font-src 'none'", "object-src 'none'",
  "base-uri 'none'", "form-action 'none'",
].join("; ");

const META = /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/;
let fallos = 0;
const fallo = m => { fallos++; console.error("✗ " + m); };

if ((html.match(/<script\b/g) || []).length !== 1) fallo("Debe haber un único <script>");
if ((html.match(/<style\b/g) || []).length !== 1) fallo("Debe haber un único <style>");
if (/\son[a-z]+\s*=/i.test(html.replace(/<script>[\s\S]*<\/script>/, ""))) fallo("Hay atributos on*= en el HTML (la CSP los bloquearía)");
if (/\sstyle\s*=\s*"/i.test(html)) fallo("Hay atributos style=\"…\" (la CSP los bloquearía)");

const esperada = politica();
if (process.argv.includes("--fix")) {
  if (!META.test(html)) fallo("Falta el <meta> de la CSP");
  else {
    html = html.replace(META, `<meta http-equiv="Content-Security-Policy" content="${esperada}">`);
    fs.writeFileSync(archivo, html);
    console.log("CSP actualizada.");
  }
} else {
  const m = META.exec(html);
  if (!m) fallo("Falta el <meta> de la CSP");
  else if (m[1] !== esperada) fallo("La CSP no coincide con el código. Ejecuta: node tests/csp.test.js --fix");
}
if (!fallos) console.log("✓ CSP correcta");
process.exit(fallos ? 1 : 0);
