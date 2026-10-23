import { useEffect, useMemo, useState, type ElementType } from 'react'

// Reveals text the way a language model streams a reply: a few characters
// (one "token") at a time, with a caret while it writes. The full text is
// laid out invisibly underneath so nothing shifts, and screen readers get the
// whole text at once. `delay` lets one line start after another finishes,
// and `active` holds a line back until it is wanted (for example, in view).

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

export default function StreamText({
  text,
  as: Tag = 'p',
  className,
  delay = 350,
  holdCaret = 1800,
  active = true,
  mark,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  holdCaret?: number
  // stays blank until true, so a line can wait to be scrolled into view
  active?: boolean
  // a phrase within the text to set in the accent colour
  mark?: string
}) {
  const tokens = useMemo(() => tokenize(text), [text])
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduce ? tokens.length : 0)
  const [settled, setSettled] = useState(reduce)

  useEffect(() => {
    if (reduce || !active) return
    let i = 0
    let timer = window.setTimeout(function tick() {
      i += 1
      setCount(i)
      if (i < tokens.length) timer = window.setTimeout(tick, TOKEN_MS + Math.random() * 40)
      else timer = window.setTimeout(() => setSettled(true), holdCaret)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [tokens, reduce, delay, holdCaret, active])

  const writing = count > 0 && !settled

  // colour the marked phrase in whatever part of the text is showing so far
  const at = mark ? text.indexOf(mark) : -1
  const paint = (shown: string) => {
    if (at < 0 || !mark) return shown
    const end = at + mark.length
    return (
      <>
        {shown.slice(0, at)}
        <span className="mark">{shown.slice(at, end)}</span>
        {shown.slice(end)}
      </>
    )
  }

  return (
    <Tag className={`stream ${className ?? ''}`}>
      <span className="sr-only">{text}</span>
      <span className="stream-ghost" aria-hidden="true">
        {paint(text)}
      </span>
      <span className="stream-live" aria-hidden="true">
        {paint(tokens.slice(0, count).join(''))}
        {writing && <span className="caret" />}
      </span>
    </Tag>
  )
}
