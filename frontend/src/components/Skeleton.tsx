interface BlockProps {
  width?: string | number
  height?: string | number
  radius?: string | number
  className?: string
}

export const SkelBlock = ({ width, height, radius, className = '' }: BlockProps) => (
  <span
    className={`skel-block ${className}`}
    style={{ width, height, borderRadius: radius }}
  />
)

// Shared by History and Reminders pages — both render a day-grouped
// "history-entry" row list, so one skeleton shape covers both.
export const TimelinePageSkeleton = () => (
  <div className="page">
    <div className="hero-page-header">
      <div>
        <SkelBlock width="7rem" height="0.9rem" />
        <SkelBlock width="10rem" height="1.8rem" />
        <SkelBlock width="15rem" height="1rem" />
      </div>
    </div>
    <div className="history-timeline">
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="history-day-group">
          <div className="history-day-marker">
            <span className="history-day-dot" />
            <SkelBlock width="5rem" height="0.9rem" />
          </div>
          <div className="history-day-entries">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="history-entry">
                <span className="history-entry-link">
                  <SkelBlock width="1.1em" height="1.1em" radius="50%" />
                  <SkelBlock width="45%" height="0.9rem" />
                  <SkelBlock width="3rem" height="0.78rem" />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)
