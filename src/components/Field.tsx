import { useEffect, useRef } from 'react'

// A small neural network drawn like a fluorescence micrograph. Each neuron has
// a glowing cell body, a nucleus and branching dendrites; curved axons end in
// synapse bulbs on their neighbours. Action potentials travel along axons, and
// a neuron that receives one fires in turn unless it is still refractory, so
// activity cascades. Neurons fire on their own now and then, the cursor
// excites nearby ones, and a click fires the closest.

type Neuron = {
  x: number
  y: number
  r: number
  dendrites: Path2D
  phase: number
  flash: number // 0..1, glow after firing
  rest: number // time until it can fire again
  out: number[] // indices into edges
}

type Edge = { to: number; path: Path2D; pts: { x: number; y: number }[]; len: number }
type Spike = { edge: number; t: number }

const GREEN = '110, 231, 168'
const PINK = '255, 107, 139'
const SPEED = 0.22 // px per ms
const REFRACTORY = 750
const SAMPLES = 24

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function grow(r: number) {
  // dendrites: a few wandering branches, each with one small fork
  const p = new Path2D()
  const branches = 5 + Math.floor(Math.random() * 3)
  for (let i = 0; i < branches; i++) {
    let a = (i / branches) * Math.PI * 2 + rand(-0.4, 0.4)
    let x = Math.cos(a) * r
    let y = Math.sin(a) * r
    p.moveTo(x, y)
    const steps = 2 + Math.floor(Math.random() * 2)
    for (let s = 0; s < steps; s++) {
      a += rand(-0.55, 0.55)
      const len = rand(7, 15) * (1 - s * 0.2)
      x += Math.cos(a) * len
      y += Math.sin(a) * len
      p.lineTo(x, y)
      if (s === 0) {
        const fa = a + (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 0.9)
        p.moveTo(x, y)
        p.lineTo(x + Math.cos(fa) * rand(5, 9), y + Math.sin(fa) * rand(5, 9))
        p.moveTo(x, y)
      }
    }
  }
  return p
}

