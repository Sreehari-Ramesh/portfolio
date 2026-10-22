import { useEffect, useRef, useState } from 'react'
import type { Diagram as DiagramData } from '../data'

// A map of how a project's parts connect, drawn like the hero field: green
// nodes and links, with the result people get back in plaid red. It draws
// itself the first time it scrolls into view, and nodes named in `active`
// are lit while the rest dim.

export default function Diagram({
  data,
  name,
  active = [],
}: {
  data: DiagramData
  name: string
  active?: string[]
}) {
  const ref = useRef<SVGSVGElement>(null)
  const [drawn, setDrawn] = useState(false)
  const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]))
  const pattern = `grid-${name.replace(/\W+/g, '')}`
  const description = data.edges.map(([a, b]) => `${byId[a].label} to ${byId[b].label}`).join(', ')
  const on = new Set(active)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [])

  const classes = ['diagram', drawn && 'drawn', on.size > 0 && 'focusing'].filter(Boolean).join(' ')

  return (
    <svg ref={ref} className={classes} viewBox="0 0 600 400" role="img" aria-label={`How ${name} fits together: ${description}`}>
      <defs>
        <pattern id={pattern} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.1" className="grid-dot" />
        </pattern>
      </defs>
      <rect width="600" height="400" fill={`url(#${pattern})`} />

      {data.edges.map(([a, b], i) => {
        const from = byId[a]
        const to = byId[b]
        const lit = on.has(a) && on.has(b)
        return (
          <line
            key={a + b}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            pathLength={1}
            style={{ ['--i' as string]: i }}
            className={['edge', to.out && 'to-out', lit && 'lit'].filter(Boolean).join(' ')}
          />
        )
      })}

      {data.nodes.map((n, i) => (
        <g
          key={n.id}
          style={{ ['--i' as string]: i }}
          className={['d-node', n.out && 'out', on.has(n.id) && 'lit'].filter(Boolean).join(' ')}
        >
          {n.out && <circle cx={n.x} cy={n.y} r="24" className="halo" />}
          <circle cx={n.x} cy={n.y} r="11" className="core" />
          <text x={n.x} y={n.y + 38} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
