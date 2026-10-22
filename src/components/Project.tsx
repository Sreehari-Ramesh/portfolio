import { useState } from 'react'
import type { Project as ProjectData } from '../data'
import Diagram from './Diagram'

// A project spread. Pointing at (or focusing) a highlight lights up the
// parts of the diagram that make it happen.

export default function Project({ project: p, flip }: { project: ProjectData; flip: boolean }) {
  const [active, setActive] = useState<string[]>([])

  return (
    <article className={`project tone-${p.tone}${flip ? ' flip' : ''}`}>
      <div className="project-visual">
        <Diagram data={p.diagram} name={p.name} active={active} />
      </div>
      <div className="project-text">
        <h3>{p.name}</h3>
        <p className="summary">{p.summary}</p>
        <ul className="highlights" onMouseLeave={() => setActive([])}>
          {p.highlights.map((h) => (
            <li
              key={h.text}
              tabIndex={0}
              className={active === h.nodes ? 'on' : ''}
              onMouseEnter={() => setActive(h.nodes)}
              onFocus={() => setActive(h.nodes)}
              onBlur={() => setActive([])}
            >
              {h.text}
            </li>
          ))}
        </ul>
        <p className="tags">{p.stack.join(', ')}</p>
        {p.repo ? (
          <a className="link" href={p.repo} target="_blank" rel="noreferrer">
            View the code on GitHub
          </a>
        ) : (
          <p className="context">{p.context}</p>
        )}
      </div>
    </article>
  )
}
