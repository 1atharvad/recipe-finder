# Recipe Finder

A full-stack recipe management app with user authentication, personalised recommendations, and an admin panel.

Built with **Spring Boot 3** · **React + TypeScript** · **PostgreSQL** · **Docker Compose** · **nginx**

Dev runs Postgres + backend in Docker (backend uses an incremental `mvn spring-boot:run`, not a full rebuild, so it stays light) and the frontend natively via Vite. Prod deploys the backend + Postgres + nginx to a VPS (e.g. Contabo) via Docker, and the frontend as a static build on Vercel.

---

## Features

### Public
- Browse paginated general recipes on the home page
- Search recipes by name or ingredient
- View full recipe detail (ingredients, steps, dietary & cuisine info)

### Authenticated Users
- Sign up / log in with JWT-based auth
- **Favorites** — save and manage recipes (stored in DB, not localStorage)
- **My Recipes** — create, edit, and delete private recipes (invisible to other users)
- **History** — mark recipes as eaten; view history grouped by date
- **Recommendations** — personalised scoring based on eating history and preferences
- **Preferences** — set dietary type and cuisine type to boost recommendation scores

### Admin
- Discrete login at `/admin/login` — no link anywhere in the UI
- Full CRUD over the general recipe pool
- Admin credentials are **never** stored in the database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5.6, Spring Security 6, Spring Data JPA |
| Auth | JWT (jjwt 0.12.6), BCrypt |
| Database | PostgreSQL 16 |
| Frontend | React 18, TypeScript, Vite, SCSS |
| Routing | React Router v6 |
| Proxy | nginx |
| Containers | Docker Compose |

---

## Project Structure

```
recipe-finder/
├── backend/                   # Spring Boot application
│   └── src/main/java/.../
│       ├── controller/        # REST controllers
│       ├── dto/               # Request/response DTOs
│       ├── model/             # JPA entities + enums
│       ├── repository/        # Spring Data repositories
│       ├── security/          # JwtUtil, JwtAuthFilter, SecurityConfig
│       └── service/           # Business logic + recommendation engine
├── frontend/                  # React + TypeScript app
│   └── src/
│       ├── api/               # Centralised fetch wrapper (auto JWT attach)
│       ├── components/        # Navbar, RecipeFormModal, PreferencesModal, guards
│       ├── context/           # AuthContext (JWT + user state)
│       ├── pages/             # All page components
│       └── types/             # Shared TypeScript interfaces
├── nginx/nginx.prod.conf      # Prod reverse proxy (API only, fronts the backend on the VPS)
├── docker-compose.dev.yml     # Dev: Postgres + backend (mvn spring-boot:run, source bind-mounted)
└── docker-compose.prod.yml    # Prod: Postgres + backend + nginx (deployed to the VPS)
```

---

## Running Locally (Dev)

Postgres and the backend run in Docker; the frontend runs natively via Vite.

The backend container bind-mounts `./backend` into a plain `maven:3.9.6-eclipse-temurin-17` image and
runs `mvn spring-boot:run` — no Dockerfile build step, no `mvn clean package` on every start. Maven's
`~/.m2` cache is a named volume (`m2_cache`), so dependencies download once, not on every container
start. `spring-boot-devtools` is on the classpath, so if your editor compiles `.java` files on save
(most do), the app restarts automatically inside the container.

**Prerequisites:** Docker, Node 20+ (Java is not needed on the host — it runs in the container)

```bash
git clone <repo-url>
cd recipe-finder
npm install   # installs root dev tooling (concurrently)
npm run dev   # starts Postgres + backend in Docker, and the frontend via Vite
```

- Frontend: **http://localhost:5173** (Vite proxies `/api/v1` to the backend, see `frontend/vite.config.ts`)
- Backend: **http://localhost:6754** (in Docker)
- Postgres: **localhost:5433** (in Docker — mapped off the default 5432 to avoid clashing with other local Postgres instances)

The database is seeded automatically with 10 general recipes on first run.

Other useful scripts: `npm run dev:backend` (Postgres + backend only), `npm run dev:frontend`
(frontend only), `npm run dev:down` (stop and remove the dev containers).

---

## Deploying (Prod)

**Backend + Postgres** run on a VPS (e.g. Contabo) via Docker; **frontend** is a static build deployed
to Vercel. They talk to each other over CORS, not a shared nginx proxy.

