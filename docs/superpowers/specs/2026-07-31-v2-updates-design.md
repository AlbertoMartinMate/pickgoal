# PickGoal v2 — Actualización de pantallas y sistema de predicciones

Fecha: 2026-07-31

## Contexto

Conjunto de cambios sobre el sistema v2 (jornadas/duelos/divisiones) ya desplegado:
1. Estilo consistente de mensajes "sin datos".
2. Tabla de clasificación con pestañas General / Mi División.
3. Revelado de pronósticos del rival en el duelo, partido a partido.
4. Rediseño del sistema de predicciones: de guardado en bloque por jornada a
   apertura/cierre y guardado individual por partido.
5. Rediseño completo de la pantalla de perfil (foto, historial, racha, % acierto).
6. Corrección de las constantes de ascenso/descenso y conexión de
   `process_season_end()` a una acción de admin.

No existen tests automatizados en el repo (backend ni frontend) — la verificación
de cada fase es manual, ejecutando la app localmente.

---

## 1. Empty states (estilo)

**Problema:** hay dos convenciones ya en uso (`.empty` inline y el bloque
`*-empty` con icono+título+texto) y dos verdes distintos: `$accent: #00ff87`
(variable, mayoría de la UI) y `#39FF14` hardcodeado en ~15 sitios sin variable.

**Cambio:**
- Añadir `$accent-neon: #39ff14;` a `frontend/src/sass/abstracts/_variables.scss`.
- Sustituir los literales `#39FF14`/`#39ff14` existentes por `v.$accent-neon`
  (mismo resultado visual, ahora centralizado).
- Restyle de `.empty` (`_reset.scss`) y de los bloques `*-empty`
  (`_jornada.scss`, `_duelo.scss`) para usar fondo `$bg-card`, texto `$text` o
  `$accent-neon` para el icono/título, tipografía coherente con el resto
  (misma familia y pesos que `.section-title`).
- Aplicar el mismo tratamiento a los `.empty` sueltos de `tabla-v2.js` y
  `duelo.js` (clasificación divisional vacía).
- No se crea markup nuevo — se reutilizan las dos convenciones existentes,
  solo se igualan visualmente.

---

## 2. Tabla-v2 — pestañas General / Mi División

**Backend:** sin cambios — `GET /v2/clasificacion/general` y
`GET /v2/clasificacion/division` ya existen y devuelven lo necesario.

**Frontend (`tabla-v2.js`):**
- Añadir tabs con el patrón `.league-tabs`/`.league-tab` (visto en
  `liga-detalle.js`), dos paneles: `General` y `Mi División`.
- Panel **General**: igual que ahora (`api.clasificacion.general()`),
  columnas `#`, emoji status, usuario, pts jornada, pts total.
- Panel **Mi División**: `api.clasificacion.division()` sin `league_id`
  (el backend ya resuelve la liga por defecto del usuario vía
  `DivisionMember`). Columnas `#`, usuario, PJ, G, E, P, Pts división.
  Fila del usuario resaltada con `.ranking-table__row--me` (ya existe, lo usa
  `duelo.js`).
- Solo se pide el panel activo al entrar en cada tab (no se cargan ambos de
  golpe); el tab General es el que se muestra por defecto al entrar en la
  página.

---

## 3. Duelo — pronósticos del rival, partido a partido

**Backend (`duelos_bp` / `GET /v2/duelo/current`):**
- Añadir al payload una lista `matches` con, para cada partido de la
  jornada activa: `jornada_match_id`, datos del partido, mi pronóstico
  (`predicted_result`, `units_wagered`) siempre visible, y el pronóstico del
  rival visible **solo si** el partido ya ha empezado
  (`match.status != 'scheduled' or now >= match.match_datetime`); si no, se
  devuelve `null` para el pronóstico del rival en ese partido (nunca se
  serializa el dato real al cliente antes de tiempo).
- Caso *bye* (rival == yo mismo): se omite la sección de comparación de
  picks.

