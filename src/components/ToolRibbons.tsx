import type { SkillGroup } from '../data'

// Tool names drifting past in bands that alternate direction, with the
// grouped list underneath for reading. The bands are decoration for sighted
// visitors (hidden from screen readers); the list carries the content.

export default function ToolRibbons({ groups }: { groups: SkillGroup[] }) {
  // three bands: agents and retrieval, models to backend, automation and infra
  const bands = [
    groups.slice(0, 2).flatMap((g) => g.items),
    groups.slice(2, 6).flatMap((g) => g.items),
    groups.slice(6).flatMap((g) => g.items),
  ]

  return (
    <div className="tools">
      <div className="ribbons" aria-hidden="true">
        {bands.map((items, i) => (
          <div key={i} className={`ribbon ribbon-${i + 1}`}>
            {/* the track holds two copies, so sliding it by half loops seamlessly */}
            <div className="ribbon-track">
              {[...items, ...items].map((t, k) => (
                <span key={k} className="ribbon-item">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <dl className="tool-groups">
        {groups.map((g) => (
          <div key={g.group}>
            <dt>{g.group}</dt>
            <dd>{g.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
