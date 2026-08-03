import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { ChatCircleDots, X, PaperPlaneRight, WarningCircle, Microphone } from '@phosphor-icons/react'
import { RecipeCard } from '@/components/RecipeCard'
import { recipeApi } from '@/api/api'
import { useSpeechToText } from '@/hooks/useSpeechToText'
import type { Recipe, ChatMessage } from '@/types'
import content from '@/content/chatWidget.json'

// The assistant's reply is prompted to only ever use <b>/<i>/<span class="hl">
// for emphasis — sanitize down to exactly that allowlist before rendering as
// HTML, in case a prompt-injection attempt tries to sneak anything else in.
const sanitizeAssistantHtml = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'span'], ALLOWED_ATTR: ['class'] })

export const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyEndRef = useRef<HTMLDivElement>(null)
  const { supported: speechSupported, listening, start: startListening, stop: stopListening } =
    useSpeechToText(transcript => setInput(transcript))

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
    } catch (err: unknown) {
      const isPremiumRequired = err instanceof Error && err.message === 'Premium access required'
      setError(isPremiumRequired ? content.premiumRequiredMessage : content.errorMessage)
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
            <span><ChatCircleDots weight="duotone" /> {content.title}</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label={content.closeLabel}>
              <X weight="bold" />
            </button>
          </div>

          <div className="chatbot-body">
            {!started && (
              <div className="chatbot-starter">
                <p>{content.starterHint}</p>
                <div className="search-chips">
                  {content.starterPrompts.map(p => (
                    <button key={p} className="chip" onClick={() => send(p)}>{p}</button>
                  ))}
                </div>
              </div>
            )}

            {started && (
              <div className="chat-thread">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-message ${m.role}`}>
                    {m.role === 'assistant' ? (
                      <div
                        className="chat-bubble"
                        dangerouslySetInnerHTML={{ __html: sanitizeAssistantHtml(m.content) }}
                      />
                    ) : (
                      <div className="chat-bubble">{m.content}</div>
                    )}
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
                <p className="section-label">{recipes.length} recipe{recipes.length > 1 ? 's' : ''} {content.resultsForYouSuffix}</p>
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
              placeholder={content.inputPlaceholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            {speechSupported && (
              <button
                type="button"
                className={`chatbot-mic-btn${listening ? ' listening' : ''}`}
                onClick={() => (listening ? stopListening() : startListening())}
                disabled={loading}
                aria-label={listening ? content.stopVoiceLabel : content.startVoiceLabel}
              >
                <Microphone weight={listening ? 'fill' : 'bold'} />
              </button>
            )}
            <button
              className="btn-pill btn-primary btn-icon-only"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label={content.sendLabel}
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
          aria-label={content.openLabel}
        >
          <ChatCircleDots weight="fill" />
        </button>
      )}
    </div>
  )
}
