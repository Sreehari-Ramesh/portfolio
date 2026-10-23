import { useEffect, useRef } from 'react'

// The hero backdrop: a ripple tank seen in perspective, filling the first
// screen. Two steady sources send out circular waves that interfere; crests
// catch the light and troughs fall dark, so the field reads as moving
// wavefronts. The pointer is a third source, and a click drops a stone: a
// single red wavefront rings outward and fades (Huygens, more or less).
// As the page scrolls, the field drifts up and fades away so the sections
// below sit on plain black, and it stops drawing once it is invisible.

type Source = { x: number; z: number; amp: number; phase: number }
type Drop = { x: number; z: number; born: number }

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const K = 2.3 // wave number: about 2.7 world units per wavelength
const OMEGA = 0.0017 // angular speed per ms
const FRONT = 0.0024 // how fast a dropped wavefront spreads, units per ms
const DROP_LIFE = 5200
const NEAR = 0.8 // nearest row distance from the camera
const SPAN = 9 // depth of the field in world units
const CAM = 0.9 // camera height above the still surface

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default function WaveField() {
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
    let shown = 1 // 0..1, how much of the field is visible after scrolling
    const sources: Source[] = [
      { x: -2.6, z: 5.5, amp: 0.17, phase: 0 },
      { x: 3.1, z: 2.4, amp: 0.15, phase: 1.7 },
    ]
    const cursor: Source = { x: 0, z: 3, amp: 0, phase: 0 }
    const emitters = [...sources, cursor]
    let cursorOn = false
    let drops: Drop[] = []

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const narrow = w < 700
      cols = narrow ? 64 : 120
      rows = narrow ? 64 : 78
      focal = h * 0.95
      // horizon just above the top edge so the surface fills the screen
      horizon = -h * 0.02
    }

    // screen x for a world x at depth d, and the reverse
    const toScreenX = (x: number, d: number) => w / 2 + (x * focal) / d / 1.6
    const toWorldX = (sx: number, d: number) => ((sx - w / 2) * d * 1.6) / focal

    const height = (x: number, z: number, t: number) => {
      let y = 0
      for (const s of emitters) {
        if (s.amp < 0.002) continue
        const r = Math.hypot(x - s.x, z - s.z)
        y += s.amp * Math.sin(K * r - OMEGA * t + s.phase) * Math.exp(-r * 0.07)
      }
      // dropped stones: one ring that spreads and fades
      for (const d of drops) {
        const age = t - d.born
        const front = FRONT * age
        const r = Math.hypot(x - d.x, z - d.z)
        if (r > front) continue
        const fade = 1 - age / DROP_LIFE
        y += 0.34 * fade * Math.sin(K * 1.4 * (front - r)) * smooth(0, 1.2, front - r) * Math.exp(-(front - r) * 0.9)
      }
      return y
    }

    // screen point to the still surface, for the pointer and clicks
    const unproject = (sx: number, sy: number) => {
      if (sy <= horizon + 6) return null
      const d = (CAM * focal) / (sy - horizon)
      const z = d - NEAR
      if (z < 0 || z > SPAN) return null
      return { x: toWorldX(sx, d), z }
    }

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const reds: { x: number; y: number; s: number; a: number }[] = []

      // far rows first; each row is spread to cover the full screen width
      ctx.fillStyle = `rgb(${WHITE})`
      for (let j = rows - 1; j >= 0; j--) {
        const z = (j / (rows - 1)) ** 1.15 * SPAN
        const d = NEAR + z
        const fog = Math.pow(1 - z / SPAN, 1.1)
        const half = toWorldX(w + 12, d)
        for (let i = 0; i < cols; i++) {
          const x = -half + (i / (cols - 1)) * half * 2
          const y = height(x, z, t)
          const sy = horizon + ((CAM - y) * focal) / d
          if (sy > h + 6 || sy < -6) continue
          const sx = toScreenX(x, d)
          // crests are bright, troughs dim: the wavefronts draw themselves
          const crest = smooth(-0.05, 0.2, y)
          const size = Math.min(3, Math.max(1, 2.6 / d + (crest * 1.2) / d))
          // the nearest rows run behind the copy, so they are held back a little
          const near = 0.5 + 0.5 * smooth(0, 2.4, z)
          ctx.globalAlpha = (fog * (0.12 + 0.62 * crest) + 0.03) * near
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size)
          // the leading edge of a dropped wavefront shows in red
          for (const dr of drops) {
            const front = FRONT * (t - dr.born)
            if (Math.abs(Math.hypot(x - dr.x, z - dr.z) - front) < 0.22)
              reds.push({ x: sx, y: sy, s: size + 0.6, a: fog * (1 - (t - dr.born) / DROP_LIFE) })
          }
        }
      }

      ctx.fillStyle = `rgb(${RED})`
      for (const p of reds) {
        ctx.globalAlpha = Math.max(0, p.a)
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s)
      }

      // the sources themselves glow red on the surface
      for (const s of sources) {
        const d = NEAR + s.z
        const sx = toScreenX(s.x, d)
        const sy = horizon + ((CAM - height(s.x, s.z, t)) * focal) / d
        const pulse = 0.5 + 0.5 * Math.sin(-OMEGA * t + s.phase)
        ctx.globalAlpha = 0.16 + 0.12 * pulse
        ctx.beginPath()
        ctx.arc(sx, sy, 16 / Math.sqrt(d), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.95
        ctx.beginPath()
        ctx.arc(sx, sy, 4.5 / Math.sqrt(d), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (t: number) => {
      cursor.amp += ((cursorOn ? 0.13 : 0) - cursor.amp) * 0.04
      drops = drops.filter((d) => t - d.born < DROP_LIFE)
      // skip the work entirely once the hero has scrolled away
      if (shown > 0.01) draw(t)
      raf = requestAnimationFrame(frame)
    }

    // drift up and fade out as the hero leaves, so the page below is plain black
    const onScroll = () => {
      const past = window.scrollY / window.innerHeight
      shown = 1 - smooth(0, 1, past)
      canvas.style.opacity = String(shown)
      canvas.style.transform = `translateY(${-Math.min(window.scrollY, window.innerHeight) * 0.25}px)`
      if (reduce && shown > 0.01) draw(0)
    }
    const onMove = (e: PointerEvent) => {
      const g = shown > 0.3 ? unproject(e.clientX, e.clientY) : null
      cursorOn = !!g
      if (g) {
        cursor.x = g.x
        cursor.z = g.z
      }
    }
    const onLeave = () => (cursorOn = false)
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      if (reduce || !el.closest('.hero') || el.closest('a, button')) return
      const g = unproject(e.clientX, e.clientY)
      if (!g) return
      drops.push({ ...g, born: performance.now() })
      if (drops.length > 5) drops.shift()
    }

    layout()
    onScroll()
    if (reduce) draw(0)
    else raf = requestAnimationFrame(frame)

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
