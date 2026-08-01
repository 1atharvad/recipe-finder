import { useState, useEffect, useRef } from 'react'
import { ChatCircleDots, X, PaperPlaneRight, WarningCircle } from '@phosphor-icons/react'
import { RecipeCard } from './RecipeCard'
import { recipeApi } from '../api/api'
import type { Recipe, ChatMessage } from '../types'

const STARTER_PROMPTS = [
  'Something spicy with chicken',
  'Quick vegetarian dinner',
  'I have leftover rice, what can I make?',
]

export const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bodyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, open])

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return
    const historyForRequest = messages

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await recipeApi.chat(text, historyForRequest)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      setRecipes(res.recipes)
    } catch {
      setError('Could not reach the assistant. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const started = messages.length > 0

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span><ChatCircleDots weight="duotone" /> Recipe Assistant</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">
              <X weight="bold" />
            </button>
          </div>

          <div className="chatbot-body">
            {!started && (
              <div className="chatbot-starter">
                <p>Ask in your own words — "something spicy with chicken" or "quick vegetarian dinner."</p>
                <div className="search-chips">
                  {STARTER_PROMPTS.map(p => (
                    <button key={p} className="chip" onClick={() => send(p)}>{p}</button>
                  ))}
                </div>
              </div>
            )}

            {started && (
              <div className="chat-thread">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-message ${m.role}`}>
                    <div className="chat-bubble">{m.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="chat-message assistant">
                    <div className="chat-bubble chat-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="msg error"><WarningCircle weight="bold" /> {error}</p>
            )}

            {recipes.length > 0 && (
              <div className="chatbot-results">
                <p className="section-label">{recipes.length} recipe{recipes.length > 1 ? 's' : ''} for you</p>
                <div className="recipe-list">
                  {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bodyEndRef} />
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="e.g. something with garlic..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button
              className="btn-pill btn-primary btn-icon-only"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <PaperPlaneRight weight="fill" />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          className="chatbot-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open recipe assistant"
        >
          <ChatCircleDots weight="fill" />
        </button>
      )}
    </div>
  )
}
