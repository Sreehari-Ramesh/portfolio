import { useEffect, useMemo, useState, type ElementType } from 'react'

// Reveals text the way a language model streams a reply: a few characters
// (one "token") at a time, with a caret while it writes. The full text is
// laid out invisibly underneath so nothing shifts, and screen readers get the
// whole text at once. `delay` lets one line start after another finishes.

const TOKEN_MS = 55

function tokenize(text: string) {
  const tokens: string[] = []
  for (const word of text.match(/\s*\S+/g) ?? []) {
    // split longer words into sub-word pieces, as real tokenizers do
    if (word.trim().length > 6) {
      const cut = word.length - Math.ceil(word.trim().length / 2)
      tokens.push(word.slice(0, cut), word.slice(cut))
    } else tokens.push(word)
  }
  return tokens
}

// roughly how long a line takes to stream, so the next can start after it
export const streamDuration = (text: string) => tokenize(text).length * (TOKEN_MS + 20)

export default function StreamText({
  text,
  as: Tag = 'p',
  className,
  delay = 350,
  holdCaret = 1800,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  holdCaret?: number
}) {
  const tokens = useMemo(() => tokenize(text), [text])
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduce ? tokens.length : 0)
  const [settled, setSettled] = useState(reduce)

  useEffect(() => {
    if (reduce) return
    let i = 0
    let timer = window.setTimeout(function tick() {
      i += 1
      setCount(i)
      if (i < tokens.length) timer = window.setTimeout(tick, TOKEN_MS + Math.random() * 40)
      else timer = window.setTimeout(() => setSettled(true), holdCaret)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [tokens, reduce, delay, holdCaret])

  const writing = count > 0 && !settled

  return (
    <Tag className={`stream ${className ?? ''}`}>
      <span className="sr-only">{text}</span>
      <span className="stream-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="stream-live" aria-hidden="true">
        {tokens.slice(0, count).join('')}
        {writing && <span className="caret" />}
      </span>
    </Tag>
  )
}
