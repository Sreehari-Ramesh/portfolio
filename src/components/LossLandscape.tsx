import { useEffect, useRef } from 'react'

// The hero backdrop: a loss landscape, the surface a model is trained on,
// drawn as fine dots receding to the horizon and filling the first screen.
// Contour bands trace its hills and valleys, and red gradient-descent runs
// sit on its slopes with their trails.
//
// It is still until you move. Pointer movement (or scrolling, on touch
// screens) supplies the energy that lets the surface reshape and the runs
// roll downhill, and that energy drains away as soon as you stop. The
// pointer is also a new minimum the runs bend toward; a click drops a new
// run. As the page scrolls the field drifts up and fades out, so the
// sections below sit on plain black.

type Run = {
  x: number
  z: number
  vx: number
  vz: number
  trail: { x: number; z: number }[]
  settled: number // sim time it converged, 0 while still descending
  steps: number
}

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const NEAR = 0.8 // nearest row distance from the camera
const SPAN = 7 // depth of the field
const CAM = 0.9 // camera height above the flat surface
const RUN_X = 2.6 // runs stay within this x range so they remain on screen
const MAX_RUNS = 5

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

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
    let raf = 0
    let last = 0
    let sim = 0 // simulation clock: only advances while you move
    let energy = 0 // 0..1, topped up by movement, drains when you stop
    let shown = 1 // visibility after scrolling
    let dirty = true
    let runs: Run[] = []
    const pointer = { x: 0, z: 0.5, on: false, pull: 0, sx: -1, sy: -1 }
    let lastScroll = window.scrollY

    // wells and hills spread across the field, drifting slowly with sim time
    const bumps = Array.from({ length: 10 }, (_, i) => ({
      x: rand(-3.2, 3.2),
      z: rand(0.05, 0.95),
      a: i < 6 ? -rand(0.35, 0.6) : rand(0.25, 0.42),
      s: rand(0.3, 0.55),
      fx: rand(0.00004, 0.0001),
      fz: rand(0.00003, 0.00008),
      p: rand(0, Math.PI * 2),
    }))

    const height = (x: number, z: number, t: number) => {
      let y = 0.05 * Math.sin(2.2 * x + t * 0.0003) * Math.cos(3.4 * z - t * 0.0002)
      for (const b of bumps) {
        const bx = b.x + 0.4 * Math.sin(t * b.fx + b.p)
        const bz = b.z + 0.12 * Math.cos(t * b.fz + b.p)
        y += b.a * Math.exp(-((x - bx) ** 2 + ((z - bz) * 2.2) ** 2) / (b.s * b.s))
      }
      if (pointer.pull > 0.01)
        y -= 0.55 * pointer.pull * Math.exp(-((x - pointer.x) ** 2 + ((z - pointer.z) * 2.2) ** 2) / 0.09)
      return y
    }

    // world to screen: x spreads so every row covers the full width
    const depth = (z: number) => NEAR + z * SPAN
    const toSx = (x: number, d: number) => w / 2 + (x * w * 0.62) / d
    const toSy = (y: number, d: number) => horizon + ((CAM - y * 0.95) * focal) / d
    const rowHalf = (d: number) => ((w / 2 + 14) * d) / (w * 0.62)

    const unproject = (sx: number, sy: number) => {
      if (sy <= horizon + 6) return null
      const d = (CAM * focal) / (sy - horizon)
      const z = (d - NEAR) / SPAN
      if (z < 0 || z > 1) return null
      return { x: ((sx - w / 2) * d) / (w * 0.62), z }
    }

    const spawn = (x = rand(-RUN_X, RUN_X), z = rand(0.04, 0.6)): Run => ({
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
      cols = narrow ? 64 : 118
      rows = narrow ? 56 : 70
      focal = h * 0.95
      // horizon just above the top edge so the surface fills the screen
      horizon = -h * 0.02
      dirty = true
    }

    // momentum gradient descent; k scales the step by the current energy
    const descend = (r: Run, t: number, k: number) => {
      const e = 0.004
      const gx = (height(r.x + e, r.z, t) - height(r.x - e, r.z, t)) / (2 * e)
      const gz = (height(r.x, r.z + e, t) - height(r.x, r.z - e, t)) / (2 * e)
      r.vx = r.vx * Math.pow(0.92, k) - 0.0016 * gx * k
      r.vz = r.vz * Math.pow(0.92, k) - 0.0009 * gz * k
      r.x = Math.max(-RUN_X, Math.min(RUN_X, r.x + r.vx * k))
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

      // the surface, far rows first: dots fade with distance, contour bands
      // catch the light, and the nearest rows are held back behind the copy
      ctx.fillStyle = `rgb(${WHITE})`
      for (let j = rows - 1; j >= 0; j--) {
        const z = (j / (rows - 1)) ** 1.1
        const d = depth(z)
        const fog = Math.pow(1 - z, 1.1)
        const near = 0.55 + 0.45 * smooth(0, 0.3, z)
        const half = rowHalf(d)
        for (let i = 0; i < cols; i++) {
          const x = -half + (i / (cols - 1)) * half * 2
          const y = height(x, z, t)
          const sy = toSy(y, d)
          if (sy > h + 6 || sy < -6) continue
          const band = Math.abs(((y * 9) % 1 + 1) % 1 - 0.5) < 0.08
          ctx.globalAlpha = (fog * (band ? 0.92 : 0.3) + 0.05) * near
          const size = Math.min(3, Math.max(1, (band ? 3 : 2.4) / d))
          ctx.fillRect(toSx(x, d) - size / 2, sy - size / 2, size, size)
        }
      }
      ctx.globalAlpha = 1

      // descent trails and the runs themselves
      ctx.lineCap = 'round'
      for (const r of runs) {
        for (let k = 1; k < r.trail.length; k++) {
          const a = r.trail[k - 1]
          const b = r.trail[k]
          const da = depth(a.z)
          const db = depth(b.z)
          ctx.strokeStyle = `rgba(${RED}, ${0.65 * (k / r.trail.length)})`
          ctx.lineWidth = Math.max(0.8, 2.4 / db)
          ctx.beginPath()
          ctx.moveTo(toSx(a.x, da), toSy(height(a.x, a.z, t), da))
          ctx.lineTo(toSx(b.x, db), toSy(height(b.x, b.z, t), db))
          ctx.stroke()
        }
        const d = depth(r.z)
        const sx = toSx(r.x, d)
        const sy = toSy(height(r.x, r.z, t), d)
        const rad = Math.max(2.2, 5 / d)
        ctx.fillStyle = `rgba(${RED}, 0.18)`
        ctx.beginPath()
        ctx.arc(sx, sy, rad * 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgb(${RED})`
        ctx.beginPath()
        ctx.arc(sx, sy, rad, 0, Math.PI * 2)
        ctx.fill()
      }
      dirty = false
    }

    const frame = (now: number) => {
      const dt = Math.min(50, last ? now - last : 16)
      last = now
      if (energy > 0.003) {
        // movement drives the clock; nothing advances while you are still
        const k = (dt / 16) * energy
        sim += dt * energy
        pointer.pull += ((pointer.on ? 1 : 0) - pointer.pull) * 0.06 * energy
        for (const r of runs) descend(r, sim, k)
        runs = runs.map((r) => (r.settled && sim - r.settled > 1500 ? spawn() : r))
        energy *= Math.pow(0.9, dt / 16)
        dirty = true
      }
      if (dirty && shown > 0.01) draw(sim)
      raf = requestAnimationFrame(frame)
    }

    const kick = (amount: number) => {
      energy = Math.min(1, energy + amount)
    }

    const onScroll = () => {
      const past = window.scrollY / window.innerHeight
      shown = 1 - smooth(0, 1, past)
      canvas.style.opacity = String(shown)
      canvas.style.transform = `translateY(${-Math.min(window.scrollY, window.innerHeight) * 0.25}px)`
      // on touch screens, scrolling the hero is the movement that drives it
      if (shown > 0.05 && !window.matchMedia('(hover: hover)').matches)
        kick(Math.min(0.5, Math.abs(window.scrollY - lastScroll) / 120))
      lastScroll = window.scrollY
      if (shown > 0.01) dirty = true
    }
    const onMove = (e: PointerEvent) => {
      const moved = pointer.sx < 0 ? 0 : Math.hypot(e.clientX - pointer.sx, e.clientY - pointer.sy)
      pointer.sx = e.clientX
      pointer.sy = e.clientY
      if (shown < 0.3) return
      const g = unproject(e.clientX, e.clientY)
      pointer.on = !!g
      if (g) {
        pointer.x = g.x
        pointer.z = g.z
      }
      kick(Math.min(0.35, moved / 60))
    }
    const onLeave = () => (pointer.on = false)
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return
      const el = e.target
      if (reduce || !el.closest('.hero') || el.closest('a, button')) return
      const g = unproject(e.clientX, e.clientY)
      if (!g) return
      runs.push(spawn(Math.max(-RUN_X, Math.min(RUN_X, g.x)), g.z))
      if (runs.length > MAX_RUNS + 2) runs.shift()
      kick(0.6)
    }

    layout()
    runs = Array.from({ length: w < 700 ? 3 : MAX_RUNS }, () => spawn())
    // start partway through each descent so the still frame shows trails
    for (const r of runs) for (let k = 0; k < 70; k++) descend(r, 0, 1)
    draw(0)
    onScroll()

    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerdown', onDown)
      document.documentElement.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(frame)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => {
      // phones resize when the address bar hides; only rebuild on real changes
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      layout()
      draw(sim)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="scape" aria-hidden="true" />
}
