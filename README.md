# PickGoal — Quiniela Mundial 2026

App de quiniela para el Mundial de Fútbol 2026. Predice resultados, compite con amigos en ligas y sigue la clasificación en tiempo real.

## Stack

- **Frontend**: Vite + Vanilla JS + SASS modular
- **Backend**: Python + Flask + PostgreSQL
- **Scheduler**: APScheduler (sync automática de resultados cada 5 min / 24h)
- **API**: [football-data.org](https://www.football-data.org/)
- **Deploy**: Render

---

## Instalación local

### Requisitos previos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Crear la base de datos
createdb pickgoal  # o desde psql: CREATE DATABASE pickgoal;

# Lanzar en desarrollo
python run.py
```

El backend arranca en `http://localhost:5000`.

---

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build
```

El frontend arranca en `http://localhost:5173` con proxy a la API en `:5000`.

---

## Variables de entorno (backend/.env)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL |
| `SECRET_KEY` | Clave secreta Flask (JWT + tokens) |
| `FOOTBALL_API_KEY` | API Key de football-data.org |
| `FLASK_ENV` | `development` o `production` |
| `FRONTEND_URL` | URL del frontend (para CORS) |

---

## Sistema de puntos

| Fase | 1X2 | Marcador exacto |
|---|---|---|
| Grupos | 1 pt | +1 pt |
| 1/32 | 2 pt | +2 pt |
| Octavos | 3 pt | +3 pt |
| Cuartos | 4 pt | +4 pt |
| Semis | 5 pt | +5 pt |
| 3er puesto | 5 pt | +5 pt |
| Final | 6 pt | +6 pt |
| **Campeón** | — | **+10 pt** |

- El 1X2 siempre se refiere al resultado a 90 minutos.
- En eliminatorias con prórroga/penaltis: el ganador suma 1 gol simbólico al marcador final.
- La predicción de campeón solo se puede hacer antes del inicio del torneo y no se puede modificar.

---

## Deploy en Render

### Backend (Web Service)

- **Build command**: `pip install -r requirements.txt`
- **Start command**: `gunicorn run:app`
- **Variables de entorno**: configurar en el panel de Render

### Frontend (Static Site)

- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`
- **Variables de entorno**: configurar `VITE_API_URL` si el backend está en otro dominio

---

## Estructura del proyecto

```
pickgoal/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Factory, extensiones, blueprints
│   │   ├── models.py          # 7 tablas SQLAlchemy
│   │   ├── scheduler.py       # APScheduler (sync 24h + live 5min)
│   │   ├── utils.py           # Helpers API, cálculo de puntos
│   │   └── routes/
│   │       ├── auth.py        # Registro, login, ranking, admin
│   │       ├── matches.py     # Partidos agrupados por fase
│   │       ├── predictions.py # Quiniela + predicción campeón
│   │       ├── leagues.py     # Ligas públicas y privadas
│   │       └── board.py       # Tablón con soft delete
│   ├── run.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── js/
        │   ├── main.js        # Bootstrap, navbar
        │   ├── router.js      # Hash router con params
        │   ├── api.js         # Cliente HTTP centralizado
        │   ├── auth.js        # Estado de sesión
        │   ├── ui.js          # Toast, formatDate
        │   └── pages/         # Una página por ruta
        └── sass/              # SASS modular (abstracts/base/components/pages)
```
