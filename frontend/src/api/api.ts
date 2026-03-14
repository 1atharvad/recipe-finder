import type {
  AuthResponse, AuthRequest, SignupRequest,
  Recipe, RecipeRequest, RecommendationDTO,
  EatingHistoryEntry, UserPreferences, PreferencesRequest,
} from '../types'

const BASE = '/api/v1'
const AUTH_KEY = 'recipe-auth'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw).token ?? null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (body: SignupRequest) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: AuthRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  adminLogin: (body: AuthRequest) =>
    request<AuthResponse>('/auth/admin/login', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipeApi = {
  getTop: () => request<Recipe[]>('/recipes'),
  search: (q: string) => request<Recipe[]>(`/recipes/search?q=${encodeURIComponent(q)}`),
  getById: (id: number) => request<Recipe>(`/recipes/${id}`),
  getMyRecipes: () => request<Recipe[]>('/my-recipes'),
  createMine: (body: RecipeRequest) =>
    request<Recipe>('/my-recipes', { method: 'POST', body: JSON.stringify(body) }),
  updateMine: (id: number, body: RecipeRequest) =>
    request<Recipe>(`/my-recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMine: (id: number) =>
    request<void>(`/my-recipes/${id}`, { method: 'DELETE' }),
}

// ── Favorites ─────────────────────────────────────────────────────────────────
export const favoritesApi = {
  getAll: () => request<Recipe[]>('/favorites'),
  add: (id: number) => request<void>(`/favorites/${id}`, { method: 'POST' }),
  remove: (id: number) => request<void>(`/favorites/${id}`, { method: 'DELETE' }),
}

// ── History ───────────────────────────────────────────────────────────────────
export const historyApi = {
  getAll: () => request<EatingHistoryEntry[]>('/history'),
  markEaten: (id: number) => request<EatingHistoryEntry>(`/history/${id}`, { method: 'POST' }),
}

// ── Recommendations ───────────────────────────────────────────────────────────
export const recommendationApi = {
  get: () => request<RecommendationDTO[]>('/recommendations'),
}

// ── Preferences ───────────────────────────────────────────────────────────────
export const preferencesApi = {
  get: () => request<UserPreferences>('/preferences'),
  save: (body: PreferencesRequest) =>
    request<UserPreferences>('/preferences', { method: 'PUT', body: JSON.stringify(body) }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getAll: () => request<Recipe[]>('/admin/recipes'),
  create: (body: RecipeRequest) =>
    request<Recipe>('/admin/recipes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: RecipeRequest) =>
    request<Recipe>(`/admin/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request<void>(`/admin/recipes/${id}`, { method: 'DELETE' }),
}
