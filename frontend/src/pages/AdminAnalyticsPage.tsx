import { useEffect, useState } from 'react'
import type { Icon } from '@phosphor-icons/react'
import {
  UsersIcon, BowlSteamIcon, GlobeIcon, HeartIcon, ClockCounterClockwiseIcon,
  EyeIcon, MagnifyingGlassIcon, ChatCircleDotsIcon, TargetIcon,
} from '@phosphor-icons/react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts'
import { adminApi } from '@/api/api'
import type { Analytics, RecipeCount } from '@/types'
import content from '@/content/adminAnalyticsPage.json'

const ICONS: Record<string, Icon> = {
  Users: UsersIcon, BowlSteam: BowlSteamIcon, Globe: GlobeIcon, Heart: HeartIcon,
  ClockCounterClockwise: ClockCounterClockwiseIcon, Eye: EyeIcon, MagnifyingGlass: MagnifyingGlassIcon,
  ChatCircleDots: ChatCircleDotsIcon, Target: TargetIcon,
}

const RankChart = ({ data, color, emptyText }: { data: RecipeCount[]; color: string; emptyText: string }) => {
  if (data.length === 0) return <p className="admin-empty-text">{emptyText}</p>

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 88)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="recipeName"
          width={130}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#745c43', fontSize: 12.5 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          contentStyle={{ borderRadius: 10, border: '1.5px solid #ede5d8', fontSize: 13 }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} barSize={18}>
          <LabelList dataKey="count" position="right" style={{ fill: '#5c452d', fontSize: 12.5, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>
  if (!analytics) return null

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
      </div>

      {content.statGroups.map(group => {
        const items = group.items.filter(item =>
          item.key !== 'aiAcceptanceRate' || analytics.aiAcceptanceRate != null,
        )
        if (items.length === 0) return null

        return (
          <section key={group.title} className="admin-stat-section">
            <h3 className="admin-stat-section-title">{group.title}</h3>
            <div className="admin-stats-grid">
              {items.map(item => {
                const ItemIcon = ICONS[item.icon]
                const raw = analytics[item.key as keyof Analytics] as number
                const value = item.key === 'aiAcceptanceRate' ? Math.round(raw) : raw
                return (
                  <div key={item.key} className="admin-stat-card">
                    <span className="admin-stat-icon"><ItemIcon weight="bold" /></span>
                    <div>
                      <span className="admin-stat-value">{value}</span>
                      <span className="admin-stat-label">{item.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="admin-analytics-lists">
        <div className="admin-card">
          <h3>{content.topFavoritedTitle}</h3>
          <RankChart data={analytics.topFavorited} color="#6f8f59" emptyText={content.emptyText} />
        </div>

        <div className="admin-card">
          <h3>{content.topCookedTitle}</h3>
          <RankChart data={analytics.topCooked} color="#e94b35" emptyText={content.emptyText} />
        </div>
      </div>
    </div>
  )
}
