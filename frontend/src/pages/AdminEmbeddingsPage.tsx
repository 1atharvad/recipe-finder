import { useEffect, useState } from 'react'
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { toast } from 'advi-ui'
import { adminApi } from '@/api/api'
import type { EmbeddingStatus } from '@/types'
import content from '@/content/adminEmbeddingsPage.json'

export const AdminEmbeddingsPage = () => {
  const [status, setStatus] = useState<EmbeddingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillDone, setBackfillDone] = useState(false)

  const load = () => {
    adminApi.getEmbeddingStatus()
      .then(setStatus)
      .catch(() => toast.error(content.loadErrorMessage))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const runBackfill = async () => {
    setBackfilling(true)
    setBackfillDone(false)
    try {
      await adminApi.triggerBackfill()
      setBackfillDone(true)
    } catch {
      toast.error(content.backfillErrorMessage)
    } finally {
      setBackfilling(false)
    }
  }

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>
  if (!status) return null

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
      </div>

      <div className="admin-card">
        <p className="msg" style={{ padding: 0, justifyContent: 'flex-start', marginBottom: '1rem' }}>
          {status.geminiConfigured
            ? <><CheckCircleIcon weight="bold" color="#2e7d32" /> {content.geminiConfiguredLabel}</>
            : <><WarningCircleIcon weight="bold" color="#c0392b" /> {content.geminiNotConfiguredLabel}</>}
        </p>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{status.totalEmbedded} {content.ofSuffix} {status.totalIndexable}</span>
            <span className="admin-stat-label">{content.indexedLabel}</span>
          </div>
        </div>

        <button className="btn-pill btn-primary btn-small" onClick={runBackfill} disabled={backfilling || !status.geminiConfigured}>
          {backfilling ? content.backfillingLabel : content.backfillLabel}
        </button>
        {backfillDone && <p className="msg success" style={{ padding: '0.5rem 0', justifyContent: 'flex-start' }}>{content.backfillDone}</p>}
      </div>

      <div className="admin-card">
        <h3>{content.missingTitle}</h3>
        {status.missing.length === 0 ? (
          <p className="admin-empty-text">{content.allIndexedText}</p>
        ) : (
          <ul className="admin-rank-list">
            {status.missing.map(r => (
              <li key={r.id}><span>{r.name}</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
