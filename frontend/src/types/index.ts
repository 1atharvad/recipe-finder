export interface Ingredient {
  name: string
  quantity: string
}

export interface Recipe {
  id: number
  name: string
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  dietaryType?: 'VEGETARIAN' | 'VEGAN' | 'NON_VEGETARIAN' | null
  cuisineType?: 'ITALIAN' | 'INDIAN' | 'ASIAN' | 'MEXICAN' | 'OTHER' | null
  owner?: { id: number; firstName: string } | null
  videoUrl?: string | null
  isPublic?: boolean
}

export interface RecommendationDTO extends Recipe {
  score: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  recipes: Recipe[]
}

export interface User {
  firstName: string
  lastName: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  token: string
}

export interface AuthResponse {
  token: string
  firstName: string
  lastName: string
  role: string
}

export interface UserPreferences {
  dietaryType: string | null
  cuisineType: string | null
}

export interface EatingHistoryEntry {
  id: number
  recipe: { id: number; name: string }
  eatenOn: string
  recordedAt: string
}

export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginRequest {
  email: string
  password: string
}

// Admin login only — the regular user login uses LoginRequest (email-based).
export interface AuthRequest {
  username: string
  password: string
}

export interface RecipeRequest {
  name: string
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  dietaryType?: string | null
  cuisineType?: string | null
  videoUrl?: string | null
  isPublic?: boolean
}

export interface PreferencesRequest {
  dietaryType: string | null
  cuisineType: string | null
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
