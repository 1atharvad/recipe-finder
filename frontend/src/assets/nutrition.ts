import type { EatingHistoryEntry, MealSchedule, Recipe } from '@/types'
import { toDateKey, todayKey } from '@/assets/global-functions'

// The 4 nutrition values RecipeFormModal actually maintains. Recipe still
// declares fiberGrams/sugarGrams/sodiumMg, but those fields have no form
// inputs anymore and aren't kept up to date — treated as absent everywhere
// nutrition is aggregated.
export const MACROS = ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'] as const
export type Macro = typeof MACROS[number]

export type MacroTotals = Record<Macro, number>

export type NutritionRange = '7d' | '30d' | 'all' | 'custom'

export interface CustomRange {
  from: string // YYYY-MM-DD, inclusive
  to: string // YYYY-MM-DD, inclusive
}

const ZERO_TOTALS = (): MacroTotals => ({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 })

// Nutrition fields store the whole recipe's total (all servings combined),
// not a per-serving amount — a history entry means "I ate this recipe" (one
// serving), so divide down. Null on either side (missing data, or a recipe
// with servings <= 0) propagates as null rather than a misleading 0.
export const perServing = (recipe: Recipe, macro: Macro): number | null => {
  const total = recipe[macro]
  if (total == null || recipe.servings <= 0) return null
  return total / recipe.servings
}

const rangeStartKey = (range: '7d' | '30d' | 'all'): string | null => {
  if (range === 'all') return null
  const days = range === '7d' ? 7 : 30
  const d = new Date()
  d.setDate(d.getDate() - (days - 1))
  return toDateKey(d)
}

// `custom` is only consulted when range === 'custom' — null there (no range
// picked yet) is treated as unbounded rather than throwing, since the page
// renders the picker modal before the user has chosen anything.
export const filterEntriesByRange = (
  entries: EatingHistoryEntry[],
  range: NutritionRange,
  custom?: CustomRange | null,
): EatingHistoryEntry[] => {
  if (range === 'custom') {
    if (!custom) return entries
    return entries.filter(e => e.eatenOn >= custom.from && e.eatenOn <= custom.to)
  }
  const startKey = rangeStartKey(range)
  if (!startKey) return entries
  return entries.filter(e => e.eatenOn >= startKey)
}

export interface NutritionAggregate {
  perDay: Map<string, MacroTotals>
  totals: MacroTotals
  dailyAverage: MacroTotals
  coverage: { withData: number; total: number }
}

// Aggregates eaten-history entries into daily macro totals. Per-macro
// coverage tracks how many entries actually had that macro so the page can
// say "based on N of M meals" instead of silently treating missing data as 0.
export const aggregate = (entries: EatingHistoryEntry[]): NutritionAggregate => {
  const perDay = new Map<string, MacroTotals>()
  const totals = ZERO_TOTALS()
  let withData = 0

  for (const entry of entries) {
    const dayTotals = perDay.get(entry.eatenOn) ?? ZERO_TOTALS()
    let hasAnyData = false

    for (const macro of MACROS) {
      const value = perServing(entry.recipe, macro)
      if (value == null) continue
      hasAnyData = true
      dayTotals[macro] += value
      totals[macro] += value
    }

    perDay.set(entry.eatenOn, dayTotals)
    if (hasAnyData) withData += 1
  }

  const dayCount = Math.max(perDay.size, 1)
  const dailyAverage = MACROS.reduce((acc, macro) => {
    acc[macro] = totals[macro] / dayCount
    return acc
  }, ZERO_TOTALS())

  return { perDay, totals, dailyAverage, coverage: { withData, total: entries.length } }
}

// Calorie-weighted macro split for the donut — protein/carbs at 4 kcal/g,
// fat at 9 kcal/g (standard Atwater factors), so grams of very different
// calorie density compare fairly on a shared "share of energy" axis.
export const macroCalorieSplit = (totals: MacroTotals) => ({
  protein: totals.proteinGrams * 4,
  carbs: totals.carbsGrams * 4,
  fat: totals.fatGrams * 9,
})

// Upcoming, not-yet-completed schedules — completing a schedule already
// writes an EatingHistory row (ScheduleService.completeSchedule), so
// completed ones must be excluded here to avoid double-counting them as
// both "eaten" and "planned".
export const upcomingSchedules = (schedules: MealSchedule[]): MealSchedule[] => {
  const today = todayKey()
  return schedules
    .filter(s => !s.completed && toDateKey(new Date(s.scheduledAt)) >= today)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
}

export const plannedCalorieTotal = (schedules: MealSchedule[]): { total: number; withData: number } => {
  let total = 0
  let withData = 0
  for (const s of schedules) {
    const value = perServing(s.recipe, 'calories')
    if (value == null) continue
    total += value
    withData += 1
  }
  return { total, withData }
}

export interface TopContributor {
  recipeId: number
  recipeName: string
  calories: number
}

// Ranks recipes by total calories contributed within the given entries —
// "top contributors" panel. Ties broken by recipe id for stable ordering.
export const topContributors = (entries: EatingHistoryEntry[], limit = 5): TopContributor[] => {
  const byRecipe = new Map<number, TopContributor>()
  for (const entry of entries) {
    const calories = perServing(entry.recipe, 'calories')
    if (calories == null) continue
    const existing = byRecipe.get(entry.recipe.id)
    if (existing) {
      existing.calories += calories
    } else {
      byRecipe.set(entry.recipe.id, { recipeId: entry.recipe.id, recipeName: entry.recipe.name, calories })
    }
  }
  return [...byRecipe.values()]
    .sort((a, b) => b.calories - a.calories || a.recipeId - b.recipeId)
    .slice(0, limit)
}
