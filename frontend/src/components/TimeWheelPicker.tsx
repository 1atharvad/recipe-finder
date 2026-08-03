import { useLayoutEffect, useRef, useEffect } from 'react'

const ITEM_HEIGHT = 44
const VISIBLE_ROWS = 5
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2)

interface WheelColumnProps {
  values: (string | number)[]
  index: number
  onChange: (index: number) => void
}

// A single scroll-snapped column — the two-digit hour/minute wheels and the
// AM/PM wheel are all just this with a different `values` list.
const WheelColumn = ({ values, index, onChange }: WheelColumnProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout>>()
  // Tracks the index this column last scrolled itself to (via user drag or
  // click) so the sync effect below can tell "index changed because we
  // caused it" apart from "index changed externally" (e.g. a parent's
  // "reset to now" button) — only the latter should force a re-scroll.
  const lastOwnIndex = useRef(index)

  useLayoutEffect(() => {
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT })
    lastOwnIndex.current = index
    // Intentionally mount-only — later `index` changes are handled by the
    // sync effect below, which needs the smooth-scroll behavior this doesn't have.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (index === lastOwnIndex.current) return
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
    lastOwnIndex.current = index
  }, [index])

  const handleScroll = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const i = Math.round(el.scrollTop / ITEM_HEIGHT)
      const clamped = Math.min(Math.max(i, 0), values.length - 1)
      lastOwnIndex.current = clamped
      onChange(clamped)
    }, 100)
  }

  const selectValue = (i: number) => {
    ref.current?.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' })
    lastOwnIndex.current = i
    onChange(i)
  }

  return (
    <div className="wheel-column" ref={ref} onScroll={handleScroll}>
      <div className="wheel-pad" style={{ height: ITEM_HEIGHT * PAD_ROWS }} />
      {values.map((v, i) => (
        <div
          key={v}
          className={`wheel-item${i === index ? ' selected' : ''}`}
          style={{ height: ITEM_HEIGHT }}
          onClick={() => selectValue(i)}
        >
          {v}
        </div>
      ))}
      <div className="wheel-pad" style={{ height: ITEM_HEIGHT * PAD_ROWS }} />
    </div>
  )
}

export interface TimeValue {
  hour: number // 1-12
  minute: number // 0-59
  period: 'AM' | 'PM'
}

interface Props {
  value: TimeValue
  onChange: (value: TimeValue) => void
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM']

export const TimeWheelPicker = ({ value, onChange }: Props) => (
  <div className="time-wheel-picker">
    <div className="wheel-highlight" style={{ height: ITEM_HEIGHT }} />
    <WheelColumn
      values={HOURS}
      index={value.hour - 1}
      onChange={i => onChange({ ...value, hour: HOURS[i] })}
    />
    <span className="wheel-separator">:</span>
    <WheelColumn
      values={MINUTES}
      index={value.minute}
      onChange={i => onChange({ ...value, minute: i })}
    />
    <WheelColumn
      values={PERIODS}
      index={value.period === 'AM' ? 0 : 1}
      onChange={i => onChange({ ...value, period: PERIODS[i] })}
    />
  </div>
)
