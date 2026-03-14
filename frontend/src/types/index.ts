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
  owner?: { id: number; username: string } | null
}

export interface RecommendationDTO extends Recipe {
  score: number
}

export interface User {
  username: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  token: string
}

export interface AuthResponse {
  token: string
  username: string
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
  username: string
  email: string
  password: string
}

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
}

export interface PreferencesRequest {
  dietaryType: string | null
  cuisineType: string | null
}
