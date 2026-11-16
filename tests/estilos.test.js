// Test sin navegador: ejecuta la lógica de index.html en Node y comprueba todos los estilos.
// Uso: node tests/estilos.test.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const ctx = { Intl };
vm.createContext(ctx);
vm.runInContext(script + ";globalThis.__E = ESTILOS; globalThis.__contar = contar;", ctx);

const ESTILOS = ctx.__E;
const contar = ctx.__contar;
let fallos = 0;
const fallo = msg => { fallos++; console.error("✗ " + msg); };

if (ESTILOS.length < 50) fallo(`Solo hay ${ESTILOS.length} estilos (mínimo 50)`);

for (const texto of ["Peña", "Draco", "Ángel Muñoz 99", "xX_Pro_Xx", "ñandú ÑOÑO"]) {
  for (const e of ESTILOS) {
    const v = e.convertir(texto);
    if (!v) fallo(`${e.nombre}: resultado vacío con «${texto}»`);
    // Sin caracteres sin asignar, de uso privado ni de sustitución (los que salen como "tofu").
    if (/\p{Cn}|\p{Co}|�/u.test(v)) fallo(`${e.nombre}: carácter inválido en «${v}»`);
    if (e.convertir(texto) !== v) fallo(`${e.nombre}: no es determinista con «${texto}»`);
    if (contar(v) < 1) fallo(`${e.nombre}: el contador da 0`);
  }
}

// La ñ se conserva (como ñ o como letra convertida + tilde combinante) en todos menos "Al revés",
// donde la tilde pasa debajo a propósito.
for (const e of ESTILOS) {
  if (e.nombre === "Al revés") continue;
  const v = e.convertir("Peña").normalize("NFD");
  if (!v.includes("̃")) fallo(`${e.nombre}: pierde la tilde de la ñ («${e.convertir("Peña")}»)`);
}

console.log(fallos ? `\n${fallos} fallo(s)` : `✓ ${ESTILOS.length} estilos correctos`);
process.exit(fallos ? 1 : 0);
