# Auditoría profesional del «Generador de Letras»

Quiero que audites a fondo este proyecto y me entregues un informe de mejoras y optimizaciones de nivel profesional. En esta sesión **no se implementa nada**: primero el informe y un plan por fases, y yo elijo qué se aplica. Respóndeme siempre en español.

## 1. Qué es el proyecto

Repositorio `dftii/conversor_letras`, rama `main`. Es una web de **una sola página** para crear nicks y textos con estilo Unicode para juegos (Free Fire, Fortnite, PUBG, Roblox, Minecraft, COD), Discord, Instagram y TikTok.

- `index.html` (unas 1.000 líneas): HTML, CSS y JS juntos, sin librerías ni CDN. Tiene que funcionar abriendo el archivo con doble clic (`file://`), sin servidor y sin conexión.
- `README.md`: descripción y uso.
- `tests/estilos.test.js`: extrae el `<script>` de `index.html`, lo ejecuta en un contexto `vm` de Node sin `document` y comprueba los estilos. Se lanza con `node tests/estilos.test.js`.

Piezas principales del código, para que te orientes:

- `ESTILOS`: 80 estilos declarativos `{ nombre, categoria, convertir }` en 5 categorías (gamer, decorados, raras, efectos, básicos).
- `LETRAS`: estilos de letra reutilizables, construidos con `mapeador` (NFD → convierte la letra base → conserva las marcas → NFC), `matematico` (bloque Mathematical Alphanumeric Symbols con los huecos de Letterlike Symbols), `sustitucion` (alfabetos de 26 letras) y `tabla`/`zip`.
- `MARCOS`: `{ antes, despues, letra }` aplicados sobre un estilo de `LETRAS`.
- Efectos: `zalgo` determinista (hash FNV-1a + PRNG mulberry32 con semilla), `invertir` (al revés y espejo, con `GIRO_MARCAS`), `conMarca`, `entreLetras`, `alternas`.
- `grafemas` y `contar` con `Intl.Segmenter` y un respaldo si no existe.
- Interfaz: 80 tarjetas creadas una vez y actualizadas en `render()` en cada evento `input`, pestañas por categoría, tarjeta aleatoria (marco + letra al azar), copiar con `navigator.clipboard` y respaldo `execCommand`, pegar, tema claro/oscuro en `localStorage`, toast con `aria-live`.

## 2. Antes de opinar: conoce el estado base

1. Ejecuta `git status` y `git log --oneline -5`. Si hay cambios sin confirmar, son míos: no los descartes ni los mezcles con nada.
2. Lee **enteros** `index.html`, `README.md` y `tests/estilos.test.js`. Caben de sobra en tu contexto; no trabajes a partir de fragmentos ni de búsquedas sueltas. Lanza las tres lecturas en paralelo.
3. Ejecuta `node tests/estilos.test.js` y anota el resultado (hoy pasa: «✓ 80 estilos correctos»).
4. Comprueba qué herramientas hay: `node -v`, `which playwright chromium google-chrome`, y si Playwright puede lanzar Chromium, Firefox y WebKit. Lo que no esté disponible condiciona qué podrás verificar; dilo en el informe.

## 3. Cómo quiero que trabajes

Usa todo lo que tienes; este encargo lo justifica.

