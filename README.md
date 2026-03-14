# Recipe Finder

A full-stack recipe management app with user authentication, personalised recommendations, and an admin panel.

Built with **Spring Boot 3** · **React + TypeScript** · **PostgreSQL** · **Docker Compose** · **nginx**

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
├── nginx/nginx.conf           # Reverse proxy config
└── docker-compose.yml
```

---

## Running Locally

**Prerequisites:** Docker + Docker Compose

```bash
git clone <repo-url>
cd recipe-finder
docker compose up --build
```

The app will be available at **http://localhost**.

The database is seeded automatically with 10 general recipes on first run.

---

## Environment Variables

All secrets use env-var substitution with dev-safe fallbacks. Override in production:

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | (64-char hex string) | HMAC-SHA key for JWT signing |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/recipedb` | DB URL |
| `SPRING_DATASOURCE_USERNAME` | `recipe_user` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `recipe_pass` | DB password |

Set these in `docker-compose.yml` or as shell environment variables before running.

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
