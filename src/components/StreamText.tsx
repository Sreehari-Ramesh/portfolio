import { useEffect, useMemo, useState } from 'react'

// Reveals a sentence the way a language model streams a reply: a few
// characters (one "token") at a time, with a caret that blinks while it
// writes. The full sentence is laid out invisibly underneath so nothing
// shifts, and screen readers get the whole sentence at once.

const TOKEN_MS = 55
const START_MS = 350

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

export default function StreamText({ text, className }: { text: string; className?: string }) {
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
      else timer = window.setTimeout(() => setSettled(true), 1800)
    }, START_MS)
    return () => window.clearTimeout(timer)
  }, [tokens, reduce])

  return (
    <p className={`stream ${className ?? ''}`}>
      <span className="sr-only">{text}</span>
      <span className="stream-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="stream-live" aria-hidden="true">
        {tokens.slice(0, count).join('')}
        {!settled && <span className="caret" />}
      </span>
    </p>
  )
}
