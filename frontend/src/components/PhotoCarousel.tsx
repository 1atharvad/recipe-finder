import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, animate, type AnimationPlaybackControls } from 'framer-motion'
import { handleImageFallback } from '@/assets/global-functions'
import { recipeApi } from '@/api/api'
import pageContent from '@/content/photoCarousel.json'

interface PhotoCard {
  img: string
  name?: string
  tag?: string
}

interface Props {
  cards: PhotoCard[]
}

export const PhotoCarousel = ({ cards }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)
  const [recipeIds, setRecipeIds] = useState<Record<string, number>>({})

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const halfWidth = track.scrollWidth / 2
    controlsRef.current = animate(x, -halfWidth, {
      duration: cards.length * 6,
      ease: 'linear',
      repeat: Infinity,
    })
    return () => controlsRef.current?.stop()
  }, [cards.length, x])

  useEffect(() => {
    const names = [...new Set(cards.map(c => c.name).filter((n): n is string => !!n))]
    Promise.all(
      names.map(name =>
        recipeApi.search(name)
          .then(results => {
            const match = results.find(r => r.name.toLowerCase() === name.toLowerCase()) ?? results[0]
            return match ? [name, match.id] as const : null
          })
          .catch(() => null)
      )
    ).then(pairs => {
      const map: Record<string, number> = {}
      for (const pair of pairs) if (pair) map[pair[0]] = pair[1]
      setRecipeIds(map)
    })
  }, [cards])

  const pause = () => controlsRef.current?.pause()
  const resume = () => controlsRef.current?.play()

  const loopedCards = [...cards, ...cards]

  return (
    <div className="photo-carousel" onMouseEnter={pause} onMouseLeave={resume}>
      <motion.div className="photo-row" ref={trackRef} style={{ x }}>
        {loopedCards.map((card, i) => {
          const content = (
            <>
              <img
                src={`https://images.unsplash.com/${card.img}?w=480&h=480&fit=crop&q=80`}
                alt={card.name ?? pageContent.fallbackAlt}
                loading="lazy"
                onError={handleImageFallback}
              />
              {card.name && (
                <div className="photo-card-label">
                  <span className="photo-card-name">{card.name}</span>
                  <span className="photo-card-tag">{card.tag}</span>
                </div>
              )}
            </>
          )
          const className = `photo-card photo-card-${i % 3}`
          const recipeId = card.name ? recipeIds[card.name] : undefined
          return recipeId ? (
            <Link
              key={`${card.img}-${i}`}
              to={`/recipe/${recipeId}`}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div key={`${card.img}-${i}`} className={className}>
              {content}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
