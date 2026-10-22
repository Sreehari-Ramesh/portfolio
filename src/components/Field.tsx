import { useEffect, useRef } from 'react'

// A field of agents: particles drift, link to near neighbours, lean toward the
// cursor, and pass a message along their links when you click.

type Agent = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  flash: number // 0..1, warm glow while a message passes through
}

type Hop = { i: number; at: number; depth: number }

const LINK = 120
const CURSOR = 190
const HOP_MS = 110
const MAX_DEPTH = 7

const FERN = '62, 107, 83'
const PLAID = '194, 54, 46'

export default function Field() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let agents: Agent[] = []
    let hops: Hop[] = []
    let visited = new Set<number>()
    const pointer = { x: -9999, y: -9999, on: false }
    let raf = 0
    let visible = true

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // in-flight messages point at old indices, so drop them on reseed
      hops = []
      visited = new Set()
      const count = Math.min(150, Math.max(40, Math.round((w * h) / 9500)))
      agents = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.6,
        flash: 0,
      }))
    }

    const neighbours = (i: number) => {
      const a = agents[i]
      const out: number[] = []
      for (let j = 0; j < agents.length; j++) {
        if (j === i) continue
        const b = agents[j]
        if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < LINK * LINK) out.push(j)
      }
      return out
    }

    const send = (x: number, y: number) => {
      let best = 0
      let bestD = Infinity
      agents.forEach((a, i) => {
        const d = (a.x - x) ** 2 + (a.y - y) ** 2
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      visited = new Set([best])
      hops = [{ i: best, at: performance.now(), depth: 0 }]
    }

    const step = (now: number) => {
      // deliver messages that are due, then forward them one hop
      const due = hops.filter((hp) => hp.at <= now)
      hops = hops.filter((hp) => hp.at > now)
      for (const hp of due) {
        agents[hp.i].flash = 1
        if (hp.depth >= MAX_DEPTH) continue
        for (const j of neighbours(hp.i)) {
          if (visited.has(j)) continue
          visited.add(j)
          hops.push({ i: j, at: now + HOP_MS + Math.random() * 60, depth: hp.depth + 1 })
        }
      }

      for (const a of agents) {
        if (pointer.on) {
          const dx = pointer.x - a.x
          const dy = pointer.y - a.y
          const d2 = dx * dx + dy * dy
          if (d2 < CURSOR * CURSOR && d2 > 400) {
            const f = 0.012 / Math.sqrt(d2)
            a.vx += dx * f
            a.vy += dy * f
          }
        }
        a.vx += (Math.random() - 0.5) * 0.02
        a.vy += (Math.random() - 0.5) * 0.02
        a.vx *= 0.985
        a.vy *= 0.985
        a.x += a.vx
        a.y += a.vy
        if (a.x < -20) a.x = w + 20
        if (a.x > w + 20) a.x = -20
        if (a.y < -20) a.y = h + 20
        if (a.y > h + 20) a.y = -20
        a.flash *= 0.965
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i]
        for (let j = i + 1; j < agents.length; j++) {
          const b = agents[j]
          const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
          if (d2 > LINK * LINK) continue
          const t = 1 - Math.sqrt(d2) / LINK
          const heat = Math.min(a.flash, b.flash)
          ctx.strokeStyle =
            heat > 0.05
              ? `rgba(${PLAID}, ${t * heat * 0.9})`
              : `rgba(${FERN}, ${t * 0.22})`
          ctx.lineWidth = heat > 0.05 ? 1.4 : 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
      for (const a of agents) {
        const near =
          pointer.on && (pointer.x - a.x) ** 2 + (pointer.y - a.y) ** 2 < CURSOR * CURSOR
        if (a.flash > 0.05) {
          ctx.fillStyle = `rgba(${PLAID}, ${0.25 * a.flash})`
          ctx.beginPath()
          ctx.arc(a.x, a.y, a.r + 7 * a.flash, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle =
          a.flash > 0.05 ? `rgba(${PLAID}, ${0.5 + a.flash / 2})` : `rgba(${FERN}, ${near ? 0.95 : 0.55})`
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r + (near ? 0.6 : 0), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (now: number) => {
      step(now)
      draw()
      raf = visible ? requestAnimationFrame(loop) : 0
    }

    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.on = true
    }
    const onLeave = () => (pointer.on = false)
    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      send(e.clientX - rect.left, e.clientY - rect.top)
      if (reduce) {
        // no animation: light up the whole reachable network at once
        const now = performance.now()
        for (let k = 0; k < 40 && hops.length; k++) step(now + k * HOP_MS * 2)
        draw()
      }
    }

    seed()
    draw()

    const host = canvas.parentElement!
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onClick)

    const ro = new ResizeObserver(() => {
      seed()
      draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)

    // one message on load so the idea is visible before anyone clicks
    const intro = window.setTimeout(() => !reduce && send(w * 0.72, h * 0.38), 900)

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
