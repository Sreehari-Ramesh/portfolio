import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Job } from '../data'

export default function Experience({ jobs }: { jobs: Job[] }) {
  // open on the most recent role that has something to show
  const [current, setCurrent] = useState(() => Math.max(0, jobs.findIndex((j) => j.highlights.length > 0)))
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const job = jobs[current]

  // on narrow screens the tabs scroll sideways; keep the selected one in view
  // without scrolling the page itself
  useEffect(() => {
    const tab = tabs.current[current]
    const row = tab?.parentElement
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return
    row.scrollTo({ left: tab.offsetLeft - row.offsetLeft - 16, behavior: 'smooth' })
  }, [current])

  const onKey = (e: KeyboardEvent) => {
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!delta) return
    e.preventDefault()
    const next = (current + delta + jobs.length) % jobs.length
    setCurrent(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="jobs">
      <div className="job-tabs" role="tablist" aria-label="Companies" aria-orientation="vertical" onKeyDown={onKey}>
        {jobs.map((j, i) => (
          <button
            key={j.org}
            ref={(el) => (tabs.current[i] = el)}
            role="tab"
            id={`tab-${i}`}
            aria-selected={i === current}
            aria-controls="job-panel"
            tabIndex={i === current ? 0 : -1}
            className="job-tab"
            onClick={() => setCurrent(i)}
          >
            <span className="tab-org">{j.org}</span>
            <span className="tab-period">{j.period}</span>
          </button>
        ))}
      </div>

      <div className="job-panel" role="tabpanel" id="job-panel" aria-labelledby={`tab-${current}`} key={current}>
        <h3>{job.roles.join(', then ')}</h3>
        <p className="job-meta">
          {job.org}, {job.place}
        </p>
        {job.intro && <p className="job-intro">{job.intro}</p>}
        {job.highlights.length > 0 && (
          <ul className={job.highlights.some((h) => h.figure) ? 'impact' : 'plain'}>
            {job.highlights.map((h) => (
              <li key={h.text}>
                {h.figure && <span className="figure">{h.figure}</span>}
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
