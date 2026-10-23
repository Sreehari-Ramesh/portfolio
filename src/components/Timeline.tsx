import { useEffect, useRef, useState } from 'react'
import type { Role } from '../data'
import StreamText from './StreamText'

// Experience as one timeline, newest first, every company laid out the same
// way. As each company scrolls into view its lines rise into place one after
// another, and its description types itself out like the hero text. Lines
// are only hidden once this script is watching ("armed"), so nothing is lost
// without JavaScript, and reduced motion shows everything at once.

export default function Timeline({ roles }: { roles: Role[] }) {
  const list = useRef<HTMLOListElement>(null)
  const [armed, setArmed] = useState(false)
  const [typing, setTyping] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyping(new Set(roles.map((_, i) => i)))
      return
    }
    const root = list.current!
    const io = new IntersectionObserver(
      (entries) => {
        // lines that arrive together reveal one after another
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, k) => {
            const el = e.target as HTMLElement
            el.style.transitionDelay = `${k * 110}ms`
            el.classList.add('in')
            io.unobserve(el)
            const entry = el.dataset.typeEntry
            if (entry !== undefined) {
              const i = Number(entry)
              window.setTimeout(() => setTyping((s) => new Set(s).add(i)), k * 110 + 150)
            }
          })
      },
      // reveal once a line is a fifth of the way up the screen, so it is seen arriving
      { rootMargin: '0px 0px -20% 0px' },
    )
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el))
    setArmed(true)
    return () => io.disconnect()
  }, [roles])

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
            <div className="entry-summary" data-reveal data-type-entry={i}>
              <StreamText text={r.summary} as="p" delay={0} holdCaret={900} active={typing.has(i)} />
            </div>
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
