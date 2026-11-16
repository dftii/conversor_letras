// Tests sin navegador ni dependencias: ejecuta la lógica de index.html en Node.
// Uso: node tests/estilos.test.js  (o npm test)
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
let fallos = 0;
const fallo = msg => { fallos++; console.error("✗ " + msg); };
const scripts = html.match(/<script\b/g) || [];
if (scripts.length !== 1) fallo(`index.html debe tener un único <script> (tiene ${scripts.length})`);
const ini = html.indexOf("<script>") + "<script>".length;
const script = html.slice(ini, html.indexOf("</script>", ini));

/** Carga la lógica; con sinSegmenter simula un navegador sin Intl.Segmenter. */
function cargar(sinSegmenter = false) {
  const intl = sinSegmenter ? Object.assign({}, Intl, { Segmenter: undefined }) : Intl;
  const ctx = { Intl: intl, console };
  vm.createContext(ctx);
  vm.runInContext(script + ";globalThis.__ = { ESTILOS, MAYUSCULAS, CATEGORIAS_SIMBOLOS, contar, grafemas };", ctx);
  return ctx.__;
}

const { ESTILOS, MAYUSCULAS, CATEGORIAS_SIMBOLOS, contar } = cargar();
const porId = Object.fromEntries(ESTILOS.map(e => [e.id, e]));
const INVALIDO = /\p{Cn}|\p{Co}|\p{Cs}|�/u;