- **Razona a fondo y con esfuerzo alto.** Prefiero pocos hallazgos demostrados a muchos supuestos. Cada afirmación del informe tiene que apoyarse en una línea de código, una salida de comando, una medición o una fuente citada.
- **Modo plan.** Trabaja como en modo plan durante toda la auditoría: no edites `index.html`, el README ni el test. Los scripts de medición y las capturas van al directorio temporal de la sesión, no al repositorio.
- **Herramientas en paralelo.** Cuando varias lecturas, búsquedas o comandos no dependan entre sí, lánzalos en el mismo turno.
- **Mide antes de afirmar.** Nada de «esto es lento» sin un número. Para rendimiento usa `performance.now()` en Node sobre las funciones puras y, en navegador, Playwright con `page.evaluate`, trazas de rendimiento, `PerformanceObserver` (long tasks, layout shift) y recuento de recálculos de estilo y layout. Mide al menos: coste de un `render()` completo con textos de 5, 20 y 80 caracteres; coste por estilo (para saber cuáles dominan); coste del Zalgo caótico; tiempo hasta la primera pintura con 80 tarjetas; y el caso peor (80 caracteres de emoji con ZWJ). Da mediana y p95, no una sola pasada.
- **Navegador real.** Con Playwright, abre el archivo por `file://` (no levantes servidor: así se usa de verdad) en los motores disponibles, con anchos de 360, 768 y 1280 px y en ambos temas. Guarda capturas y míralas: desbordes, texto cortado, glifos que salen como cuadros («tofu»), saltos de diseño. Prueba el teclado de principio a fin (Tab, flechas en las pestañas, Enter y Espacio) y el flujo de copiar y pegar.
- **Fuentes externas.** Los límites de nick por juego, las reglas de qué caracteres acepta cada plataforma y el soporte de APIs por navegador cambian; búscalos en la web y cita la fuente y la fecha en vez de fiarte de la memoria. Si no encuentras una fuente fiable, márcalo como no verificado.

### Subagentes en paralelo

Reparte la auditoría con la herramienta Agent: lanza los subagentes de las áreas de abajo **en un mismo turno** para que trabajen a la vez, y reserva para ti la síntesis. Cada subagente empieza de cero, así que dale en su encargo: la ruta del repositorio, qué es el proyecto y sus restricciones (sección 5), su área concreta, que lea `index.html` entero antes de opinar, que no modifique archivos del repositorio y el formato de devolución.

Formato que debe devolver cada subagente, un bloque por hallazgo:

- **Hallazgo:** qué pasa, en una frase.
- **Ubicación:** `archivo:línea` (o rango) y nombre de la función.
- **Severidad:** crítica, alta, media o baja, con el motivo.
- **Escenario concreto de fallo:** entrada exacta (con los puntos de código `U+XXXX` si es Unicode), navegador o plataforma, y qué resultado erróneo se obtiene frente al esperado.
- **Evidencia:** salida del comando, medición o captura que lo demuestra, y si lo ha **reproducido** o solo lo **deduce** del código.
- **Propuesta:** cambio concreto, compatible con las restricciones, con su coste y sus contrapartidas.
- **Cómo verificarlo:** el test o la comprobación que confirmaría el arreglo.

Los informes de los subagentes son materia prima, no conclusiones. Antes de pasar un hallazgo al informe final, reprodúcelo tú o léelo contra el código; descarta lo que no se sostenga y fusiona los duplicados. Para los hallazgos de severidad alta o crítica, lanza un segundo subagente que intente **refutarlos** sin conocer la conclusión del primero.

### Áreas

Ajústalas si al leer el código ves un reparto mejor.