### Backend (VPS)

```bash
cd recipe-finder
DB_PASSWORD=... JWT_SECRET=... ADMIN_USERNAME=... ADMIN_PASSWORD=... \
ALLOWED_ORIGINS=https://your-app.vercel.app \
npm run prod
```

This builds and starts Postgres + the Spring Boot backend + nginx (`docker-compose.prod.yml`),
with nginx reverse-proxying `/api/v1/*` to the backend on port 8080. Point your domain's DNS at the
VPS and put nginx behind Let's Encrypt/certbot for HTTPS (or front it with another reverse proxy
that terminates TLS on 443 and forwards to 8080).

`npm run prod:down` stops it, `npm run prod:logs` tails logs.

### Frontend (Vercel)

Import the `frontend/` directory as the project root in Vercel, and set the env var:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.your-domain.com` (your VPS's public URL) |

`frontend/vercel.json` handles SPA routing (React Router) so all paths resolve to `index.html`.

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | (64-char hex string, dev only) | HMAC-SHA key for JWT signing — **required** in prod |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/recipedb` | DB URL |
| `SPRING_DATASOURCE_USERNAME` | `recipe_user` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `recipe_pass` | DB password |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS-allowed origins — set to your Vercel URL in prod |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key, powers recipe embeddings + smart search. Optional — smart search is silently disabled if unset |

`docker-compose.prod.yml` requires `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
and `ALLOWED_ORIGINS` to be set (no insecure defaults in prod). `GEMINI_API_KEY` is optional.

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty → relative, dev)* | Backend origin, e.g. `https://api.your-domain.com` |

---

## API Overview

### Auth (public)
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register a new user |
| POST | `/api/v1/auth/login` | Log in, returns JWT |
| POST | `/api/v1/auth/admin/login` | Admin login, returns JWT with `ROLE_ADMIN` |

### Recipes (public GET, auth required for write)
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/recipes` | Paginated general recipes |
| GET | `/api/v1/recipes/{id}` | Recipe detail |
| GET | `/api/v1/recipes/search?q=` | Search (includes user's own recipes when authenticated) |

### User (requires auth)
| Method | Path | Description |
|---|---|---|
| GET/POST/DELETE | `/api/v1/favorites/{id}` | Manage favorites |
| GET/POST/PUT/DELETE | `/api/v1/my-recipes` | User's private recipes |
| GET | `/api/v1/history` | Eating history |
| POST | `/api/v1/history/{id}` | Mark recipe as eaten |
| GET | `/api/v1/recommendations` | Scored recommendations |
| GET/PUT | `/api/v1/preferences` | Dietary + cuisine preferences |

### Admin (requires `ROLE_ADMIN`)
| Method | Path | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/v1/admin/recipes` | Manage general recipe pool |

---

## Recommendation Algorithm

Each general recipe is scored against the user's eating history:

```
score = dayAffinity + frequencyWeight − recencyPenalty + preferenceBonus
```

| Component | Formula | Effect |
|---|---|---|
| **dayAffinity** | `(times eaten on today's weekday) / (distinct history days)` | Surfaces recipes you tend to eat on this day |
| **frequencyWeight** | `(your eat count for recipe) / (your max eat count any recipe)` | Favours recipes you eat often |
| **recencyPenalty** | `(7 − daysSinceLastEaten) / 7` if eaten within last 7 days | Discourages eating the same thing repeatedly |
| **preferenceBonus** | `+0.5` dietary match · `+0.3` cuisine match | Boosts recipes matching your preferences |

Top 10 results are returned sorted by score descending.

---

## Data Model

```
users           → id, username, email, password (bcrypt), role
user_preferences → id, user_id, dietary_type, cuisine_type
user_favorites  → id, user_id, recipe_id, saved_at
eating_history  → id, user_id, recipe_id, eaten_on (date), recorded_at
recipes         → id, name, servings, dietary_type, cuisine_type, owner_id (null = general)
ingredients     → id, recipe_id, name, quantity
```

Admin is **not** stored in the database — credentials are validated against `application.properties` / environment variables.

---

## Dietary & Cuisine Options

**Dietary:** `VEGETARIAN` · `VEGAN` · `NON_VEGETARIAN`

**Cuisine:** `ITALIAN` · `INDIAN` · `ASIAN` · `MEXICAN` · `OTHER`
