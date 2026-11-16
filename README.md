# Generador de Letras

Web de una sola página para crear **nicks y textos con estilo** para juegos (Free Fire, Fortnite, PUBG, Roblox, Minecraft, COD), Discord, Instagram y TikTok. Escribes un nombre y ves al instante 80 versiones decoradas, cada una con su botón de copiar.

## Uso

Abre `index.html` en el navegador (doble clic). No necesita servidor, librerías ni conexión.

## Qué incluye

- **80 estilos** en 5 categorías: Gamer (22 marcos), Decorados (16), Letras raras (9 alfabetos), Efectos (14, con Zalgo en 3 intensidades) y Básicos (19).
- Conversión en tiempo real; con el cuadro vacío se ve «Draco».
- Copiar con el botón o con un clic en la tarjeta (`clipboard.writeText` con respaldo `execCommand`).
- Contador de caracteres visibles (`Intl.Segmenter`): verde ≤ 12, ámbar 13-16 y rojo > 16.
- 🎲 Aleatorio: combina al azar un marco y un estilo de letra.
- Modo oscuro por defecto y modo claro opcional.
- La ñ y las tildes se conservan (NFD + marca combinante) y los huecos de Unicode usan los símbolos de "Letterlike Symbols".

## Tests

```bash
node tests/estilos.test.js
```

Comprueba que hay al menos 50 estilos, que ninguno devuelve caracteres inválidos o vacíos, que todos son deterministas (también el Zalgo) y que la ñ no se pierde.
