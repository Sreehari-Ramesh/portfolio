import { useEffect, useRef, useState } from 'react'
import Field from './components/Field'
import AttentionText from './components/AttentionText'
import ContactForm from './components/ContactForm'
import Project from './components/Project'
import StreamText from './components/StreamText'
import ToolRibbons from './components/ToolRibbons'
import { career, earlier, facts, featured, impact, principles, profile, stack, statement } from './data'

const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'impact', label: 'Impact' },
  { id: 'approach', label: 'Approach' },
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
          {SECTIONS.map((s) => (
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
            <StreamText className="lede" text="I build AI agents that reason, retrieve and work together." />
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
            <span className="touch">Tap</span> anywhere to fire a neuron
          </p>
        </section>

        <div className="path" ref={path}>
          <span className="path-line" aria-hidden="true">
            <span className="path-fill" />
          </span>

          <section id="work" className="work">
            <h2 className="node">Selected work</h2>
            <p className="section-lede">
              Three systems I designed and built end to end, from offline document AI to
              agents that book trips.
            </p>

            <div className="projects">
              {featured.map((p) => (
                <Project key={p.name} project={p} />
              ))}
            </div>

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

          <section id="impact" className="impact-section">
            <h2 className="node">Impact in production</h2>
            <p className="section-lede">
              What the systems I've shipped changed for the teams using them.
            </p>
            <ul className="impact-grid">
              {impact.map((i) => (
                <li key={i.figure}>
                  <span className="impact-figure">{i.figure}</span>
                  <span className="impact-text">{i.text}</span>
                  <span className="impact-where">{i.where}</span>
                </li>
              ))}
            </ul>

            <h3 className="career-title">Where I've worked</h3>
            <ol className="career">
              {career.map((c) => (
                <li key={c.org}>
                  <span className="career-period">{c.period}</span>
                  <span className="career-org">{c.org}</span>
                  <span className="career-role">
                    {c.role}, {c.place}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section id="approach" className="about">
            <h2 className="node">How I build</h2>
            <div className="about-grid">
              <div className="statement-wrap">
                <AttentionText text={statement.text} links={statement.links} />
                <p className="probe-hint" aria-hidden="true">
                  <span className="mouse">Point at</span>
                  <span className="touch">Tap</span> a word to see which others it attends to,
                  like a language model reading this sentence.
                </p>
              </div>
              <dl className="facts">
                {facts.map((f) => (
                  <div key={f.term}>
                    <dt>{f.term}</dt>
                    <dd>{f.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ul className="principles">
              {principles.map((p) => (
                <li key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="stack" className="stack-section">
            <h2 className="node">What I work with</h2>
            <p className="section-lede">
              The frameworks, models and infrastructure I use to build, test and ship AI
              systems.
            </p>
            <ToolRibbons groups={stack} />
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