**A. Corrección Unicode.** Es el núcleo del producto y donde espero más profundidad.
- Grafemas: emoji con ZWJ (familias, profesiones), banderas (pares de indicadores regionales), modificadores de tono de piel, secuencias de teclas (`1️⃣`), selectores de variación FE0E/FE0F y caracteres astrales, pasando por **todos** los estilos. ¿Qué hacen `conMarca`, `entreLetras`, `invertir`, `zalgo` y `alternas` con ellos?
- Normalización: ida y vuelta NFD/NFC de `mapeador`, orden canónico de las marcas (clases de combinación) cuando se añaden marcas a un texto que ya trae las suyas, entrada que llega ya descompuesta, letras con varias marcas (vietnamita), `ß`, `ı`/`İ` y otros casos de mayúsculas dependientes del idioma en `alternas`.
- Texto que no es latino: cirílico, griego, árabe y hebreo, CJK, y qué significa «conservar el original» en cada estilo.
- Bidi: hay alfabetos de sustitución que mezclan letras de escrituras de derecha a izquierda. Comprueba si reordenan visualmente el nick y cómo se pega en Discord o en un juego.
- Presentación emoji: letras encerradas o en recuadro que algunas plataformas pintan como emoji de color y otras como texto, dentro de una misma palabra.
- Fidelidad de los alfabetos: letras que no cambian, mayúsculas y minúsculas que se funden, glifos tomados de bloques distintos al que dice el nombre del estilo, dígitos y signos sin equivalente.
- Compatibilidad de fuentes: qué estilos se ven como «tofu» en Windows 10/11, Android, iOS y dentro de cada juego. Clasifica cada estilo por riesgo y cita fuentes; lo que no puedas comprobar en un dispositivo real, dilo.
- El contador: cuenta grafemas, pero los juegos suelen limitar por unidades UTF-16, puntos de código o bytes. Un nick en negrita matemática o con Zalgo puede marcar «5 caracteres» y no caber. Calcula las tres medidas para los 80 estilos y propón qué enseñar. Revisa también la coherencia entre `grafemas` y `contar` cuando no hay `Intl.Segmenter`.
- Truncados: `maxlength` y el `slice` del botón Pegar cuentan unidades UTF-16; comprueba si pueden partir un par sustituto o una secuencia ZWJ.

**B. Rendimiento.** 80 conversiones más 80 segmentaciones para el contador en cada tecla, sin `debounce` ni `requestAnimationFrame`; una prueba de expresión regular `\p{M}` por carácter; `normalize` repetido; el Zalgo recalculado entero. Mide primero y decide después si compensa: memoizar por texto y estilo, compartir una única normalización y segmentación entre los 80 estilos, tablas precalculadas (`Map`) en lugar de regex, calcular solo las tarjetas de la pestaña visible, `content-visibility: auto`, agrupar escrituras en el DOM, y el coste de `box-shadow`, degradados y transiciones al desplazarse en un móvil de gama baja (emula CPU lenta con Playwright). Si las mediciones dicen que ya va sobrado, dilo y no propongas complejidad gratuita.

**C. Accesibilidad (WCAG 2.2 AA).** Patrón de pestañas del APG completo (`tablist`, `tab`, `tabpanel`, `aria-controls`, `aria-labelledby`) frente a lo que hay; tarjetas que copian al hacer clic pero no reciben el foco con el teclado, y un botón dentro de un contenedor clicable; cómo anuncia un lector de pantalla el texto decorativo (letras matemáticas, Zalgo) en las tarjetas y en el toast «Copiado: …»; visibilidad del foco, también en modo de contraste forzado de Windows (hoy se quita `outline` y se usa `box-shadow`, y el título es texto transparente con degradado); contraste medido de cada pareja de colores en ambos temas, incluido el texto blanco sobre el degradado y los colores verde, ámbar y rojo del contador, y el hecho de que el estado se transmite solo con el color; tamaño de los objetivos táctiles (2.5.8); `prefers-reduced-motion` (ahora solo corta transiciones, no el desplazamiento suave); `prefers-color-scheme` ignorado al arrancar; reflow a 320 px y con zoom del 400 %; `autofocus` en móvil; estructura de encabezados y regiones.

**D. UX y producto.** Ideas con su coste y su riesgo, no una lista de deseos: buscador de estilos, favoritos, historial de textos, compartir un resultado por URL (`#hash`, que funciona en `file://`), límites por juego seleccionables en lugar de los umbrales fijos 12/16 (con fuentes), aviso de qué estilos acepta de verdad cada plataforma (hay juegos que solo admiten ASCII en el nombre de usuario), vista previa en contexto (mensaje de Discord, cabecera de perfil), entrada de varias líneas para biografías, combinador manual de marco + letra además del aleatorio, intensidad del Zalgo regulable, `translate="no"` para que el traductor del navegador no destroce los resultados, y preparación para otros idiomas sin romper el archivo único. Señala también fricciones de la interfaz actual que veas en las capturas.

