import { useEffect, useRef } from 'react'

// The hero backdrop: an even dot grid across the first screen, still at
// rest. Moving the pointer drags the dots around it along in the direction
// you move; when you stop they glide back home. A click in the hero sends a
// burst: a shockwave ring that pushes dots outward as it passes, its leading
// edge in red, before they spring back. One burst plays on load. It fades out
// as the hero scrolls away and stops drawing once nothing is moving.

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number }
type Burst = { x: number; y: number; born: number }

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const GRID = 26 // spacing of the dot grid
const DRAG = 150 // radius around the pointer whose dots get pulled along
const PULL = 0.6 // how strongly the pointer's motion drags them
const BURST_SPEED = 0.55 // px per ms the shockwave travels
const BURST_MS = 1600
const BAND = 46 // thickness of the shockwave ring

export default function DotField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let grid: Dot[] = []
    let bursts: Burst[] = []
    let raf = 0
    let shown = 1
    let dirty = true
    // pointer position and its recent velocity, which is what drags the dots
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, seen: false }

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      grid = []
      const ox = ((w % GRID) + GRID) / 2
      const oy = ((h % GRID) + GRID) / 2
      for (let y = oy; y < h; y += GRID)
        for (let x = ox; x < w; x += GRID) grid.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 })
      dirty = true
    }

    // how strongly a dot sits on a burst's leading edge right now, 0..1
    const onFront = (d: Dot, now: number) => {
      let best = 0
      for (const b of bursts) {
        const age = now - b.born
        const r = age * BURST_SPEED
        const gap = Math.abs(Math.hypot(d.hx - b.x, d.hy - b.y) - r)
        if (gap < BAND) best = Math.max(best, (1 - gap / BAND) * (1 - age / BURST_MS))
      }
      return best
    }

    const update = (now: number) => {
      bursts = bursts.filter((b) => now - b.born < BURST_MS)
      let moving = bursts.length > 0
      for (const d of grid) {
        // the pointer drags nearby dots along with its motion
        const dx = d.x - pointer.x
        const dy = d.y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < DRAG * DRAG) {
          const f = (1 - Math.sqrt(d2) / DRAG) ** 2
          d.vx += pointer.vx * f * PULL
          d.vy += pointer.vy * f * PULL
        }
        // a passing shockwave pushes dots outward from its centre
        for (const b of bursts) {
          const age = now - b.born
          const bx = d.hx - b.x
          const by = d.hy - b.y
          const dist = Math.hypot(bx, by) || 1
          const gap = Math.abs(dist - age * BURST_SPEED)
          if (gap < BAND) {
            const f = (1 - gap / BAND) * (1 - age / BURST_MS) * 1.6
            d.vx += (bx / dist) * f
            d.vy += (by / dist) * f
          }
        }
        // springs pull every dot back home
        d.vx = (d.vx + (d.hx - d.x) * 0.05) * 0.86
        d.vy = (d.vy + (d.hy - d.y) * 0.05) * 0.86
        if (Math.abs(d.vx) > 0.02 || Math.abs(d.vy) > 0.02 || Math.abs(d.hx - d.x) > 0.3 || Math.abs(d.hy - d.y) > 0.3) {
          d.x += d.vx
          d.y += d.vy
          moving = true
        } else {
          d.x = d.hx
          d.y = d.hy
          d.vx = d.vy = 0
        }
      }
      // the pointer's pull fades quickly once it stops
      pointer.vx *= 0.8
      pointer.vy *= 0.8
      if (moving) dirty = true
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      // dots brighten the further they are pulled; the ones at the pointer or
      // on a shockwave's leading edge turn red
      const reds: { d: Dot; a: number }[] = []
      ctx.fillStyle = `rgb(${WHITE})`
      for (const d of grid) {
        const off = Math.hypot(d.x - d.hx, d.y - d.hy)
        const front = bursts.length ? onFront(d, now) : 0
        const atPointer = off > 2 && Math.hypot(d.x - pointer.x, d.y - pointer.y) < 34
        if (front > 0.35 || atPointer) {
          reds.push({ d, a: atPointer ? 0.9 : front })
          continue
        }
        ctx.globalAlpha = 0.16 + Math.min(0.6, off / 16)
        const s = off > 1 ? 1.8 : 1.4
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s)
      }
      ctx.fillStyle = `rgb(${RED})`
      for (const { d, a } of reds) {
        ctx.globalAlpha = Math.min(1, 0.3 + a)
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2)
      }
      ctx.globalAlpha = 1
      dirty = false
    }

    const frame = (now: number) => {
      update(now)
      if (dirty && shown > 0.01) draw(now)
      raf = requestAnimationFrame(frame)
    }

    const burst = (x: number, y: number) => {
      bursts.push({ x, y, born: performance.now() })
      if (bursts.length > 4) bursts.shift()
    }

    const onScroll = () => {
      const s = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      shown = 1 - s * s * (3 - 2 * s)
      canvas.style.opacity = String(shown)
      canvas.style.transform = `translateY(${-Math.min(window.scrollY, window.innerHeight) * 0.25}px)`
      if (shown > 0.01) dirty = true
    }
    const onMove = (e: PointerEvent) => {
      if (pointer.seen) {
        // cap the pull so a fast flick doesn't fling dots off screen
        pointer.vx = Math.max(-40, Math.min(40, e.clientX - pointer.x))
        pointer.vy = Math.max(-40, Math.min(40, e.clientY - pointer.y))
      }
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.seen = true
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
      pointer.vx = pointer.vy = 0
      pointer.seen = false
    }
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return
      if (!e.target.closest('.hero') || e.target.closest('a, button')) return
      burst(e.clientX, e.clientY)
    }

    build()
    onScroll()
    draw(performance.now())
    window.addEventListener('scroll', onScroll, { passive: true })
    let intro = 0
    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerdown', onDown)
      document.documentElement.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(frame)
      // one burst on load so the idea shows before anyone interacts
      intro = window.setTimeout(() => burst(w * (w < 900 ? 0.5 : 0.7), h * (w < 900 ? 0.3 : 0.5)), 700)
    }
    const onResize = () => {
      // phones resize when the address bar hides; only rebuild on real changes
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      build()
      draw(performance.now())
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(intro)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="scape" aria-hidden="true" />
}
