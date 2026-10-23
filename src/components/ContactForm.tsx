import { useEffect, useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'

type Fields = { topic: string; name: string; email: string; message: string }

// what people can write about; the choice is sent and used in the subject line
const TOPICS = ['Hiring', 'A project', 'A question']

// Sends messages through Formspree, which forwards them to Sreehari's inbox.
// People first pick what they're writing about, which lands in the email's
// subject line. The browser checks required fields first; Formspree's own
// field errors (for example a rejected email address) appear under the
// matching field.

export default function ContactForm({ formId }: { formId: string }) {
  const [topic, setTopic] = useState(TOPICS[0])
  const [state, handleSubmit, reset] = useForm<Fields>(formId, {
    data: { _subject: `Portfolio: ${topic}` },
  })
  const done = useRef<HTMLHeadingElement>(null)

  // move focus to the confirmation so keyboard and screen reader users hear it
  useEffect(() => {
    if (state.succeeded) done.current?.focus()
  }, [state.succeeded])

  if (state.succeeded) {
    return (
      <div className="form-done" role="status">
        <h3 tabIndex={-1} ref={done}>
          Message sent
        </h3>
        <p>Thanks for writing. I'll reply to the email address you gave.</p>
        <button type="button" className="btn" onClick={reset}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <fieldset className="topics">
        <legend>What's this about?</legend>
        <div className="topic-chips">
          {TOPICS.map((t) => (
            <label key={t} className="topic">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={topic === t}
                onChange={() => setTopic(t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-field">
        <label htmlFor="cf-name">Your name</label>
        <input id="cf-name" name="name" type="text" autoComplete="name" required maxLength={120} />
        <ValidationError className="field-error" field="name" prefix="Name" errors={state.errors} />
      </div>

      <div className="form-field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={200}
        />
        <ValidationError className="field-error" field="email" prefix="Email" errors={state.errors} />
      </div>

      <div className="form-field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          placeholder="What are you working on, and how can I help?"
        />
        <ValidationError className="field-error" field="message" prefix="Message" errors={state.errors} />
      </div>

      {/* honeypot: hidden from people, filled in by spam bots, rejected by Formspree */}
      <input type="text" name="_gotcha" className="gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <ValidationError className="form-error" errors={state.errors} role="alert" />

      <button type="submit" className="btn primary" disabled={state.submitting}>
        {state.submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
