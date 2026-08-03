# CookMate

A full-stack recipe management app with user authentication, personalised recommendations, and an admin panel.

Built with **Spring Boot 3** · **React + TypeScript** · **Supabase Postgres**

Dev runs the backend natively via `mvn spring-boot:run` against a Supabase Postgres project. The
frontend runs via Vite, pointed at `localhost` in dev via Vite's proxy. In prod, the backend runs in
Docker on a Contabo VPS (managed via aaPanel) and the frontend is a static build on Vercel.

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
| Database | Supabase Postgres (managed, pgvector enabled) |
| Frontend | React 18, TypeScript, Vite, SCSS |
| Routing | React Router v6 |
| Frontend hosting | Vercel |

---

## Project Structure

```
recipe-finder/
├── backend/                   # Spring Boot application
│   ├── Dockerfile              # Multi-stage build, used by docker-compose.yml
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
└── docker-compose.yml          # Prod backend container definition (VPS deploy)
```

---

## Running Locally (Dev)

The backend runs natively via Maven; Postgres is a Supabase project (not local); the frontend runs
natively via Vite.

**Prerequisites:** Node 20+, Java 17, Maven, a free [Supabase](https://supabase.com) project for dev
(enable the `vector` extension under Database > Extensions once, so pgvector is available).

```bash
git clone <repo-url>
cd recipe-finder
npm install                    # installs root dev tooling (concurrently, dotenv-cli)
cp .env.example .env           # fill in your dev Supabase project's connection details
npm run dev                    # starts the backend (mvn spring-boot:run) and the frontend (Vite)
```

- Frontend: **http://localhost:5173** (Vite proxies `/api/v1` to the backend, see `frontend/vite.config.js`)
- Backend: **http://localhost:6754**
- Database: your Supabase dev project

`spring-boot-devtools` is on the classpath, so if your editor compiles `.java` files on save (most do),
the backend restarts automatically without a full `mvn clean package`.

Other useful scripts: `npm run dev:backend` (backend only), `npm run dev:frontend` (frontend only).

---

## Deploying (Prod)

**Database** is a separate Supabase project from dev; **backend** runs on a Contabo VPS; **frontend**
is a static build on Vercel.

### Backend (Contabo VPS, Docker via aaPanel)

Runs as a Docker container, managed through aaPanel's Docker UI (or plain `docker compose` over SSH —
both work off the same `docker-compose.yml`). aaPanel/nginx handles TLS termination and reverse-proxies
`cookmate.atharvadevasthali.com` to the container's exposed `6754` port; the database stays external
(prod Supabase project, not a container).

```bash
git clone <repo-url> && cd recipe-finder
cp .env.prod.example .env      # fill in real values — see below
docker compose up -d --build
```

None of the backend's env vars have a fallback default (see `application.properties`) — `docker compose`
will refuse to start the container if any var below is missing from `.env`:

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | Your **prod** Supabase project's JDBC URL (`...?sslmode=require`) |
| `SPRING_DATASOURCE_USERNAME` | Supabase DB user (`postgres` by default) |
| `SPRING_DATASOURCE_PASSWORD` | Supabase DB password |
| `JWT_SECRET` | HMAC-SHA key for JWT signing — generate with `openssl rand -hex 32` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login credentials |
| `ALLOWED_ORIGINS` | Your frontend's URL, e.g. `https://cookmate-recipes.vercel.app` |
| `GEMINI_API_KEY` | Enables smart search / chat assistant — required to start even if unused |

To redeploy after a code change: `git pull && docker compose up -d --build`.

### Frontend (Vercel)

Import the `frontend/` directory as the project root in Vercel, and set the env var:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Your backend's URL |

`frontend/vercel.json` handles SPA routing (React Router) so all paths resolve to `index.html`.

---

## Environment Variables

### Backend

Copy `.env.example` (dev) or `.env.prod.example` (prod) to `.env` and fill in real values.

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *none — required* | HMAC-SHA key for JWT signing — generate with `openssl rand -hex 32` |
| `ADMIN_USERNAME` | *none — required* | Admin login username |
| `ADMIN_PASSWORD` | *none — required* | Admin login password |
| `GEMINI_API_KEY` | *none — required* | Google Gemini API key, powers recipe embeddings + smart search + chat |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/recipedb` | Supabase project's JDBC URL (`...?sslmode=require`) — override for any real (Supabase) dev/prod use |
| `SPRING_DATASOURCE_USERNAME` | `recipe_user` | DB user (`postgres` on Supabase) |
| `SPRING_DATASOURCE_PASSWORD` | `recipe_pass` | DB password |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS-allowed origins — set to your frontend's URL in prod |
| `PORT` | `6754` | Set automatically by most hosts in prod; only override locally if `6754` is taken |

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
