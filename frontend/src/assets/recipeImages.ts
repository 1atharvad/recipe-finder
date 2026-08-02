// Generic placeholder used only when a recipe has no imageUrl of its own —
// per-recipe images now live in the database (Recipe.imageUrl), not here.
const FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'

export const getRecipeImage = (imageUrl?: string | null): string => imageUrl || FALLBACK