**Frontend (`duelo.js`):**
- Debajo de la tarjeta de duelo, lista de partidos con: resultado/equipos,
  mi pick, pick del rival (o `?` si el partido aún no ha empezado).

---

## 4. Predicciones v2 — apertura y guardado por partido

**Modelo mental nuevo:** ya no hay un cierre único de jornada al empezar el
primer partido. Cada partido se abre/cierra de forma independiente
(cierre = `match_datetime - 30min`). El presupuesto de 20 unidades / máx 5
por partido sigue siendo por jornada completa.

**Backend `GET /v2/jornada/current`:**
- Por cada partido añadir `predict_locked: bool` (`now >= match_datetime -
  30min` o `status != 'scheduled'`) y `opens_until` (= `match_datetime -
  30min`, ISO). Se retira el uso del `locked` global de la jornada como
  bloqueo de guardado (se mantiene el cálculo de `first_match_datetime` solo
  si se sigue necesitando para otra cosa; si no, se elimina).

**Backend `POST /v2/jornada/predict`:**
- Payload cambia de una lista de predicciones a **una predicción por
  partido**: `{ jornada_match_id, predicted_result, units }`.
- Validaciones:
  - El partido pertenece a la jornada activa.
  - El partido concreto no está bloqueado (`match_datetime - 30min`).
  - `predicted_result` en `{1, X, 2}`.
  - `0 <= units <= 5`.
  - Suma de unidades ya usadas en la jornada (excluyendo esta predicción si
    ya existía) + `units` de esta petición `<= 20`.
- No hay lógica de "forzado" del último partido — es solo aviso en frontend
  (ya resuelto: opción "solo aviso, no forzado").

**Frontend (`jornada.js`):**
- Cada partido: tag `Abierto hasta HH:MM` o `Bloqueado`, según
  `predict_locked`/`opens_until`.