**E. Seguridad y privacidad.** Recorre cada punto donde entra texto del usuario o del portapapeles hasta el DOM (`textContent` frente a `innerHTML`, atributos, `title`). Propón una CSP por `<meta>` que funcione con scripts y estilos en línea y con `file://` (hashes frente a `'unsafe-inline'`) y pruébala de verdad en el navegador. Portapapeles: permisos, contextos seguros, qué ocurre con `navigator.clipboard` en `file://` en cada motor y si el respaldo cubre los huecos. `localStorage` compartido entre archivos locales. Riesgos de abuso del producto en sí (suplantación con homoglifos, Zalgo para romper chats): si merecen un aviso al usuario o no. Confirma que no sale ninguna petición de red.

**F. Compatibilidad.** Firefox, Safari de escritorio e iOS, Chrome de Android y WebViews de aplicaciones (el navegador interno de Instagram, TikTok o Discord, donde mucha gente abrirá esto). Para cada API usada (`Intl.Segmenter`, escapes `\p{…}` en regex, `navigator.clipboard.readText`, `color-scheme`, `background-clip: text`, `scrollIntoView` suave) indica desde qué versión funciona, con fuente, y si el respaldo existente basta. Ejecuta la lógica y el test con `Intl.Segmenter` desactivado para ver qué cambia.

**G. Calidad de código y tests.** Estructura, nombres, duplicación, manejo de errores (`seguro` se traga las excepciones: ¿oculta fallos reales?), código muerto, coherencia entre el README y el código. Sobre los tests: el actual solo exige 50 estilos y propiedades genéricas. Propón una batería seria sin dependencias obligatorias: valores exactos fijados para cada estilo con varias entradas, pruebas por propiedades (ninguna salida con sustitutos sueltos, idempotencia de la normalización, mismo número de grafemas donde deba conservarse, ida y vuelta donde tenga sentido), casos límite de Unicode del área A, la rama sin `Intl.Segmenter`, y pruebas de interfaz con Playwright como complemento opcional (copiar, pestañas con teclado, tema persistente, regresión visual con capturas en ambos temas). Valora también una comprobación automática que impida que entren dependencias externas o que el archivo deje de funcionar por `file://`.

**H. PWA y uso sin conexión.** Qué es posible sin romper el archivo único ni `file://`: un service worker no se registra desde `file://` y necesitaría un segundo archivo, así que explica las opciones reales (manifiesto incrustado como `data:` o `blob:`, iconos en línea, mejora progresiva solo cuando se sirve por HTTPS, GitHub Pages como despliegue opcional) con sus límites, y recomienda si merece la pena.

### Skills de Claude Code

- `/code-review high index.html` durante la auditoría, como segunda opinión sobre errores de corrección. Contrasta sus hallazgos con los tuyos antes de incluirlos. No uses el nivel `max` salvo que yo te lo pida.
- `/security-review` y `/simplify` trabajan sobre cambios pendientes, así que no tienen sentido ahora: resérvalos para la fase de implementación, sobre el diff de cada fase y antes de cada commit, junto con otro `/code-review` del diff.

## 4. Pistas de una lectura rápida

Son sospechas sin verificar, para que veas el nivel de detalle que busco. Confírmalas o descártalas con pruebas, y no te limites a ellas: espero que la auditoría encuentre cosas que aquí no aparecen.

- El contador de grafemas puede dar por bueno un nick que el juego rechaza por longitud real.
- `maxlength="80"` y `slice(0, 80)` al pegar podrían cortar un emoji por la mitad.
- El estilo «Tailandés» incluye letras hebreas y árabes; «Al revés» usa un punto y coma árabe. Posible reordenación bidi.
- «Cuadrados negros» y «Burbujas» contienen letras que tienen presentación emoji en algunas plataformas.
- El estilo llamado «Cherokee» usa silabarios aborígenes canadienses, no cherokee.
- Las pestañas declaran `role="tab"` y `aria-controls`, pero no hay `tabpanel`; las tarjetas normales no son accesibles con teclado más que por su botón.
- El texto blanco sobre el extremo cian del degradado puede no llegar al contraste mínimo.
- El tema ignora `prefers-color-scheme`.
- El test extrae el script con una expresión regular codiciosa y exige solo 50 estilos, cuando hay 80.

