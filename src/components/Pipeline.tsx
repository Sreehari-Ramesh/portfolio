import { useEffect, useRef, useState } from 'react'
import type { Stage } from '../data'

// A project's architecture as stages a message travels through. Run sends the
// message end to end; clicking a stage jumps straight to it.

const STEP_MS = 1300

export default function Pipeline({ stages, name }: { stages: Stage[]; name: string }) {
  const [active, setActive] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const run = () => {
    window.clearTimeout(timer.current)
    setDone(false)
    setRunning(true)
    setActive(0)
    const next = (i: number) => {
      timer.current = window.setTimeout(() => {
        setActive(i)
        if (i < stages.length - 1) next(i + 1)
        else {
          setRunning(false)
          setDone(true)
        }
      }, STEP_MS)
    }
    next(1)
  }

  const pick = (i: number) => {
    window.clearTimeout(timer.current)
    setRunning(false)
    setDone(i === stages.length - 1)
    setActive(i)
  }

  const last = stages.length - 1

  return (
    <div className="pipeline" style={{ ['--n' as string]: stages.length, ['--pos' as string]: active }}>
      <div className="rail">
      <div className="track" aria-hidden="true">
        <span className="track-fill" />
        <span className={`packet ${done ? 'arrived' : ''} ${running ? 'moving' : ''}`} />
      </div>
      <ol className="stages" aria-label={`How ${name} works`}>
        {stages.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              className={`stage ${i <= active ? 'reached' : ''} ${i === last ? 'end' : ''}`}
              aria-pressed={i === active}
              onClick={() => pick(i)}
            >
              <span className="dot" />
              <span className="stage-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
      </div>
      <div className="pipeline-foot">
        <p className="caption" aria-live="polite" key={active}>
          {stages[active].text}
        </p>
        <button type="button" className="btn run" onClick={run} disabled={running}>
          {running ? 'Running…' : done ? 'Run again' : 'Run pipeline'}
        </button>
      </div>
    </div>
  )
}
