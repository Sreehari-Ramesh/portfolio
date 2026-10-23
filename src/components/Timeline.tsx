import { useEffect, useRef, useState } from 'react'
import type { Role } from '../data'

// Experience as one timeline, newest first. Each company slides in as it
// scrolls into view and its results follow one after another. Entries are
// only hidden once this script has run ("armed"), so nothing is lost
// without JavaScript, and reduced motion shows everything at once.

export default function Timeline({ roles }: { roles: Role[] }) {
  const list = useRef<HTMLOListElement>(null)
  const [armed, setArmed] = useState(false)
  const [shown, setShown] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = [...list.current!.querySelectorAll<HTMLElement>(':scope > li')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = items.indexOf(e.target as HTMLElement)
          setShown((s) => new Set(s).add(i))
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.15 },
    )
    items.forEach((el) => io.observe(el))
    setArmed(true)
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={list} className={`timeline${armed ? ' armed' : ''}`}>
      {roles.map((r, i) => (
        <li key={r.org} className={`entry${shown.has(i) ? ' in' : ''}${i === 0 ? ' current' : ''}`}>
          <div className="entry-meta">
            <span className="entry-period">{r.period}</span>
            <span className="entry-place">{r.place}</span>
          </div>
          <div className="entry-main">
            <h3>{r.org}</h3>
            <p className="entry-role">{r.role}</p>
            <p className="entry-summary">{r.summary}</p>
            {r.results.length > 0 && (
              <ul className={r.results.some((x) => x.figure) ? 'results figures' : 'results'}>
                {r.results.map((x, k) => (
                  <li
                    key={x.text}
                    className={x.figure ? 'with-figure' : ''}
                    style={{ ['--k' as string]: k }}
                  >
                    {x.figure && <span className="result-figure">{x.figure}</span>}
                    <span className="result-text">{x.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
