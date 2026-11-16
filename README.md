# Generador de Letras

Convierte tu texto en **letras con estilo** y copia **miles de símbolos** con un clic. Úsalo en la web: <https://dftii.github.io/conversor_letras/>

*dsgnd by dfti*

## Letras

21 estilos limpios, que funcionan en cualquier sitio que admita Unicode: negrita, cursiva, negrita cursiva, sin serifa (4 variantes), caligráfica, caligráfica negrita, gótica, gótica negrita, doble trazo, monoespaciada, burbujas, burbujas negras, cuadrados, cuadrados negros, entre paréntesis, ancho completo, versalitas y superíndice.

- **Mayúsculas:** como lo escribes, TODO MAYÚSCULAS, todo minúsculas o Tipo Título.
- **Medidor honesto:** cada estilo muestra las letras que ves y las unidades que ocupa de verdad (𝐍 se ve como 1, pero ocupa 2). Elige el límite de tu juego o red (12, 16, 20 o 32) y verás si cabe.
- La ñ, las tildes y los emoji se conservan siempre.
- Buscador, ⭐ favoritos y 🔗 enlace para compartir tu texto (`#t=TuTexto`).

## Símbolos

Más de 2.600 símbolos en 25 categorías: populares, estrellas y flores, corazones, flechas, matemáticos, monedas, números, letras encerradas, tipográficos, formas geométricas, cuadros y bloques, marcas y casillas, manos, ajedrez y juegos, música, clima, zodiaco, religión y cultura, técnicos, griego, braille, emoticonos de texto (kaomoji), separadores decorativos y más.

- Toca un símbolo para **copiarlo** o elige **«Añadir a mi texto»** para ir componiendo y copiar el resultado de una vez.
- **Usados recientemente** guarda los últimos que has usado.
- Abre directamente la sección con `#simbolos`.

## Características

- Un único archivo `index.html`, sin dependencias ni conexión: también funciona descargado y abierto con doble clic.
- Sin rastreo: no hace ninguna petición a internet y lleva una política de seguridad (CSP) estricta.
- Accesible: teclado completo, lectores de pantalla, modo de alto contraste y tema claro u oscuro según tu sistema.
- Adaptada a móvil.

## Desarrollo

```bash
npm test
```

No necesita instalar nada (solo Node 18 o superior). Comprueba los 21 estilos con textos difíciles (ñ, vietnamita, emoji, banderas…), con y sin `Intl.Segmenter`, todos los símbolos y que la CSP coincide con el código. Cada cambio en `main` se publica solo en GitHub Pages si pasan los tests.

Si cambias el `<script>` o el `<style>`, actualiza los hashes de la CSP:

```bash
npm run csp
```

## Licencia

[MIT](LICENSE): puedes usarlo, modificarlo y compartirlo libremente, manteniendo el aviso de copyright.
