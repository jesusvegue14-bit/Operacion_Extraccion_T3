# Operación Extracción — T3 FPS 3D

Proyecto de Computación Gráfica y Visual. Videojuego FPS en Three.js/WebGL: atraviesa una ciudad infectada y alcanza la zona de extracción.

## Requisitos
- Navegador moderno (Chrome, Edge o Firefox).
- Python 3 para levantar un servidor local, o la extensión Live Server de VS Code.
- Conexión a Internet para cargar Three.js desde jsDelivr. Los modelos GLB están incluidos localmente.

## Cómo ejecutar
1. Descomprime la carpeta.
2. Abre una terminal dentro de `operacion_extraccion`.
3. Ejecuta `python -m http.server 8000` (en Windows, también `py -m http.server 8000`).
4. Visita `http://localhost:8000` en el navegador.
5. Pulsa **INICIAR MISIÓN**. Haz clic dentro del juego para capturar el mouse si es necesario.

**No abras `index.html` mediante `file://`**, porque los modelos GLB se cargan mediante peticiones HTTP.

## Controles
| Control | Acción |
|---|---|
| W, A, S, D | Caminar |
| Mouse | Mirar alrededor |
| Clic izquierdo | Disparar una vez |
| 1 | Pistola GLB |
| 2 | Rifle GLB |
| ESC | Pausa |

## Mecánicas y rúbrica
- **RF01**: dos modelos de armas `.glb` visibles en primera persona; 1/2 para cambiar; disparo por evento `mousedown` (no automático).
- **RF02**: munición independiente; no hay recarga por tecla; cajas de munición dan +6/+9.
- **RF03**: calle urbana extensa, edificios, muros y obstáculos.
- **RF04**: enemigos cargados desde `assets/zombi.glb`.
- **RF05**: cada enemigo permanece quieto fuera de su rango; al acercarse el jugador se activa y persigue.
- **RF06**: WASD, cámara perspectiva y orientación con mouse (Pointer Lock).
- **RF07**: raycasting contra enemigos y obstáculos; exactamente dos impactos válidos por zombi; al morir se elimina.
- **RF08**: inicio, tramo de supervivencia y helipuerto verde en el extremo del mapa; mensaje de victoria.
- **RF09**: contacto con zombi termina la partida con GAME OVER.
- **RF10**: cajas de munición coleccionables.
- **RF11**: enemigos repartidos por el mapa, recursos limitados y obstáculos.
- **RF12**: código y documentación incluidos; publicar el repositorio y grabar el video son pasos pendientes del estudiante.

## Estructura
- `index.html`: interfaz e importmap.
- `style.css`: HUD y pantallas de inicio/final.
- `game.js`: escena, cámara, mapa, GLB, movimiento, disparos, enemigos, coleccionables, estados de partida.
- `assets/arma1.glb`, `arma2.glb`, `zombi.glb`: modelos originales sencillos construidos para este proyecto.

## Recursos externos
- Three.js versión 0.160.1 y GLTFLoader desde CDN jsDelivr. Licencia MIT de Three.js: https://github.com/mrdoob/three.js/blob/master/LICENSE
- Modelos GLB generados específicamente para este proyecto; no usan assets de terceros.

## Publicación en GitHub
Crea un repositorio nuevo, sube los archivos de esta carpeta manteniendo `assets/`, y coloca la URL del repositorio en el aula virtual. Comprueba que el proyecto se ejecuta siguiendo las instrucciones.

## Guion sugerido de video (máximo 3 minutos)
- **0:00–0:25**: presentación del objetivo y recorrido.
- **0:25–1:10**: explicar en `game.js` la cámara, movimiento WASD y carga de modelos GLB.
- **1:10–1:40**: explicar `shoot()` y cómo raycasting reduce la resistencia de 2 a 0.
- **1:40–2:25**: demostrar cambio de armas, municiones, cajas y persecución.
- **2:25–3:00**: demostrar GAME OVER y victoria en la zona de extracción (puedes editar clips de partidas diferentes).

## Nota de validación
El código está preparado para ejecutarse, pero conviene comprobarlo en un navegador de escritorio y corregir cualquier incidencia antes de entregar. El enlace de GitHub y el video deben ser creados y publicados por el estudiante.