- Botón de guardar **por partido** (sustituye al botón único de "Guardar
  predicciones" para toda la jornada).
- Barra de unidades restantes recalculada en vivo con cada guardado.
- Si el partido que se está editando es el único aún abierto y quedan
  unidades sin usar → aviso: *"Te quedan X unidades — es tu último
  partido."* (no bloquea nada, solo informa).
- Se retira el estado de "jornada bloqueada" global (el aviso y el
  deshabilitado ahora son por partido).

---

## 5. Perfil — rediseño completo

### Backend

**Modelo `User`** — nueva columna:
```python
photo_url = db.Column(db.String(500), nullable=True)
```
Migración Flask-Migrate.

**Nueva tabla `LeagueSeasonHistory`** (para historial y mejor posición —
hoy no existe ningún archivo de clasificaciones pasadas; `process_season_end`
resetea sin guardar nada):
```python
class LeagueSeasonHistory(db.Model):
    __tablename__ = 'league_season_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    season_id = db.Column(db.Integer, db.ForeignKey('seasons.id'), nullable=False)
    division = db.Column(db.Integer, nullable=False)
    position = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=False)  # season_div_points final
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
```
Se rellena una fila por `DivisionMember` dentro de `process_season_end()`,
justo antes de resetear `season_div_points`/`season_total_points` (ver
sección 6). Empieza vacía — no hay forma de reconstruir temporadas ya
cerradas con el código antiguo.

**`GET /api/auth/me`** — ampliar el payload con:
- `photo_url`
- `racha_duelos`: nº de duelos ganados consecutivos hasta hoy, calculado
  recorriendo los `Duelo` del usuario ordenados por `jornada.number` desc y
  contando victorias (`winner_id == user.id`) hasta el primer no-ganado.
- `mejor_posicion`: `min(position)` sobre todas sus filas en
  `LeagueSeasonHistory` (o `null` si no tiene ninguna todavía).
- `temporada_actual`: para la temporada activa —
  `puntos_totales` (suma de `season_total_points` de sus `DivisionMember` de
  la temporada activa), `predicciones_hechas` (nº `PredictionV2` de la
  jornada/temporada activa), `porcentaje_acierto` (nº de predicciones cuyo
  `predicted_result` coincide con `match.result_90`, dividido entre
  predicciones hechas, sobre partidos ya finalizados).
- `historial_ligas`: filas de `LeagueSeasonHistory` del usuario, con nombre
  de liga y temporada resueltos, ordenadas por temporada desc.

**`POST /api/auth/upload-photo`** (nuevo):
- Recibe imagen en base64 (`{ image: 'data:image/...;base64,...' }`).
- Sube a Cloudinary, carpeta `pickgoal/avatars/`, usando credenciales de
  `CLOUDINARY_URL` (variable de entorno, formato
  `cloudinary://api_key:api_secret@cloud_name` — el SDK de Cloudinary la lee
  automáticamente).
- Guarda la URL devuelta en `user.photo_url`, devuelve `{ photo_url }`.
- Añadir `cloudinary` a `requirements.txt`.

**`PUT /api/auth/update-profile`** (nuevo, sustituye a lo propuesto
inicialmente como `PATCH /me` + endpoint de contraseña separado — un único
endpoint):
- Campos opcionales: `username` (valida unicidad si cambia), `country`,
  y cambio de contraseña (`current_password` + `new_password`, exige que
  `current_password` coincida con el hash guardado, `new_password` con la
  misma validación mínima que registro, ≥6 caracteres).
- Devuelve el usuario actualizado.

### Frontend (`perfil.js`)

Elimina por completo las secciones "Predicción Campeón" y "Mis
predicciones" (Mundial) y cualquier referencia a `api.predictions.*`.

- **Cabecera:** avatar circular (foto si `photo_url`, si no iniciales como
  hoy); click en el avatar abre selector de archivo → sube a
  `/api/auth/upload-photo` → refresca avatar. Username + email. Icono ⚙️
  abre un modal con el formulario de editar username + cambiar contraseña
  (`PUT /api/auth/update-profile`).
- **Status:** igual que hoy — badge de nivel + barra de progreso +
  `total_points_all_time`.
- **Temporada 26/27:** tarjeta con `puntos_totales`, `predicciones_hechas`,
  `porcentaje_acierto`, `racha_duelos` (de `temporada_actual`/`racha_duelos`
  del payload de `/me`).
- **Historial de ligas:** lista de `historial_ligas` — nombre de liga,
  temporada, posición final, puntos. Empty state (estilo de la sección 1)
  si está vacía.
- Se mantiene el acceso directo a "Tablón general" (`#/tablon`) y la lista
  de "Mis ligas" / "Ligas gestionadas" (admin) tal cual existen hoy.

---

## 6. Temporada — constantes y cierre de temporada

- `backend/app/divisions.py`: `RELEGATION_SPOTS` de `8` a `4` (queda
  `PROMOTION_SPOTS = 4`, `RELEGATION_SPOTS = 4`).
- `process_season_end(season_id)`: antes de resetear
  `season_div_points`/`season_total_points` de cada `DivisionMember`, crear
  una fila en `LeagueSeasonHistory` con su `division`, `position` (de
  `get_division_standings`) y `season_div_points` como `points`.
- Nuevo endpoint admin `POST /v2/admin/season/<id>/close` (en
  `admin_v2.py`, protegido con `_require_admin()`) que llama a
  `process_season_end(id)`.
- Frontend admin (`admin.js`, página de gestión de jornadas): botón "Cerrar
  temporada y rotar divisiones" con `confirm()` antes de llamar al endpoint
  (acción con impacto real: resetea puntos de temporada y mueve divisiones).

---

## Notas de alcance

- No se reconstruye historial de temporadas ya cerradas con el código
  viejo — `historial_ligas`/`mejor_posicion` empiezan vacíos hasta el
  primer cierre con `process_season_end` actualizado.
- `CLOUDINARY_URL` debe añadirse al entorno (local y producción) por el
  usuario — el código solo lo lee, no gestiona la cuenta.
- Sin tests automatizados en el repo; verificación manual por fase.
