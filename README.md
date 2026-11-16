# Generador de Letras

Crea **nicks y textos con estilo** para Free Fire, Fortnite, PUBG, Roblox, Minecraft, COD, Discord, Instagram y TikTok. Escribes un nombre y ves al instante 80 versiones decoradas, listas para copiar.

**Úsalo:** descarga `index.html` y ábrelo con doble clic. Es un único archivo, sin servidor, sin conexión y sin rastreo: no hace ninguna petición a internet.

## Lo que lo hace distinto

- **Medidor honesto de longitud.** Otros generadores cuentan las letras que ves; los juegos suelen contar lo que el texto ocupa de verdad. Una letra «𝐍» se ve como 1, pero ocupa 2 unidades, y un Glitch de 5 letras puede ocupar 68. Cada resultado muestra las dos cifras y un semáforo frente al **límite de tu juego** (12, 16, 20 o 32): ✓ cabe · ⚠ se ve corto, pero ocupa más de lo permitido · ✕ demasiado largo.
- **No rompe nada.** La ñ y las tildes se conservan, los emoji (👨‍👩‍👧, 🇪🇸, 1️⃣) pasan intactos, no se mezclan letras que se escriben de derecha a izquierda (que desordenan el nick) y lo que copias es exactamente lo que ves.
- **Accesible:** se maneja con teclado, funciona con lectores de pantalla (anuncian «"Peña" con estilo Fraktur» en vez de deletrear símbolos), en modo de alto contraste y con buen contraste en ambos temas.
- **Seguro:** política de seguridad de contenido (CSP) estricta, que bloquea cualquier script o conexión que no sea el propio archivo.

## Funciones

- 80 estilos: Gamer (22 marcos tipo ꧁༒☬NICK☬༒꧂), Decorados (16), Letras raras (9), Efectos (14, con Glitch/Zalgo en 3 intensidades) y Básicos (19).
- Buscador de estilos, ⭐ favoritos (se guardan en tu navegador) y 🎲 combinación aleatoria.
- 🔗 Compartir: copia un enlace que abre la página con tu texto (`index.html#t=TuNick`).
- Copiar con el botón o tocando la tarjeta; pegar con un botón.
- Tema claro u oscuro según tu sistema, con interruptor.

## Publicarlo en la web

En GitHub: *Settings → Pages → Deploy from a branch → `main` / root*. La página quedará en `https://<usuario>.github.io/<repositorio>/`.

## Desarrollo

```bash
npm test
```

No necesita instalar nada (solo Node 18 o superior). Comprueba los 80 estilos con 14 textos difíciles (ñ, vietnamita, emoji, banderas…), con y sin `Intl.Segmenter`, y que la CSP coincide con el código.

Si cambias el `<script>` o el `<style>`, actualiza los hashes de la CSP:

```bash
npm run csp
```
