import { useMemo, useState } from 'react'
import type { SkillGroup } from '../data'

// The tool list drawn like a 2D embedding plot: every tool is a point and
// tools used for the same job form a cluster. The layout is hand-arranged,
// not computed. Pick a cluster to list its tools; point at a dot to name it.

const W = 1000
const H = 560

// small deterministic hash so points keep their places between renders
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export default function SkillSpace({ groups }: { groups: SkillGroup[] }) {
  const [selected, setSelected] = useState(groups[0].group)
  const [hovered, setHovered] = useState<string | null>(null)

  const clusters = useMemo(
    () =>
      groups.map((g) => {
        const cx = 70 + g.x * (W - 140)
        const cy = 50 + g.y * (H - 100)
        // sunflower spiral with a little per-tool jitter reads as organic, not gridded
        const points = g.items.map((name, k) => {
          const h = hash(name)
          const r = 24 * Math.sqrt(k + 0.7) + (h % 9)
          const a = k * 2.399 + ((h % 100) / 100) * 0.6
          return { name, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * 0.85 }
        })
        const radius = Math.max(...points.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 22
        return { ...g, cx, cy, points, radius }
      }),
    [groups],
  )

  const current = clusters.find((c) => c.group === selected)!
  const hoverPoint = hovered ? clusters.flatMap((c) => c.points).find((p) => p.name === hovered) : null

  return (
    <div className="space">
      <div className="space-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of the tools I use, grouped into clusters by what they are for">
          <defs>
            <pattern id="space-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" className="space-gridline" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#space-grid)" />

          {clusters.map((c) => {
            const on = c.group === selected
            return (
              <g
                key={c.group}
                className={`cluster${on ? ' on' : ''}`}
                onMouseEnter={() => setSelected(c.group)}
                onClick={() => setSelected(c.group)}
              >
                <circle cx={c.cx} cy={c.cy} r={c.radius} className="hull" />
                {on &&
                  c.points.map((p) => (
                    <line key={p.name} x1={c.cx} y1={c.cy} x2={p.x} y2={p.y} className="spoke" />
                  ))}
                {c.points.map((p) => (
                  <circle
                    key={p.name}
                    cx={p.x}
                    cy={p.y}
                    r={on ? 7 : 5}
                    className="pt"
                    onMouseEnter={() => setHovered(p.name)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <title>{p.name}</title>
                  </circle>
                ))}
                <text x={c.cx} y={c.cy - c.radius - 10} textAnchor="middle" className="cluster-name">
                  {c.group}
                </text>
              </g>
            )
          })}

          {hoverPoint && (
            <text x={hoverPoint.x + 12} y={hoverPoint.y - 12} className="pt-label">
              {hoverPoint.name}
            </text>
          )}
        </svg>
      </div>

      <div className="space-side">
        <div className="space-picker" role="group" aria-label="Choose a cluster">
          {clusters.map((c) => (
            <button
              key={c.group}
              type="button"
              aria-pressed={c.group === selected}
              onClick={() => setSelected(c.group)}
            >
              {c.group}
            </button>
          ))}
        </div>
        <div className="space-list" aria-live="polite">
          <h3>{current.group}</h3>
          <ul>
            {current.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