export default function Field() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let neurons: Neuron[] = []
    let edges: Edge[] = []
    let spikes: Spike[] = []
    const pointer = { x: -9999, y: -9999, on: false }
    let raf = 0
    let last = 0
    let nextSpontaneous = 0
    let visible = true

    const seed = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      spikes = []

      // jittered grid keeps neurons evenly spread without looking gridded
      const count = Math.max(14, Math.min(60, Math.round((w * h) / 26000)))
      const cols = Math.max(3, Math.round(Math.sqrt((count * w) / h)))
      const rows = Math.ceil(count / cols)
      const cw = w / cols
      const ch = h / rows
      neurons = []
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const rad = rand(3.5, 6)
          neurons.push({
            x: (c + 0.5 + rand(-0.32, 0.32)) * cw,
            y: (r + 0.5 + rand(-0.32, 0.32)) * ch,
            r: rad,
            dendrites: grow(rad),
            phase: Math.random() * Math.PI * 2,
            flash: 0,
            rest: 0,
            out: [],
          })
        }

      // each neuron sends an axon to its two nearest neighbours, sometimes a third
      const reach = Math.max(cw, ch) * 1.9
      edges = []
      neurons.forEach((n, i) => {
        const near = neurons
          .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
          .filter((o) => o.j !== i && o.d < reach)
          .sort((a, b) => a.d - b.d)
          .slice(0, Math.random() < 0.35 ? 3 : 2)
        for (const { j, d } of near) {
          const m = neurons[j]
          const ux = (m.x - n.x) / d
          const uy = (m.y - n.y) / d
          const sx = n.x + ux * n.r
          const sy = n.y + uy * n.r
          const ex = m.x - ux * (m.r + 7)
          const ey = m.y - uy * (m.r + 7)
          const bend = d * rand(0.12, 0.24) * (Math.random() < 0.5 ? -1 : 1)
          const cx = (sx + ex) / 2 - uy * bend
          const cy = (sy + ey) / 2 + ux * bend
          const path = new Path2D()
          path.moveTo(sx, sy)
          path.quadraticCurveTo(cx, cy, ex, ey)
          const pts = Array.from({ length: SAMPLES + 1 }, (_, k) => {
            const t = k / SAMPLES
            const a = (1 - t) * (1 - t)
            const b = 2 * (1 - t) * t
            const c2 = t * t
            return { x: a * sx + b * cx + c2 * ex, y: a * sy + b * cy + c2 * ey }
          })
          n.out.push(edges.length)
          edges.push({ to: j, path, pts, len: d * 1.05 })
        }
      })
    }

    const fire = (i: number, now: number) => {
      const n = neurons[i]
      if (now < n.rest) return
      n.flash = 1
      n.rest = now + REFRACTORY
      for (const e of n.out) if (Math.random() < 0.72 && spikes.length < 90) spikes.push({ edge: e, t: 0 })
    }

    const at = (pts: { x: number; y: number }[], t: number) => {
      const f = Math.min(SAMPLES, Math.max(0, t * SAMPLES))
      const k = Math.floor(f)
      const a = pts[k]
      const b = pts[Math.min(SAMPLES, k + 1)]
      return { x: a.x + (b.x - a.x) * (f - k), y: a.y + (b.y - a.y) * (f - k) }
    }

    const step = (now: number, dt: number) => {
      for (const s of spikes) s.t += (dt * SPEED) / edges[s.edge].len
      const arrived = spikes.filter((s) => s.t >= 1)
      spikes = spikes.filter((s) => s.t < 1)
      for (const s of arrived) fire(edges[s.edge].to, now)

      if (now > nextSpontaneous) {
        fire(Math.floor(Math.random() * neurons.length), now)
        nextSpontaneous = now + rand(900, 1700)
      }

      neurons.forEach((n, i) => {
        if (pointer.on && Math.hypot(pointer.x - n.x, pointer.y - n.y) < 130 && Math.random() < 0.0009 * dt)
          fire(i, now)
        n.flash *= Math.exp(-dt / 380)
      })
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // axons and their synapse bulbs
      ctx.lineWidth = 1
      for (const e of edges) {
        ctx.strokeStyle = `rgba(${GREEN}, 0.11)`
        ctx.stroke(e.path)
        const end = e.pts[SAMPLES]
        ctx.fillStyle = `rgba(${GREEN}, 0.32)`
        ctx.beginPath()
        ctx.arc(end.x, end.y, 1.9, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const n of neurons) {
        const near = pointer.on ? Math.max(0, 1 - Math.hypot(pointer.x - n.x, pointer.y - n.y) / 160) : 0
        const breathe = 0.5 + 0.5 * Math.sin(now / 1700 + n.phase)
        const e = Math.max(n.flash, near * 0.6)

        // light adds up where glows overlap, like fluorescence
        ctx.globalCompositeOperation = 'lighter'
        const halo = n.r * (4 + 3 * e)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, halo)
        const tint = n.flash > 0.08 ? PINK : GREEN
        g.addColorStop(0, `rgba(${tint}, ${0.16 + 0.05 * breathe + 0.4 * e})`)
        g.addColorStop(1, `rgba(${tint}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, halo, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'

        ctx.save()
        ctx.translate(n.x, n.y)
        ctx.lineWidth = 1.1
        ctx.strokeStyle = `rgba(${GREEN}, ${0.22 + 0.4 * e})`
        ctx.stroke(n.dendrites)
        ctx.restore()

        ctx.fillStyle = n.flash > 0.08 ? `rgba(${PINK}, ${0.6 + 0.4 * n.flash})` : `rgba(${GREEN}, ${0.6 + 0.4 * e})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(13, 15, 24, 0.55)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // action potentials: a bright head with a short fading trail
      ctx.globalCompositeOperation = 'lighter'
      for (const s of spikes) {
        const pts = edges[s.edge].pts
        for (let k = 4; k >= 0; k--) {
          const p = at(pts, s.t - k * 0.035)
          ctx.fillStyle = `rgba(${PINK}, ${0.5 * (1 - k / 5)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2.4 - k * 0.3, 0, Math.PI * 2)
          ctx.fill()
        }
        const head = at(pts, s.t)
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10)
        g.addColorStop(0, `rgba(${PINK}, 0.55)`)
        g.addColorStop(1, `rgba(${PINK}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(head.x, head.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (now: number) => {
      const dt = Math.min(50, last ? now - last : 16)
      last = now
      step(now, dt)
      draw(now)
      raf = visible ? requestAnimationFrame(loop) : 0
    }

    const start = () => {
      if (!raf && !reduce) {
        last = 0
        raf = requestAnimationFrame(loop)
      }
    }

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMove = (e: PointerEvent) => {
      Object.assign(pointer, local(e), { on: true })
    }
    const onLeave = () => (pointer.on = false)
    const onClick = (e: PointerEvent) => {
      if (reduce) return
      const p = local(e)
      let best = 0
      let bestD = Infinity
      neurons.forEach((n, i) => {
        const d = Math.hypot(n.x - p.x, n.y - p.y)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      neurons[best].rest = 0
      fire(best, performance.now())
    }

    seed()
    draw(performance.now())

    const host = canvas.parentElement!
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onClick)

    const ro = new ResizeObserver(() => {
      seed()
      draw(performance.now())
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)

    // a first cascade on load so the idea is visible before anyone interacts
    const intro = window.setTimeout(() => {
      if (reduce || !neurons.length) return
      const now = performance.now()
      fire(Math.floor(neurons.length * 0.6), now)
      fire(Math.floor(neurons.length * 0.25), now)
    }, 700)

    start()

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(intro)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onClick)
    }
  }, [])

  return <canvas ref={ref} className="field" aria-hidden="true" />
}
