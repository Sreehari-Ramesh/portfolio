import { useEffect, useRef, useState } from 'react'
import AttentionText from './components/AttentionText'
import ContactForm from './components/ContactForm'
import Cursor from './components/Cursor'
import DotField from './components/DotField'
import Project from './components/Project'
import SocialLinks from './components/SocialLinks'
import StreamText from './components/StreamText'
import Timeline from './components/Timeline'
import ToolRibbons from './components/ToolRibbons'
import { earlier, experience, facts, featured, principles, profile, stack, statement } from './data'

const GREETING = `Hi, I'm ${profile.name}.`
const TAGLINE = 'I build AI agents that reason, retrieve and work together.'
const SUBLINE =
  'Trained as a physicist. Now I design multi-agent systems, retrieval pipelines and the backends that run them in production.'

const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
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
      <DotField />
      <Cursor />
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
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="identity">
                <img
                  className="avatar"
                  src="./portrait.png"
                  width={72}
                  height={72}
                  alt={`Illustrated portrait of ${profile.name}`}
                />
                <div>
                  <p className="kicker">
                    {profile.role}, {profile.location}
                  </p>
                  <p className="status">
                    <span className="live-dot" aria-hidden="true" />
                    Open to AI engineering roles
                  </p>
                </div>
              </div>
              <StreamText as="h1" text={GREETING} mark={profile.name} delay={400} />
              <p className="lede">{TAGLINE}</p>
              <p className="sub">{SUBLINE}</p>
              <div className="actions">
                <a className="btn primary" href="#work">
                  See my work
                </a>
                <a className="btn" href={`mailto:${profile.email}`}>
                  Email me
                </a>
              </div>
            </div>
          </div>
          <p className="hint" aria-hidden="true">
            <span className="mouse">Move your cursor to drag the dots. Click to send a burst.</span>
            <span className="touch">Drag across the screen to move the dots. Tap to send a burst.</span>
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

          <section id="experience" className="experience">
            <h2 className="node">Experience</h2>
            <p className="section-lede">
              Three years building AI in production, and what it changed at each place.
            </p>
            <Timeline roles={experience} />
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
            <h2 className="node end">Let's work together</h2>
            <div className="contact-grid">
              <div className="contact-intro">
                <p className="contact-lede">
                  Hiring for an AI role, planning a project, or have a question about my work?
                  Send a message and I'll reply by email.
                </p>
                <a className="email" href={`mailto:${profile.email}`}>
                  {/* if the address must wrap, break it after the @ rather than mid-word */}
                  {profile.email.split('@')[0]}@<wbr />
                  {profile.email.split('@')[1]}
                </a>
                <SocialLinks />
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
