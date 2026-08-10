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
  imageUrl?: string | null
  sourceName?: string | null
  sourceUrl?: string | null
  isPublic?: boolean
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
  fiberGrams?: number | null
  sugarGrams?: number | null
  sodiumMg?: number | null
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

export interface RecipeDraftResponse {
  reply: string
  recipe: RecipeRequest | null
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
  calorieGoal?: number | null
  proteinGoal?: number | null
  carbsGoal?: number | null
  fatGoal?: number | null
}

export interface EatingHistoryEntry {
  id: number
  recipe: Recipe
  eatenOn: string
  recordedAt: string
}

export interface MealSchedule {
  id: number
  recipe: Recipe
  scheduledAt: string
  note: string | null
  completed: boolean
  createdAt: string
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
  imageUrl?: string | null
  sourceName?: string | null
  sourceUrl?: string | null
  isPublic?: boolean
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  difficulty?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
  fiberGrams?: number | null
  sugarGrams?: number | null
  sodiumMg?: number | null
}

export interface PreferencesRequest {
  dietaryType: string | null
  cuisineType: string | null
  calorieGoal?: number | null
  proteinGoal?: number | null
  carbsGoal?: number | null
  fatGoal?: number | null
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

// ── Admin ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  enabled: boolean
  premiumAccess: boolean
  createdAt: string
}

export interface PublicRecipe {
  id: number
  name: string
  servings: number
  dietaryType: string | null
  cuisineType: string | null
  ownerId: number
  ownerName: string
}

export interface RecipeCount {
  recipeId: number
  recipeName: string
  count: number
}

export interface Analytics {
  totalUsers: number
  totalGeneralRecipes: number
  totalPublicUserRecipes: number
  totalFavorites: number
  totalHistoryEntries: number
  totalRecipeViews: number
  totalSearches: number
  totalAiChats: number
  aiAcceptanceRate: number | null
  topFavorited: RecipeCount[]
  topCooked: RecipeCount[]
}

export interface RecipeRef {
  id: number
  name: string
}

export interface EmbeddingStatus {
  geminiConfigured: boolean
  totalIndexable: number
  totalEmbedded: number
  missing: RecipeRef[]
}
