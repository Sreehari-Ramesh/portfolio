import { useEffect, useRef, useState } from 'react'
import type { Role } from '../data'

// Experience as one timeline, newest first, every company laid out the same
// way. Each line (company, role, description, every result) rises into place
// on its own as it scrolls into view, so the story unfolds as you read.
// Lines are only hidden once this script is watching ("armed"), so nothing is
// lost without JavaScript, and reduced motion shows everything at once.

export default function Timeline({ roles }: { roles: Role[] }) {
  const list = useRef<HTMLOListElement>(null)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lines = list.current!.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        // lines that arrive together reveal one after another
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, k) => {
            const el = e.target as HTMLElement
            el.style.transitionDelay = `${k * 70}ms`
            el.classList.add('in')
            io.unobserve(el)
          })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    lines.forEach((el) => io.observe(el))
    setArmed(true)
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={list} className={`timeline${armed ? ' armed' : ''}`}>
      {roles.map((r, i) => (
        <li key={r.org} className={`entry${i === 0 ? ' current' : ''}`}>
          <div className="entry-meta" data-reveal>
            <span className="entry-period">{r.period}</span>
            <span className="entry-place">{r.place}</span>
          </div>
          <div className="entry-main">
            <h3 data-reveal>{r.org}</h3>
            <p className="entry-role" data-reveal>
              {r.role}
            </p>
            <p className="entry-summary" data-reveal>
              {r.summary}
            </p>
            {r.results.length > 0 && (
              <ul className="results">
                {r.results.map((x) => (
                  <li key={x.text} data-reveal>
                    {x.figure && <strong className="result-figure">{x.figure}</strong>} {x.text}
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