/* ---------- Estructura ---------- */
if (ESTILOS.length < 20) fallo(`Se esperaban al menos 20 estilos y hay ${ESTILOS.length}`);
for (const clave of ["id", "nombre"]) {
  const valores = ESTILOS.map(e => e[clave]);
  if (new Set(valores).size !== valores.length) fallo(`Hay estilos con el mismo ${clave}`);
}
if (/(src|href)\s*=\s*["']?https?:/i.test(html) || /@import|<link\b/i.test(html)) fallo("Hay recursos externos: debe funcionar sin conexión");

/* ---------- Cada estilo convierte todas las letras ---------- */
// Letras que se quedan igual a propósito porque Unicode no tiene equivalente.
const SIN_CAMBIO = { versalitas: "xABCDEFGHIJKLMNOPQRSTUVWXYZ" };
const ABC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (const e of ESTILOS) {
  const igual = Array.from(ABC).filter(ch => e.convertir(ch) === ch).join("");
  const esperado = Array.from(ABC).filter(ch => (SIN_CAMBIO[e.id] || "").includes(ch)).join("");
  if (igual !== esperado) fallo(`${e.nombre}: letras sin convertir «${igual}», se esperaba «${esperado}»`);
  // Cada letra se convierte en un único carácter visible (sin «cosas raras» de varias piezas).
  for (const ch of ABC) {
    const v = e.convertir(ch);
    if (contar(v) !== 1) fallo(`${e.nombre}: «${ch}» da «${v}», que no es un único carácter`);
  }
}

/* ---------- Propiedades con textos difíciles ---------- */
const ENTRADAS = ["Peña", "Draco", "Ángel Muñoz 99", "xX_Pro_Xx", "ñandú ÑOÑO", "Việt", "Peña",
  "a1️⃣b", "👨‍👩‍👧 Ana", "🇪🇸 Ok", "👍🏽 top", "straße", "0123456789"];
for (const texto of ENTRADAS) {
  for (const e of ESTILOS) {
    let v;
    try { v = e.convertir(texto); } catch (err) { fallo(`${e.nombre}: lanza con «${texto}»: ${err.message}`); continue; }
    if (!v) fallo(`${e.nombre}: resultado vacío con «${texto}»`);
    if (INVALIDO.test(v)) fallo(`${e.nombre}: carácter inválido en «${v}»`);
    if (e.convertir(texto) !== v) fallo(`${e.nombre}: no es determinista con «${texto}»`);
    if (v !== v.normalize("NFC")) fallo(`${e.nombre}: salida no normalizada (NFC) con «${texto}»`);
    if (contar(v) !== contar(texto.normalize("NFC"))) fallo(`${e.nombre}: cambia el número de caracteres de «${texto}» («${v}»)`);
    for (const emoji of ["1️⃣", "👨‍👩‍👧", "🇪🇸", "👍🏽"]) {
      if (texto.includes(emoji) && !v.includes(emoji)) fallo(`${e.nombre}: rompe el emoji ${emoji} («${v}»)`);
    }
  }
}

// La ñ conserva su tilde en todos los estilos.
for (const e of ESTILOS) {
  if (!e.convertir("Peña").normalize("NFD").includes("̃")) fallo(`${e.nombre}: pierde la tilde de la ñ`);
}
// Valores concretos de referencia.
const REF = { negrita: "𝐏𝐞𝐧̃𝐚", fraktur: "𝔓𝔢𝔫̃𝔞", doble: "ℙ𝕖𝕟̃𝕒", burbujas: "Ⓟⓔⓝ̃ⓐ", ancho: "Ｐｅｎ̃ａ" };
for (const [id, v] of Object.entries(REF)) {
  if (porId[id].convertir("Peña") !== v) fallo(`${porId[id].nombre}: «Peña» debería dar «${v}» y da «${porId[id].convertir("Peña")}»`);
}

/* ---------- Mayúsculas ---------- */
const casos = { mayus: ["peña straße", "PEÑA STRAßE"], minus: ["PEÑA", "peña"], titulo: ["hola mUNDO", "Hola Mundo"], original: ["PeÑa", "PeÑa"] };
for (const [k, [entrada, salida]] of Object.entries(casos)) {
  const r = MAYUSCULAS[k].fn(entrada);
  if (r !== salida) fallo(`Mayúsculas «${k}»: «${entrada}» da «${r}», se esperaba «${salida}»`);
}

/* ---------- Símbolos ---------- */
let total = 0;
const idsCat = new Set();
for (const c of CATEGORIAS_SIMBOLOS) {
  if (idsCat.has(c.id)) fallo(`Categoría de símbolos repetida: ${c.id}`);
  idsCat.add(c.id);
  if (!c.nombre || !c.desc) fallo(`Categoría ${c.id} sin nombre o descripción`);
  if (c.id !== "recientes" && c.simbolos.length < 8) fallo(`Categoría ${c.nombre}: solo ${c.simbolos.length} símbolos`);
  if (new Set(c.simbolos).size !== c.simbolos.length) fallo(`Categoría ${c.nombre}: símbolos duplicados`);
  for (const s of c.simbolos) {
    if (INVALIDO.test(s) || /[\u0000-\u001F‪-‮⁦-⁩]/.test(s)) fallo(`${c.nombre}: símbolo inválido ${JSON.stringify(s)}`);
    if (!c.anchos && contar(s) !== 1) fallo(`${c.nombre}: «${s}» no es un único símbolo`);
    if (/\p{Script=Hebrew}|\p{Script=Arabic}/u.test(s)) fallo(`${c.nombre}: «${s}» se escribe de derecha a izquierda`);
  }
  total += c.simbolos.length;
}
if (total < 2000) fallo(`Se esperaban más de 2.000 símbolos y hay ${total}`);
for (const id of ["populares", "recientes", "flechas", "estrellas", "monedas", "kaomoji"]) {
  if (!idsCat.has(id)) fallo(`Falta la categoría de símbolos «${id}»`);
}

/* ---------- Sin Intl.Segmenter el contador coincide ---------- */
const sin = cargar(true);
for (const e of sin.ESTILOS) {
  for (const texto of ["Peña", "Draco", "👨‍👩‍👧 🇪🇸"]) {
    const a = contar(porId[e.id].convertir(texto));
    const b = sin.contar(e.convertir(texto));
    if (a !== b) fallo(`Sin Intl.Segmenter, ${e.nombre} con «${texto}» cuenta ${b} y debería ${a}`);
  }
}

console.log(fallos
  ? `\n${fallos} fallo(s)`
  : `✓ ${ESTILOS.length} estilos y ${total} símbolos en ${CATEGORIAS_SIMBOLOS.length} categorías correctos`);
process.exit(fallos ? 1 : 0);
