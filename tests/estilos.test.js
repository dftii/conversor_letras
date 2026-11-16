// Tests sin navegador ni dependencias: ejecuta la lógica de index.html en Node.
// Uso: node tests/estilos.test.js  (o npm test)
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scripts = html.match(/<script\b/g) || [];
let fallos = 0;
const fallo = msg => { fallos++; console.error("✗ " + msg); };
if (scripts.length !== 1) fallo(`index.html debe tener un único <script> (tiene ${scripts.length})`);
const ini = html.indexOf("<script>") + "<script>".length;
const script = html.slice(ini, html.indexOf("</script>", ini));

/** Carga la lógica; con sinSegmenter simula un navegador sin Intl.Segmenter. */
function cargar(sinSegmenter = false) {
  const intl = sinSegmenter ? Object.assign({}, Intl, { Segmenter: undefined }) : Intl;
  const ctx = { Intl: intl, console };
  vm.createContext(ctx);
  vm.runInContext(script + ";globalThis.__ = { ESTILOS, LETRAS, MARCOS, CATEGORIAS, contar, grafemas };", ctx);
  return ctx.__;
}

const { ESTILOS, LETRAS, MARCOS, CATEGORIAS, contar } = cargar();
const porNombre = Object.fromEntries(ESTILOS.map(e => [e.nombre, e]));
const INVALIDO = /\p{Cn}|\p{Co}|\p{Cs}|�/u;
const RTL = /\p{Script=Hebrew}|\p{Script=Arabic}/u;

// Estructura
if (ESTILOS.length !== 80) fallo(`Se esperaban 80 estilos y hay ${ESTILOS.length}`);
const nombres = new Set(ESTILOS.map(e => e.nombre));
if (nombres.size !== ESTILOS.length) fallo("Hay nombres de estilo repetidos");
const cats = new Set(CATEGORIAS.map(c => c.id));
for (const e of ESTILOS) if (!cats.has(e.categoria)) fallo(`${e.nombre}: categoría desconocida ${e.categoria}`);
for (const m of MARCOS) if (!LETRAS[m.letra]) fallo(`Marco ${m.nombre}: letra inexistente ${m.letra}`);
if (/(src|href)\s*=\s*["']?https?:/i.test(html) || /@import|<link\b/i.test(html)) fallo("Hay recursos externos: debe funcionar sin conexión");

// Todos los alfabetos convierten todas las letras salvo las que se dejan a propósito.
const SIN_CAMBIO = {
  versalitas: "xABCDEFGHIJKLMNOPQRSTUVWXYZ", griego: "JLMPQVXZ", ruso: "CDFGIJLQVZ",
  cherokee: "EGIKOTY", moneda: "JQV", katakana: "w", superindice: "",
};
const ABC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (const [id, l] of Object.entries(LETRAS)) {
  const igual = Array.from(ABC).filter(ch => l.fn(ch) === ch).join("");
  const esperado = Array.from(ABC).filter(ch => (SIN_CAMBIO[id] || "").includes(ch)).join("");
  if (igual !== esperado) fallo(`${l.nombre}: letras sin convertir «${igual}», se esperaba «${esperado}»`);
}

// Propiedades con muchas entradas, también casos límite de Unicode.
const ENTRADAS = ["Peña", "Draco", "Ángel Muñoz 99", "xX_Pro_Xx", "ñandú ÑOÑO", "Việt", "Peña",
  "a1️⃣b", "👨‍👩‍👧 Ana", "🇪🇸 Ok", "👍🏽 top", "Pro xy 2026", "cc 22", "straße"];
for (const texto of ENTRADAS) {
  for (const e of ESTILOS) {
    let v;
    try { v = e.convertir(texto); } catch (err) { fallo(`${e.nombre}: lanza con «${texto}»: ${err.message}`); continue; }
    if (!v) fallo(`${e.nombre}: resultado vacío con «${texto}»`);
    if (INVALIDO.test(v)) fallo(`${e.nombre}: carácter inválido en «${v}»`);
    if (RTL.test(v) && !RTL.test(texto)) fallo(`${e.nombre}: mete letras de derecha a izquierda en «${v}»`);
    if (e.convertir(texto) !== v) fallo(`${e.nombre}: no es determinista con «${texto}»`);
    if (!e.nombre.startsWith("Glitch") && v !== v.normalize("NFC")) fallo(`${e.nombre}: salida no normalizada (NFC) con «${texto}»`);
    for (const emoji of ["1️⃣", "👨‍👩‍👧", "🇪🇸", "👍🏽"]) {
      if (texto.includes(emoji) && !v.includes(emoji)) fallo(`${e.nombre}: rompe el emoji ${emoji} («${v}»)`);
    }
  }
}

// La ñ conserva su tilde (en «Al revés» pasa debajo a propósito).
for (const e of ESTILOS) {
  if (e.nombre === "Al revés") continue;
  if (!e.convertir("Peña").normalize("NFD").includes("̃")) fallo(`${e.nombre}: pierde la tilde de la ñ`);
}

// Casos concretos que fallaban
if (contar(porNombre["Estilo japonés"].convertir("cc")) !== 2) fallo("Estilo japonés: «cc» debe contar 2");
if (contar(porNombre["Al revés"].convertir("22")) !== 2) fallo("Al revés: «22» debe contar 2");
if (porNombre["Alternas"].convertir("aß") !== "aß") fallo("Alternas: «aß» no debe cambiar de longitud");
if (porNombre["Alternas"].convertir("nick") !== "nIcK") fallo("Alternas: «nick» debe dar «nIcK»");
const caotico = porNombre["Glitch caótico"].convertir("Draco");
if (/[̀́̓̈́]/.test(caotico)) fallo("Glitch: usa marcas obsoletas");
if (contar(caotico) !== 5) fallo("Glitch caótico: debe contar 5 visibles");

// Sin Intl.Segmenter el contador coincide en lo esencial.
const sin = cargar(true);
for (const e of sin.ESTILOS) {
  for (const texto of ["Peña", "Draco", "👨‍👩‍👧 🇪🇸"]) {
    const a = contar(porNombre[e.nombre].convertir(texto));
    const b = sin.contar(e.convertir(texto));
    if (a !== b) fallo(`Sin Intl.Segmenter, ${e.nombre} con «${texto}» cuenta ${b} y debería ${a}`);
  }
}

console.log(fallos ? `\n${fallos} fallo(s)` : `✓ ${ESTILOS.length} estilos correctos (${ENTRADAS.length} entradas, con y sin Intl.Segmenter)`);
process.exit(fallos ? 1 : 0);
