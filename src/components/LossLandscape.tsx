import { useEffect, useRef } from 'react'

// The page backdrop: a loss landscape, the surface a model is trained on,
// drawn as a field of fine dots receding to a horizon. The surface slowly
// reshapes itself and brighter contour bands trace its hills and valleys.
// Red points are gradient-descent runs: each rolls downhill with momentum,
// leaves a trail, settles into a minimum with a pulse and restarts
// elsewhere. The pointer adds a new minimum that the runs bend toward, and a
// click in the hero drops a new run there. It dims past the hero so the
// sections stay readable.

type Run = {
  x: number
  z: number
  vx: number
  vz: number
  trail: { x: number; z: number }[]
  settled: number // time it converged, 0 while still descending
  steps: number
}

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const X_RANGE = 1.9 // landscape spans x in [-X_RANGE, X_RANGE], z in [0, 1]
const NEAR = 1 // distance of the nearest row from the camera
const SPAN = 5.5 // how far the field recedes
const MAX_RUNS = 5

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export default function LossLandscape() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let cols = 0
    let rows = 0
    let focal = 1
    let horizon = 0
    let spread = 1
    let runs: Run[] = []
    let raf = 0
    let last = 0
    const pointer = { x: 0, z: 0, on: false, pull: 0 }

    // a few wells and hills that drift slowly, plus a gentle ripple
    const bumps = Array.from({ length: 6 }, (_, i) => ({
      x: rand(-1.4, 1.4),
      z: rand(0.1, 0.9),
      a: i < 4 ? -rand(0.35, 0.6) : rand(0.25, 0.4),
      s: rand(0.22, 0.4),
      fx: rand(0.00004, 0.0001),
      fz: rand(0.00003, 0.00008),
      p: rand(0, Math.PI * 2),
    }))

    const height = (x: number, z: number, t: number) => {
      let y = 0.05 * Math.sin(2.6 * x + t * 0.0003) * Math.cos(3.4 * z - t * 0.0002)
      for (const b of bumps) {
        const bx = b.x + 0.35 * Math.sin(t * b.fx + b.p)
        const bz = b.z + 0.15 * Math.cos(t * b.fz + b.p)
        y += b.a * Math.exp(-((x - bx) ** 2 + ((z - bz) * 1.6) ** 2) / (b.s * b.s))
      }
      if (pointer.pull > 0.01)
        y -= 0.55 * pointer.pull * Math.exp(-((x - pointer.x) ** 2 + ((z - pointer.z) * 1.6) ** 2) / 0.06)
      return y
    }

    const project = (x: number, z: number, y: number) => {
      const d = NEAR + z * SPAN
      return {
        sx: w / 2 + (x * spread * focal) / d,
        sy: horizon + ((0.9 - y * 0.95) * focal) / d,
        d,
      }
    }

    // screen point to landscape coordinates, assuming flat ground
    const unproject = (sx: number, sy: number) => {
      if (sy <= horizon + 8) return null
      const d = (0.9 * focal) / (sy - horizon)
      const z = (d - NEAR) / SPAN
      const x = ((sx - w / 2) * d) / (spread * focal)
      if (z < 0 || z > 1 || Math.abs(x) > X_RANGE) return null
      return { x, z }
    }

    const spawn = (x = rand(-1.3, 1.3), z = rand(0.05, 0.75)): Run => ({
      x,
      z,
      vx: 0,
      vz: 0,
      trail: [],
      settled: 0,
      steps: 0,
    })

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const narrow = w < 700
      cols = narrow ? 70 : 120
      rows = narrow ? 42 : 56
      focal = h * (narrow ? 0.62 : 0.78)
      horizon = h * (narrow ? 0.26 : 0.28)
      spread = (w * 0.62) / focal
    }

    // momentum gradient descent on the current surface
    const descend = (r: Run, t: number, dt: number) => {
      const e = 0.004
      const gx = (height(r.x + e, r.z, t) - height(r.x - e, r.z, t)) / (2 * e)
      const gz = (height(r.x, r.z + e, t) - height(r.x, r.z - e, t)) / (2 * e)
      const k = dt / 16
      r.vx = r.vx * 0.92 - 0.0016 * gx * k
      r.vz = r.vz * 0.92 - 0.0011 * gz * k
      r.x = Math.max(-X_RANGE, Math.min(X_RANGE, r.x + r.vx * k))
      r.z = Math.max(0, Math.min(1, r.z + r.vz * k))
      r.steps += 1
      if (r.steps % 2 === 0) {
        r.trail.push({ x: r.x, z: r.z })
        if (r.trail.length > 140) r.trail.shift()
      }
      if (!r.settled && r.steps > 90 && Math.hypot(r.vx, r.vz) < 0.00035) r.settled = t
    }

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // the surface: dots fade with distance, contour bands catch the light.
      // one fill colour with varying alpha keeps thousands of dots cheap
      ctx.fillStyle = `rgb(${WHITE})`
      for (let j = rows - 1; j >= 0; j--) {
        const z = j / (rows - 1)
        const fog = Math.pow(1 - z, 1.35)
        for (let i = 0; i < cols; i++) {
          const x = -X_RANGE + (i / (cols - 1)) * X_RANGE * 2
          const y = height(x, z, t)
          const p = project(x, z, y)
          if (p.sx < -4 || p.sx > w + 4 || p.sy > h + 4) continue
          const band = Math.abs(((y * 9) % 1 + 1) % 1 - 0.5) < 0.08
          ctx.globalAlpha = fog * (band ? 0.95 : 0.34) + 0.05
          const size = Math.max(1, (band ? 3 : 2.4) / p.d)
          ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size)
        }
      }
      ctx.globalAlpha = 1

      // descent trails and the runs themselves
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const r of runs) {
        if (r.trail.length > 1) {
          for (let k = 1; k < r.trail.length; k++) {
            const a = r.trail[k - 1]
            const b = r.trail[k]
            const pa = project(a.x, a.z, height(a.x, a.z, t))
            const pb = project(b.x, b.z, height(b.x, b.z, t))
            ctx.strokeStyle = `rgba(${RED}, ${0.65 * (k / r.trail.length)})`
            ctx.lineWidth = Math.max(0.8, 2.4 / pb.d)
            ctx.beginPath()
            ctx.moveTo(pa.sx, pa.sy)
            ctx.lineTo(pb.sx, pb.sy)
            ctx.stroke()
          }
        }
        const p = project(r.x, r.z, height(r.x, r.z, t))
        const rad = Math.max(2.2, 6 / p.d)
        ctx.fillStyle = `rgba(${RED}, 0.18)`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, rad * 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${RED}, 1)`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2)
        ctx.fill()
        // a ring spreads out once the run reaches a minimum
        if (r.settled) {
          const age = (t - r.settled) / 1200
          if (age < 1) {
            ctx.strokeStyle = `rgba(${RED}, ${0.7 * (1 - age)})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.ellipse(p.sx, p.sy, rad + 26 * age / Math.sqrt(p.d), (rad + 26 * age / Math.sqrt(p.d)) * 0.45, 0, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }
    }

    const frame = (t: number) => {
      const dt = Math.min(50, last ? t - last : 16)
      last = t
      pointer.pull += ((pointer.on ? 1 : 0) - pointer.pull) * 0.05
      for (const r of runs) descend(r, t, dt)
      // settled runs rest briefly, then start again somewhere new
      runs = runs.map((r) => (r.settled && t - r.settled > 1800 ? spawn() : r))
      draw(t)
      raf = requestAnimationFrame(frame)
    }

    const onScroll = () => {
      const past = Math.min(1, window.scrollY / (window.innerHeight * 0.9))
      canvas.style.opacity = String(1 - 0.62 * past)
    }
    const onMove = (e: PointerEvent) => {
      // only the hero shapes the surface; further down the page it just plays
      const inHero = window.scrollY < window.innerHeight * 0.6
      const g = inHero ? unproject(e.clientX, e.clientY) : null
      pointer.on = !!g
      if (g) {
        pointer.x = g.x
        pointer.z = g.z
      }
    }
    const onLeave = () => (pointer.on = false)
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      if (reduce || !el.closest('.hero') || el.closest('a, button')) return
      const g = unproject(e.clientX, e.clientY)
      if (!g) return
      runs.push(spawn(g.x, g.z))
      if (runs.length > MAX_RUNS + 2) runs.shift()
    }

    layout()
    runs = Array.from({ length: w < 700 ? 3 : MAX_RUNS }, () => spawn())
    if (reduce) {
      // a still frame with each run already partway down its valley
      const t = 0
      for (const r of runs) for (let k = 0; k < 160; k++) descend(r, t, 16)
      draw(t)
    } else raf = requestAnimationFrame(frame)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    const onResize = () => {
      // phones resize when the address bar hides; only rebuild on real changes
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      layout()
      if (reduce) draw(0)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="scape" aria-hidden="true" />
}
