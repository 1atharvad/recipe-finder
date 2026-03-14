import { useState, useEffect } from 'react'
import { RecipeCard } from '../components/RecipeCard'
import { BentoGrid } from '../components/BentoGrid'

interface Recipe {
  id: number
  name: string
}

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
    fetch('/api/v1/recipes')
      .then(res => res.json())
      .then(setTopRecipes)
      .catch(() => {})
  }, [])

  const search = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setSearched(true)
    setStatus('loading')
    try {
      const res = await fetch(`/api/v1/recipes/search?q=${encodeURIComponent(trimmed)}`)
      setResults(await res.json())
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
    <div className="page">
      <div className="hero">
        <span className="hero-eyebrow">🍽️ Discover Recipes</span>
        <h1>What's in your kitchen?</h1>
        <p>Search by dish name or ingredient to find something delicious to cook right now.</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="e.g. pasta, garlic, chicken..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(query)}
            autoFocus
          />
          <button onClick={() => search(query)} disabled={!query.trim() || status === 'loading'}>
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
        {searched && (
          <button className="clear-btn" onClick={clearSearch}>← Back to top recipes</button>
        )}
      </div>

      <div className="results">
        {status === 'error' && (
          <p className="msg error">Could not reach the server. Is the backend running?</p>
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
    </div>
  )
}
