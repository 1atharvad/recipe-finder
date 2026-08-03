import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XIcon, WarningCircleIcon, SparkleIcon } from '@phosphor-icons/react'
import { RecipeCard } from '@/components/RecipeCard'
import { BentoGrid } from '@/components/BentoGrid'
import { SkelBlock } from '@/components/Skeleton'
import { recipeApi } from '@/api/api'
import type { Recipe } from '@/types'
import content from '@/content/searchPage.json'

export const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [topLoading, setTopLoading] = useState(true)
  const [results, setResults] = useState<Recipe[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    recipeApi.getTop()
      .then(setTopRecipes)
      .catch(() => {})
      .finally(() => setTopLoading(false))
  }, [])

  const search = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setSearched(true)
    setStatus('loading')
    try {
      setResults(await recipeApi.search(trimmed))
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearched(false)
    setResults([])
    setStatus('idle')
  }

  return (
    <>
      <section className="search-hero">
        <div className="section-inner">
          <span className="hero-eyebrow">{content.hero.eyebrow} <SparkleIcon weight="fill" /></span>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.text}</p>

          <div className="search-bar">
            <div className="search-input-wrap">
              <MagnifyingGlassIcon className="search-bar-icon" weight="bold" />
              <input
                type="text"
                placeholder={content.hero.placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search(query)}
                autoFocus
              />
              {query && (
                <button type="button" className="search-bar-clear" onClick={clearSearch} aria-label={content.hero.clearLabel}>
                  <XIcon weight="bold" />
                </button>
              )}
            </div>
            <button className="btn-pill btn-primary" onClick={() => search(query)} disabled={!query.trim() || status === 'loading'}>
              {status === 'loading' ? content.hero.searchingLabel : content.hero.searchLabel}
            </button>
          </div>

          {!searched && (
            <div className="search-chips">
              {content.quickSearches.map(({ q, label, emoji }) => (
                <button
                  key={q}
                  className="chip"
                  onClick={() => { setQuery(label); search(label); }}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="search-results">
        <div className="section-inner">
          {status === 'error' && (
            <p className="msg error"><WarningCircleIcon weight="bold" /> {content.results.serverErrorMessage}</p>
          )}

          {!searched && topLoading && (
            <>
              <p className="section-label">{content.results.topRecipesLabel}</p>
              <div className="bento-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`bento-item bento-item-${i}`}>
                    <SkelBlock height="100%" radius={0} />
                  </div>
                ))}
              </div>
            </>
          )}

          {!searched && !topLoading && topRecipes.length > 0 && (
            <>
              <p className="section-label">{content.results.topRecipesLabel}</p>
              <BentoGrid recipes={topRecipes} />
            </>
          )}

          {searched && status === 'done' && results.length === 0 && (
            <p className="msg">{content.results.noResultsPrefix} "{query}".</p>
          )}

          {searched && status === 'done' && results.length > 0 && (
            <>
              <p className="section-label">{results.length} result{results.length > 1 ? 's' : ''} {content.results.resultsForPrefix} "{query}"</p>
              <div className="recipe-list">
                {results.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
