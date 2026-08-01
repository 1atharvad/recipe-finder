import { useState, useEffect } from 'react'
import { MagnifyingGlass, X, WarningCircle, Sparkle } from '@phosphor-icons/react'
import { RecipeCard } from '../components/RecipeCard'
import { BentoGrid } from '../components/BentoGrid'
import { recipeApi } from '../api/api'
import type { Recipe } from '../types'

const QUICK_SEARCHES = [
  { q: 'pasta',   label: 'Pasta',   emoji: '🍝' },
  { q: 'chicken', label: 'Chicken', emoji: '🍗' },
  { q: 'eggs',    label: 'Eggs',    emoji: '🥚' },
  { q: 'garlic',  label: 'Garlic',  emoji: '🧄' },
  { q: 'rice',    label: 'Rice',    emoji: '🍚' },
  { q: 'tomato',  label: 'Tomato',  emoji: '🍅' },
]

export const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [results, setResults] = useState<Recipe[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    recipeApi.getTop()
      .then(setTopRecipes)
      .catch(() => {})
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
          <span className="hero-eyebrow">DISCOVER RECIPES <Sparkle weight="fill" /></span>
          <h1>What's in your kitchen?</h1>
          <p>Search by dish name or ingredient to find something delicious to cook right now.</p>

          <div className="search-bar">
            <div className="search-input-wrap">
              <MagnifyingGlass className="search-bar-icon" weight="bold" />
              <input
                type="text"
                placeholder="e.g. pasta, garlic, chicken..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search(query)}
                autoFocus
              />
              {query && (
                <button type="button" className="search-bar-clear" onClick={clearSearch} aria-label="Clear search">
                  <X weight="bold" />
                </button>
              )}
            </div>
            <button className="btn-pill btn-primary" onClick={() => search(query)} disabled={!query.trim() || status === 'loading'}>
              {status === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </div>

          {!searched && (
            <div className="search-chips">
              {QUICK_SEARCHES.map(({ q, label, emoji }) => (
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
            <p className="msg error"><WarningCircle weight="bold" /> Could not reach the server. Is the backend running?</p>
          )}

          {!searched && topRecipes.length > 0 && (
            <>
              <p className="section-label">Top Recipes</p>
              <BentoGrid recipes={topRecipes} />
            </>
          )}

          {searched && status === 'done' && results.length === 0 && (
            <p className="msg">No recipes found for "{query}".</p>
          )}

          {searched && status === 'done' && results.length > 0 && (
            <>
              <p className="section-label">{results.length} result{results.length > 1 ? 's' : ''} for "{query}"</p>
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
