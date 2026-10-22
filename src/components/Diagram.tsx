import type { Diagram as DiagramData } from '../data'

// A static map of how a project's parts connect, drawn like the hero field:
// green nodes and links, with the result people get back in plaid red.

export default function Diagram({ data, name }: { data: DiagramData; name: string }) {
  const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]))
  const pattern = `grid-${name.replace(/\W+/g, '')}`
  const description = data.edges.map(([a, b]) => `${byId[a].label} to ${byId[b].label}`).join(', ')

  return (
    <svg className="diagram" viewBox="0 0 600 400" role="img" aria-label={`How ${name} fits together: ${description}`}>
      <defs>
        <pattern id={pattern} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.1" className="grid-dot" />
        </pattern>
      </defs>
      <rect width="600" height="400" fill={`url(#${pattern})`} />

      {data.edges.map(([a, b]) => {
        const from = byId[a]
        const to = byId[b]
        return (
          <line
            key={a + b}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className={to.out ? 'edge to-out' : 'edge'}
          />
        )
      })}

      {data.nodes.map((n) => (
        <g key={n.id} className={n.out ? 'd-node out' : 'd-node'}>
          {n.out && <circle cx={n.x} cy={n.y} r="24" className="halo" />}
          <circle cx={n.x} cy={n.y} r="11" />
          <text x={n.x} y={n.y + 38} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
