import { useState } from 'react'

// A sentence you can probe like a transformer's attention map: point at a
// word and every other word is tinted by how strongly that word "attends"
// to it. Hand-picked links carry the meaning; everything else falls off
// with distance, the way nearby tokens usually get some attention.

type Weights = Record<string, Record<string, number>>

const key = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '')

export default function AttentionText({ text, links }: { text: string; links: Weights }) {
  const words = text.split(' ')
  const [focus, setFocus] = useState<number | null>(null)

  const weight = (i: number) => {
    if (focus === null) return 0
    if (i === focus) return 1
    const linked = links[key(words[focus])]?.[key(words[i])]
    const near = Math.max(0, 0.32 - Math.abs(i - focus) * 0.08)
    return Math.max(linked ?? 0, near)
  }

  return (
    <p className="statement attention" onMouseLeave={() => setFocus(null)}>
      {words.map((w, i) => (
        <span key={i}>
          <span
            className={`tok${i === focus ? ' query' : ''}`}
            style={{ ['--w' as string]: weight(i).toFixed(2) }}
            onMouseEnter={() => setFocus(i)}
            onClick={() => setFocus(i === focus ? null : i)}
          >
            {w}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}
