import { useEffect, useRef } from 'react'
import { useForm, ValidationError } from '@formspree/react'

type Fields = { name: string; email: string; message: string }

// Sends messages through Formspree, which forwards them to Sreehari's inbox.
// The browser checks required fields first; Formspree's own field errors
// (for example a rejected email address) appear under the matching field.

export default function ContactForm({ formId }: { formId: string }) {
  const [state, handleSubmit, reset] = useForm<Fields>(formId, {
    data: { _subject: 'New message from your portfolio' },
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
