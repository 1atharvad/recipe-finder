import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartDonutIcon, GearIcon, ForkKnifeIcon, CalendarBlankIcon } from '@phosphor-icons/react'
import { CircularProgressBar, toast } from 'advi-ui'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import { historyApi, scheduleApi, preferencesApi } from '@/api/api'
import { NutritionGoalsModal } from '@/components/NutritionGoalsModal'
import { CustomDateRangeModal } from '@/components/CustomDateRangeModal'
import { SkelBlock } from '@/components/Skeleton'
import {
  MACROS, aggregate, filterEntriesByRange, macroCalorieSplit, upcomingSchedules,
  plannedCalorieTotal, topContributors,
} from '@/assets/nutrition'
import type { Macro, NutritionRange, CustomRange } from '@/assets/nutrition'
import type { EatingHistoryEntry, MealSchedule, UserPreferences } from '@/types'
import content from '@/content/nutritionPage.json'

const MACRO_LABEL: Record<Macro, string> = {
  calories: content.caloriesLabel,
  proteinGrams: content.proteinLabel,
  carbsGrams: content.carbsLabel,
  fatGrams: content.fatLabel,
}

const GOAL_KEY: Record<Macro, keyof Pick<UserPreferences, 'calorieGoal' | 'proteinGoal' | 'carbsGoal' | 'fatGoal'>> = {
  calories: 'calorieGoal',
  proteinGrams: 'proteinGoal',
  carbsGrams: 'carbsGoal',
  fatGrams: 'fatGoal',
}

const RANGE_LABEL: Record<Exclude<NutritionRange, 'custom'>, string> = {
  '7d': content.range7dLabel,
  '30d': content.range30dLabel,
  all: content.rangeAllLabel,
}

const formatRangeDate = (dateKey: string): string =>
  new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// Darker than the pastel $accent-* tokens (used for surfaces/badges elsewhere)
// so the thin pie slices stay legible instead of washing out against $bg.
const SPLIT_COLORS = { protein: '#6f8f59', carbs: '#d9a91f', fat: '#d9784f' }

