import { useEffect, useRef } from 'react'

// The hero backdrop: a diffusion model generating the initials "SR". The
// first screen opens as pure noise and denoises into the letters over a few
// seconds while a step counter runs down, then holds still. Moving the
// pointer through the letters scatters nearby particles, which spring back
// into place; a click in the hero diffuses everything back to noise and
// generates it again. Faint noise fills the rest of the screen so the whole
// view reads as a canvas being sampled. It fades out as the hero scrolls
// away and stops drawing once nothing is moving.

type P = {
  tx: number // target, the particle's place in the letters
  ty: number
  nx: number // noise position the particle starts from
  ny: number
  x: number
  y: number
  vx: number
  vy: number
  red: boolean
}

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const STEPS = 50
const DENOISE_MS = 3000
const DIFFUSE_MS = 650
const REPEL = 90 // pointer radius that scatters particles

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.8
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export default function DiffusionField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let alive = true

    let w = 0
    let h = 0
    let dpr = 1
    let parts: P[] = []
    let dust: { x: number; y: number }[] = []
    let box = { x: 0, y: 0, w: 0, h: 0 } // bounds of the letters, for the label
    // phase: generating from noise, diffusing back to noise, or at rest
    let phase: 'denoise' | 'diffuse' | 'rest' = reduce ? 'rest' : 'denoise'
    let phaseStart = performance.now()
    let raf = 0
    let shown = 1
    let dirty = true
    const pointer = { x: -9999, y: -9999 }

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const narrow = w < 900

      // draw the letters off screen and sample their pixels as targets
      // on wide screens the letters sit right of the copy without running under it
      const size = narrow ? Math.min(w * 0.62, h * 0.32) : Math.min(h * 0.62, w * 0.3)
      const cx = narrow ? w / 2 : w * 0.76
      const cy = narrow ? h * 0.24 : h * 0.52
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const o = off.getContext('2d')!
      o.fillStyle = '#fff'
      o.font = `600 ${size}px "Space Grotesk", system-ui, sans-serif`
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillText('SR', cx, cy)
      const m = o.measureText('SR')
      box = { x: cx - m.width / 2, y: cy - size * 0.36, w: m.width, h: size * 0.72 }
      const data = o.getImageData(0, 0, w, h).data
      const gap = narrow ? 4 : 5
      parts = []
      for (let y = 0; y < h; y += gap)
        for (let x = 0; x < w; x += gap)
          if (data[(y * w + x) * 4 + 3] > 140) {
            const nx = rand(0, w)
            const ny = rand(0, h)
            parts.push({ tx: x, ty: y, nx, ny, x: nx, y: ny, vx: 0, vy: 0, red: Math.random() < 0.08 })
          }

      // sparse static noise across the whole screen
      dust = Array.from({ length: Math.round((w * h) / 2600) }, () => ({ x: rand(0, w), y: rand(0, h) }))

      if (phase === 'rest') for (const p of parts) Object.assign(p, { x: p.tx, y: p.ty, vx: 0, vy: 0 })
      dirty = true
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      ctx.fillStyle = `rgb(${WHITE})`
      ctx.globalAlpha = 0.14
      for (const d of dust) ctx.fillRect(d.x, d.y, 1.2, 1.2)

      // how far along the current generation is, for brightness and the label
      const t = Math.min(1, (now - phaseStart) / (phase === 'diffuse' ? DIFFUSE_MS : DENOISE_MS))
      const clarity = phase === 'denoise' ? ease(t) : phase === 'diffuse' ? 1 - ease(t) : 1

      ctx.globalAlpha = 0.28 + 0.5 * clarity
      for (const p of parts) if (!p.red) ctx.fillRect(p.x - 0.9, p.y - 0.9, 1.8, 1.8)
      ctx.fillStyle = `rgb(${RED})`
      ctx.globalAlpha = 0.55 + 0.45 * clarity
      for (const p of parts) if (p.red) ctx.fillRect(p.x - 1, p.y - 1, 2, 2)
      ctx.globalAlpha = 1

      // the sampler's step counter under the letters
      const step = phase === 'rest' ? 0 : phase === 'denoise' ? Math.round(STEPS * (1 - t)) : Math.round(STEPS * t)
      ctx.font = '12px "IBM Plex Mono", ui-monospace, monospace'
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(122, 129, 142, 0.9)'
      const label =
        phase === 'rest' ? 'sample complete' : phase === 'denoise' ? `denoising step ${STEPS - step} / ${STEPS}` : 'adding noise'
      ctx.fillText(label, box.x + box.w, box.y + box.h + 28)
    }

    const update = (now: number) => {
      let moving = false
      if (phase !== 'rest') {
        const dur = phase === 'diffuse' ? DIFFUSE_MS : DENOISE_MS
        const t = Math.min(1, (now - phaseStart) / dur)
        // blend between noise and letters, with jitter that shrinks as noise is removed
        const e = phase === 'denoise' ? ease(t) : 1 - ease(t)
        const jitter = (1 - e) * 14
        for (const p of parts) {
          p.x = p.nx + (p.tx - p.nx) * e + gauss() * jitter
          p.y = p.ny + (p.ty - p.ny) * e + gauss() * jitter
          p.vx = p.vy = 0
        }
        moving = true
        if (t >= 1) {
          // denoising starts from the same noise the diffusion ended on
          if (phase === 'diffuse') phase = 'denoise'
          else {
            phase = 'rest'
            for (const p of parts) Object.assign(p, { x: p.tx, y: p.ty })
          }
          phaseStart = now
        }
      } else {
        // at rest: the pointer scatters particles and springs pull them home
        for (const p of parts) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < REPEL * REPEL && d2 > 0.01) {
            const f = (1 - Math.sqrt(d2) / REPEL) * 2.2
            const d = Math.sqrt(d2)
            p.vx += (dx / d) * f
            p.vy += (dy / d) * f
          }
          p.vx = (p.vx + (p.tx - p.x) * 0.06) * 0.82
          p.vy = (p.vy + (p.ty - p.y) * 0.06) * 0.82
          if (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || Math.abs(p.tx - p.x) > 0.3) {
            p.x += p.vx
            p.y += p.vy
            moving = true
          } else {
            p.x = p.tx
            p.y = p.ty
          }
        }
      }
      if (moving) dirty = true
    }

    const frame = (now: number) => {
      update(now)
      if (dirty && shown > 0.01) {
        draw(now)
        dirty = false
      }
      raf = requestAnimationFrame(frame)
    }

    const onScroll = () => {
      const past = window.scrollY / window.innerHeight
      const s = Math.min(1, Math.max(0, past))
      shown = 1 - s * s * (3 - 2 * s)
      canvas.style.opacity = String(shown)
      canvas.style.transform = `translateY(${-Math.min(window.scrollY, window.innerHeight) * 0.25}px)`
    }
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return
      if (!e.target.closest('.hero') || e.target.closest('a, button') || phase !== 'rest') return
      // diffuse the letters out to fresh noise, then generate them again from it
      for (const p of parts) {
        p.nx = rand(0, w)
        p.ny = rand(0, h)
      }
      phase = 'diffuse'
      phaseStart = performance.now()
    }

    const start = async () => {
      // sample the letters only once the display face has loaded
      try {
        await document.fonts.load('600 100px "Space Grotesk"')
      } catch {
        /* fall back to the system face */
      }
      if (!alive) return
      build()
      phaseStart = performance.now()
      onScroll()
      if (reduce) draw(performance.now())
      else raf = requestAnimationFrame(frame)
    }
    start()

    window.addEventListener('scroll', onScroll, { passive: true })
    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerdown', onDown)
      document.documentElement.addEventListener('pointerleave', onLeave)
    }
    const onResize = () => {
      // phones resize when the address bar hides; only rebuild on real changes
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      phase = 'rest'
      build()
      draw(performance.now())
    }
    window.addEventListener('resize', onResize)

    return () => {
      alive = false
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
