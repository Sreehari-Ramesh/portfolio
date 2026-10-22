import { useEffect, useRef, useState } from 'react'
import Experience from './components/Experience'
import Field from './components/Field'
import ContactForm from './components/ContactForm'
import Diagram from './components/Diagram'
import { earlier, education, extras, facts, featured, jobs, profile, stack } from './data'

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
]

// Fills the signal line as you scroll and lights each section's node once the
// reading line (60% down the viewport) passes it.
function useSignalPath() {
  const path = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = path.current
      if (!el) return
      const line = window.innerHeight * 0.6
      const rect = el.getBoundingClientRect()
      // the line stops at the centre of the last node's dot
      const nodes = el.querySelectorAll<HTMLElement>('.node')
      const end = nodes[nodes.length - 1]
      const endSize = parseFloat(getComputedStyle(end).fontSize)
      const lineH = end.getBoundingClientRect().top - rect.top + endSize * 0.5
      el.style.setProperty('--line-h', `${lineH}px`)
      const p = Math.min(1, Math.max(0, (line - rect.top) / lineH))
      el.style.setProperty('--p', p.toFixed(4))
      let here = ''
      nodes.forEach((node) => {
        const lit = node.getBoundingClientRect().top < line
        node.classList.toggle('lit', lit)
        if (lit) here = node.closest('section')?.id ?? here
      })
      // the last node sits low on the page, so count reaching the bottom as arriving
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        el.querySelectorAll('.node').forEach((n) => n.classList.add('lit'))
        el.style.setProperty('--p', '1')
        here = 'contact'
      }
      setCurrent(here)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { path, current }
}

export default function App() {
  const { path, current } = useSignalPath()
  const [showEarlier, setShowEarlier] = useState(false)

  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>

      <header className="nav">
        <a href="#top" className="mark">
          {profile.name}
        </a>
        <nav aria-label="Sections">
          {SECTIONS.filter((s) => s.id !== 'about').map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero" id="top">
          <Field />
          <div className="hero-copy">
            <h1>{profile.name}</h1>
            <p className="lede">I build AI agents that reason, retrieve and work together.</p>
            <p className="sub">
              {profile.role} in the {profile.location}, trained as a physicist.
            </p>
            <div className="actions">
              <a className="btn primary" href="#work">
                See my work
              </a>
              <a className="btn" href={`mailto:${profile.email}`}>
                Email me
              </a>
            </div>
          </div>
          <figure className="portrait">
            <img
              src="./portrait.png"
              width={400}
              height={400}
              alt={`Illustrated portrait of ${profile.name}`}
            />
          </figure>
          <p className="hint">
            <span className="mouse">Click</span>
            <span className="touch">Tap</span> anywhere to send a message between agents
          </p>
        </section>

        <div className="path" ref={path}>
          <span className="path-line" aria-hidden="true">
            <span className="path-fill" />
          </span>

          <section id="about" className="about">
            <h2 className="node">Many parts, one system</h2>
            <div className="about-grid">
              <p className="statement">
                Physics taught me to model systems of many interacting parts. Now the parts
                are language models, tools and the people who check their work.
              </p>
              <dl className="facts">
                {facts.map((f) => (
                  <div key={f.term}>
                    <dt>{f.term}</dt>
                    <dd>{f.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section id="work" className="work">
            <h2 className="node">Selected work</h2>
            <p className="section-lede">
              Three systems I designed and built end to end, from offline document AI to
              agents that book trips.
            </p>

            {featured.map((p, i) => (
              <article className={`project tone-${p.tone}${i % 2 ? ' flip' : ''}`} key={p.name}>
                <div className="project-visual">
                  <Diagram data={p.diagram} name={p.name} />
                </div>
                <div className="project-text">
                  <h3>{p.name}</h3>
                  <p className="summary">{p.summary}</p>
                  <ul className="highlights">
                    {p.highlights.map((h) => (
                      <li key={h}>{h}</li>
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
            ))}

            <div className="earlier-wrap">
              <button
                type="button"
                className="toggle"
                aria-expanded={showEarlier}
                aria-controls="earlier"
                onClick={() => setShowEarlier((v) => !v)}
              >
                {showEarlier ? 'Hide earlier projects' : `Show ${earlier.length} earlier projects`}
              </button>
              <ul className="earlier" id="earlier" hidden={!showEarlier}>
                {earlier.map((e) => (
                  <li key={e.repo}>
                    <a href={`${profile.github}/${e.repo}`} target="_blank" rel="noreferrer">
                      <span className="e-name">{e.name}</span>
                      <span className="e-note">{e.note}</span>
                      <span className="e-kind">{e.kind}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="experience" className="experience">
            <h2 className="node">Experience</h2>
            <Experience jobs={jobs} />

            <div className="background">
              <div>
                <h3>Education</h3>
                <ul>
                  {education.map((e) => (
                    <li key={e.title}>
                      <strong>{e.title}</strong>
                      <span>
                        {e.org}, {e.period}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {extras.map((x) => (
                <div key={x.label}>
                  <h3>{x.label}</h3>
                  <ul>
                    {x.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="stack" className="stack-section">
            <h2 className="node">What I work with</h2>
            <dl className="stack">
              {stack.map((s) => (
                <div key={s.group}>
                  <dt>{s.group}</dt>
                  <dd>
                    {s.items.map((i) => (
                      <span key={i}>{i}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="contact" className="contact">
            <h2 className="node end">Send me a message</h2>
            <div className="contact-grid">
              <div className="contact-intro">
                <p className="contact-lede">
                  I'm open to AI engineering roles and collaborations on agents, RAG and
                  LLMOps. Use the form, or email me directly.
                </p>
                <a className="email" href={`mailto:${profile.email}`}>
                  {/* if the address must wrap, break it after the @ rather than mid-word */}
                  {profile.email.split('@')[0]}@<wbr />
                  {profile.email.split('@')[1]}
                </a>
                <p className="elsewhere">
                  <a href={profile.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                  <a href={profile.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </p>
              </div>
              <ContactForm formId={profile.formspreeId} />
            </div>
          </section>
        </div>
      </main>

      <footer className="foot">
        <p>
          {profile.name}, {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}
