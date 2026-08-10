import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { ChatCircleDotsIcon, XIcon, PaperPlaneRightIcon, WarningCircleIcon, MicrophoneIcon } from '@phosphor-icons/react'
import { RecipeCard } from '@/components/RecipeCard'
import { recipeApi, eventsApi } from '@/api/api'
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
  const [aiLogId, setAiLogId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyEndRef = useRef<HTMLDivElement>(null)
  const { supported: speechSupported, listening, start: startListening, stop: stopListening } =
    useSpeechToText(transcript => setInput(transcript))

  useEffect(() => {
    if (open) bodyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, open])

  // The launcher is fixed in the viewport corner, so on narrow screens it can
  // sit directly over whatever content the page happens to scroll to (e.g. a
  // form field). Fade it out while actively scrolling down, and bring it
  // back on scroll-up or once scrolling settles, so it's never covering a
  // stationary target for long.
  const [scrollHidden, setScrollHidden] = useState(false)
  useEffect(() => {
    if (open) return
    let lastY = window.scrollY
    let settleTimer: ReturnType<typeof setTimeout>
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastY + 4) setScrollHidden(true)
      else if (y < lastY - 4) setScrollHidden(false)
      lastY = y
      clearTimeout(settleTimer)
      settleTimer = setTimeout(() => setScrollHidden(false), 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(settleTimer)
    }
  }, [open])

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
      setAiLogId(null)
      eventsApi.trackAiChat(text, res.recipes.map(r => r.id))
        .then(({ id }) => setAiLogId(id))
        .catch(() => {})
    } catch (err: unknown) {
      const isPremiumRequired = err instanceof Error && err.message === 'Premium access required'
      setError(isPremiumRequired ? content.premiumRequiredMessage : content.errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const started = messages.length > 0

  return (
    <div className={`chatbot-widget${scrollHidden ? ' chatbot-widget--hidden' : ''}`}>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span><ChatCircleDotsIcon weight="duotone" /> {content.title}</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label={content.closeLabel}>
              <XIcon weight="bold" />
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
              <p className="msg error"><WarningCircleIcon weight="bold" /> {error}</p>
            )}

            {recipes.length > 0 && (
              <div className="chatbot-results">
                <p className="section-label">{recipes.length} recipe{recipes.length > 1 ? 's' : ''} {content.resultsForYouSuffix}</p>
                <div className="recipe-list">
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => { if (aiLogId != null) eventsApi.trackAiAcceptance(aiLogId, recipe.id).catch(() => {}) }}
                    />
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
                <MicrophoneIcon weight={listening ? 'fill' : 'bold'} />
              </button>
            )}
            <button
              className="btn-pill btn-primary btn-icon-only"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label={content.sendLabel}
            >
              <PaperPlaneRightIcon weight="fill" />
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
          <ChatCircleDotsIcon weight="fill" />
        </button>
      )}
    </div>
  )
}
