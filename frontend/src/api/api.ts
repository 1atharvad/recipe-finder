import type {
  AuthResponse, AuthRequest, LoginRequest, SignupRequest,
  Recipe, RecipeRequest, RecommendationDTO,
  EatingHistoryEntry, UserPreferences, PreferencesRequest,
  ChatMessage, ChatResponse, RecipeDraftResponse,
  UserProfile, UpdateProfileRequest, ChangePasswordRequest,
  AdminUser, PublicRecipe, Analytics, EmbeddingStatus, MealSchedule,
} from '@/types'

const BASE = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`
const AUTH_KEY = 'recipe-auth'

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw).token ?? null
  } catch {
    return null
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    // The backend only sends 401 for "not authenticated" (missing/invalid/
    // expired JWT) — genuine permission failures (wrong role, not your
    // recipe, premium required) are 403s and must NOT bounce the user here.
    // A hard redirect (rather than a router navigate) guarantees every
    // in-memory auth/UI state gets torn down along with the stale session.
    localStorage.removeItem(AUTH_KEY)
    const path = window.location.pathname
    if (!path.startsWith('/login') && path !== '/admin/login') {
      window.location.href = '/login'
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text
    try {
      const body = JSON.parse(text) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // not JSON — fall back to the raw text below
    }
    throw new Error(message || `HTTP ${res.status}`)
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
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  adminLogin: (body: AuthRequest) =>
    request<AuthResponse>('/auth/admin/login', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipeApi = {
  getTop: () => request<Recipe[]>('/recipes'),
  search: (q: string) => request<Recipe[]>(`/recipes/search?q=${encodeURIComponent(q)}`),
  chat: (message: string, history: ChatMessage[]) =>
    request<ChatResponse>('/recipes/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  draft: (message: string, history: ChatMessage[], currentRecipe?: RecipeRequest) =>
    request<RecipeDraftResponse>('/recipes/draft', { method: 'POST', body: JSON.stringify({ message, history, currentRecipe }) }),
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
  getForRecipe: (recipeId: number) => request<EatingHistoryEntry[]>(`/history/${recipeId}`),
  markEaten: (id: number, eatenAt?: string) => request<EatingHistoryEntry>(`/history/${id}`, {
    method: 'POST',
    body: JSON.stringify({ eatenAt: eatenAt ?? null }),
  }),
  updateEntry: (entryId: number, eatenAt: string) => request<EatingHistoryEntry>(`/history/entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify({ eatenAt }),
  }),
  deleteEntry: (entryId: number) => request<void>(`/history/entries/${entryId}`, { method: 'DELETE' }),
}

// ── Schedules (Reminders) ───────────────────────────────────────────────────────
export const scheduleApi = {
  getAll: () => request<MealSchedule[]>('/schedules'),
  create: (recipeId: number, scheduledAt: string, note?: string) => request<MealSchedule>('/schedules', {
    method: 'POST',
    body: JSON.stringify({ recipeId, scheduledAt, note: note?.trim() || null }),
  }),
  update: (id: number, scheduledAt: string, note?: string) => request<MealSchedule>(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ scheduledAt, note: note?.trim() || null }),
  }),
  delete: (id: number) => request<void>(`/schedules/${id}`, { method: 'DELETE' }),
  complete: (id: number) => request<EatingHistoryEntry>(`/schedules/${id}/complete`, { method: 'POST' }),
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

// ── User profile ─────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => request<UserProfile>('/users/me'),
  updateProfile: (body: UpdateProfileRequest) =>
    request<UserProfile>('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: ChangePasswordRequest) =>
    request<void>('/users/me/password', { method: 'PUT', body: JSON.stringify(body) }),
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

  getPublicRecipes: () => request<PublicRecipe[]>('/admin/public-recipes'),
  unpublishRecipe: (id: number) =>
    request<void>(`/admin/public-recipes/${id}/unpublish`, { method: 'PUT' }),

  getUsers: () => request<AdminUser[]>('/admin/users'),
  setUserEnabled: (id: number, enabled: boolean) =>
    request<void>(`/admin/users/${id}/enabled`, { method: 'PUT', body: JSON.stringify({ enabled }) }),
  setUserPremiumAccess: (id: number, premiumAccess: boolean) =>
    request<void>(`/admin/users/${id}/premium`, { method: 'PUT', body: JSON.stringify({ premiumAccess }) }),

  getAnalytics: () => request<Analytics>('/admin/analytics'),

  getEmbeddingStatus: () => request<EmbeddingStatus>('/admin/embeddings/status'),
  triggerBackfill: () => request<void>('/admin/embeddings/backfill', { method: 'POST' }),
}