export const NutritionPage = () => {
  const [history, setHistory] = useState<EatingHistoryEntry[]>([])
  const [schedules, setSchedules] = useState<MealSchedule[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<NutritionRange>('7d')
  const [customRange, setCustomRange] = useState<CustomRange | null>(null)
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([historyApi.getAll(), scheduleApi.getAll(), preferencesApi.get()])
      .then(([h, s, p]) => { setHistory(h); setSchedules(s); setPreferences(p) })
      .catch(() => toast.error(content.actionErrorMessage))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const rangedEntries = useMemo(
    () => filterEntriesByRange(history, range, customRange),
    [history, range, customRange],
  )
  const { dailyAverage, coverage, perDay } = useMemo(() => aggregate(rangedEntries), [rangedEntries])
  const dailyBreakdown = useMemo(
    () => [...perDay.entries()].sort(([a], [b]) => b.localeCompare(a)),
    [perDay],
  )
  const split = useMemo(() => macroCalorieSplit(dailyAverage), [dailyAverage])
  const splitTotal = split.protein + split.carbs + split.fat
  const contributors = useMemo(() => topContributors(rangedEntries), [rangedEntries])
  const planned = useMemo(() => upcomingSchedules(schedules), [schedules])
  const plannedCalories = useMemo(() => plannedCalorieTotal(planned), [planned])

  const trendData = useMemo(
    () => [...perDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, totals]) => ({ date: date.slice(5), calories: Math.round(totals.calories) })),
    [perDay],
  )

  if (loading) return <NutritionPageSkeleton />

  if (history.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <ChartDonutIcon weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <Link to="/dashboard" className="btn-pill btn-primary">{content.browseLabel}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="hero-page-header">
        <div>
          <span className="hero-eyebrow">
            <ChartDonutIcon weight="fill" /> {history.length} {content.countWord}{history.length !== 1 ? 's' : ''} {content.countSuffix}
          </span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
        <button type="button" className="btn-pill btn-primary btn-small" onClick={() => setGoalsOpen(true)}>
          <GearIcon weight="bold" /> {content.goalsButtonLabel}
        </button>
      </div>

      <div className="view-toggle">
        {(['7d', '30d', 'all'] as const).map(r => (
          <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
            {RANGE_LABEL[r]}
          </button>
        ))}
        <button
          className={range === 'custom' ? 'active' : ''}
          onClick={() => { setRange('custom'); setCustomModalOpen(true) }}
        >
          <CalendarBlankIcon weight="bold" />
          {range === 'custom' && customRange
            ? `${formatRangeDate(customRange.from)} – ${formatRangeDate(customRange.to)}`
            : content.rangeCustomLabel}
        </button>
      </div>

      <p className="nutrition-coverage-note">
        {content.coverageLabel
          .replace('{withData}', String(coverage.withData))
          .replace('{total}', String(coverage.total))}
      </p>

      <div className="nutrition-macro-grid">
        {MACROS.map(macro => {
          const goal = preferences?.[GOAL_KEY[macro]] ?? null
          const value = Math.round(dailyAverage[macro])
          const pct = goal ? Math.min(100, Math.round((dailyAverage[macro] / goal) * 100)) : 0
          return (
            <div key={macro} className="nutrition-macro-card">
              <CircularProgressBar percentage={goal ? pct : 0} size={72} strokeWidth={7}>
                <span className="nutrition-macro-value">{value}</span>
              </CircularProgressBar>
              <div className="nutrition-macro-meta">
                <span className="nutrition-macro-label">{MACRO_LABEL[macro]}</span>
                <span className="nutrition-macro-sub">
                  {content.dailyAverageLabel} · {macro === 'calories' ? value : `${value}${content.gramsUnit}`}
                </span>
                <span className="nutrition-macro-goal">
                  {goal
                    ? content.goalSuffix.replace('{goal}', `${goal}${macro === 'calories' ? '' : content.gramsUnit}`)
                    : content.noGoalLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="nutrition-charts-row">
        <div className="nutrition-panel">
          <p className="section-label">{content.trendTitle}</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede5d8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontFamily: 'Rubik', fontSize: 11, fill: '#745c43' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'Rubik', fontSize: 11, fill: '#745c43' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={{ fontFamily: 'Rubik', fontSize: 12, borderRadius: 8, border: '1.5px solid #ede5d8' }} />
                <Area type="monotone" dataKey="calories" stroke="#e94b35" fill="#e94b35" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="nutrition-panel-empty">{content.splitEmptyText}</p>
          )}
        </div>

        <div className="nutrition-panel">
          <p className="section-label">{content.splitTitle}</p>
          {splitTotal > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: content.proteinLabel, value: split.protein, key: 'protein' },
                    { name: content.carbsLabel, value: split.carbs, key: 'carbs' },
                    { name: content.fatLabel, value: split.fat, key: 'fat' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {(['protein', 'carbs', 'fat'] as const).map(key => (
                    <Cell key={key} fill={SPLIT_COLORS[key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Rubik', fontSize: 12, borderRadius: 8, border: '1.5px solid #ede5d8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="nutrition-panel-empty">{content.splitEmptyText}</p>
          )}
        </div>
      </div>

      <div className="nutrition-charts-row">
        <div className="nutrition-panel">
          <p className="section-label">{content.plannedTitle}</p>
          {planned.length > 0 ? (
            <>
              <p className="nutrition-planned-summary">
                {content.plannedSummary
                  .replace('{calories}', String(Math.round(plannedCalories.total)))
                  .replace('{count}', String(planned.length))
                  .replace('{plural}', planned.length !== 1 ? 's' : '')}
              </p>
              <ul className="nutrition-planned-list">
                {planned.slice(0, 5).map(s => (
                  <li key={s.id} className="nutrition-planned-item">
                    <CalendarBlankIcon weight="bold" />
                    <span className="nutrition-planned-name">{s.recipe.name}</span>
                    <span className="nutrition-planned-date">
                      {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="nutrition-panel-empty">{content.plannedEmptyText}</p>
          )}
        </div>

        <div className="nutrition-panel">
          <p className="section-label">{content.contributorsTitle}</p>
          {contributors.length > 0 ? (
            <ul className="nutrition-contributors-list">
              {contributors.map(c => (
                <li key={c.recipeId} className="nutrition-contributor-item">
                  <ForkKnifeIcon weight="bold" />
                  <span className="nutrition-contributor-name">{c.recipeName}</span>
                  <span className="nutrition-contributor-calories">{Math.round(c.calories)} kcal</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nutrition-panel-empty">{content.contributorsEmptyText}</p>
          )}
        </div>
      </div>

      <div className="nutrition-panel nutrition-daily-panel">
        <p className="section-label">{content.dailyBreakdownTitle}</p>
        {dailyBreakdown.length > 0 ? (
          <div className="nutrition-daily-table-wrap">
            <table className="nutrition-daily-table">
              <thead>
                <tr>
                  <th>{content.dailyBreakdownDateHeader}</th>
                  {MACROS.map(macro => <th key={macro}>{MACRO_LABEL[macro]}</th>)}
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.map(([date, totals]) => (
                  <tr key={date}>
                    <td>{formatRangeDate(date)}</td>
                    {MACROS.map(macro => (
                      <td key={macro}>
                        {Math.round(totals[macro])}{macro === 'calories' ? '' : content.gramsUnit}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="nutrition-panel-empty">{content.dailyBreakdownEmptyText}</p>
        )}
      </div>

      {goalsOpen && (
        <NutritionGoalsModal onClose={() => setGoalsOpen(false)} onSaved={load} />
      )}

      {customModalOpen && (
        <CustomDateRangeModal
          initial={customRange}
          onApply={applied => { setCustomRange(applied); setCustomModalOpen(false) }}
          onClose={() => {
            setCustomModalOpen(false)
            if (!customRange) setRange('7d')
          }}
        />
      )}
    </div>
  )
}

const NutritionPageSkeleton = () => (
  <div className="page">
    <div className="hero-page-header">
      <div>
        <SkelBlock width="8rem" height="0.9rem" />
        <SkelBlock width="14rem" height="1.8rem" />
        <SkelBlock width="18rem" height="1rem" />
      </div>
    </div>
    <div className="nutrition-macro-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="nutrition-macro-card">
          <SkelBlock width="72px" height="72px" radius="50%" />
          <div className="nutrition-macro-meta">
            <SkelBlock width="4rem" height="0.9rem" />
            <SkelBlock width="6rem" height="0.8rem" />
          </div>
        </div>
      ))}
    </div>
    <div className="nutrition-charts-row">
      <SkelBlock height="220px" />
      <SkelBlock height="220px" />
    </div>
  </div>
)