## 5. Restricciones que no se negocian

- Un único `index.html`, sin dependencias externas, sin CDN, sin paso de compilación, y funcional con `file://`. Si una mejora lo incumple, preséntala aparte como opcional y explica qué se pierde.
- Cuando llegue la implementación: código completo y funcional, sin TODOs, sin placeholders y sin lógica omitida.
- Todos los textos visibles para el usuario, en español. Los nombres del código ya están en español; mantén esa convención.
- No publiques datos personales míos ni del repositorio en servicios externos, en búsquedas ni en el código.
- Commits en español, pequeños y por fase. **No hagas commit ni push hasta que yo apruebe qué se aplica.**
- Después de cada cambio futuro: `node tests/estilos.test.js` en verde, y test nuevo o adaptado para lo que se toque.

## 6. Qué me tienes que entregar

Entrégalo en el chat y guárdalo también en `docs/informe-auditoria.md`, sin commit.

**1. Resumen ejecutivo** (10 líneas como mucho): estado general, los 5 hallazgos que más importan y tu recomendación de por dónde empezar.

**2. Estado base:** resultado del test, herramientas y navegadores que has podido usar, y mediciones de partida con su método.

**3. Informe priorizado.** Una tabla por sección, en este orden, con las filas ordenadas de mayor a menor prioridad:

1. Bugs reales (comportamiento incorrecto reproducido)
2. Accesibilidad
3. Rendimiento
4. Seguridad y privacidad
5. Mantenibilidad y tests
6. Ideas avanzadas y de producto

Columnas de cada tabla:

| ID | Área | Ubicación | Impacto | Esfuerzo | Riesgo | Evidencia | Propuesta |
|----|------|-----------|---------|----------|--------|-----------|-----------|

- **ID** estable (`BUG-01`, `A11Y-03`, `PERF-02`…), para que yo pueda elegir por identificador.
- **Ubicación:** `index.html:línea` y función.
- **Impacto**, **Esfuerzo** y **Riesgo** (de romper algo al aplicarlo): alto, medio o bajo, con una frase que lo justifique.
- **Evidencia:** entrada exacta y resultado, medición con su número, criterio WCAG, o fuente con enlace. Indica en cada fila si está **reproducido**, **medido** o **deducido del código**.
- **Propuesta:** el cambio concreto. Para los hallazgos de impacto alto, añade debajo de la tabla un apartado con el escenario de fallo completo, el esbozo de la solución y cómo se verificará.

No rellenes: si una sección tiene dos hallazgos sólidos, son dos. Si has revisado algo y está bien, dilo en una línea para que yo sepa que se miró.

**4. No verificado en un navegador o dispositivo real.** Lista aparte de todo lo que solo has podido deducir o emular (Safari en iOS, WebViews, fuentes de cada sistema, lectores de pantalla reales, cómo se ve dentro de cada juego), con la prueba manual exacta que tendría que hacer yo para confirmarlo.

**5. Plan por fases.** Agrupa los hallazgos por ID en fases que se puedan aplicar y probar por separado, de menos a más riesgo (por ejemplo: bugs de Unicode con sus tests; accesibilidad; rendimiento; funciones nuevas). Para cada fase: qué IDs incluye, dependencias entre ellas, tests que se añaden, cómo se comprueba y qué queda sin poder probarse sin mí. Señala las decisiones que me corresponden a mí (cambios de diseño, funciones nuevas, renombrar estilos).

**6. Preguntas para mí**, si alguna decisión bloquea el plan.

Termina ahí y espera a que elija. No implementes nada, ni siquiera los arreglos que parezcan evidentes.
