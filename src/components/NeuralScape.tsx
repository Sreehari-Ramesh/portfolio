import { useEffect, useRef } from 'react'

// A deep network seen in perspective behind the hero: five layers laid out as
// square grids, like the feature maps of a convolutional net, each neuron
// wired to a few neurons in the next layer. The model turns slowly and tilts
// toward the pointer. Signals run through it continuously, neurons near the
// pointer fire, and a click sends a burst from every input at once.

type Node = { x: number; y: number; z: number; layer: number; flash: number; out: number[] }
type Pulse = { from: number; to: number; t: number; speed: number }

const LAYERS = [4, 6, 7, 5, 3] // grid side per layer
const GAP = 46 // spacing between neurons inside a layer
const DEPTH = 240 // spacing between layers
const FOCAL = 950
const RED = '242, 84, 91'
const WHITE = '247, 247, 248'

export default function NeuralScape() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // build the model once, centred on the origin
    const nodes: Node[] = []
    const layerStart: number[] = []
    LAYERS.forEach((side, l) => {
      layerStart.push(nodes.length)
      const z = (l - (LAYERS.length - 1) / 2) * DEPTH
      for (let r = 0; r < side; r++)
        for (let c = 0; c < side; c++)
          nodes.push({ x: (c - (side - 1) / 2) * GAP, y: (r - (side - 1) / 2) * GAP, z, layer: l, flash: 0, out: [] })
    })
    const edges: [number, number][] = []
    nodes.forEach((n, i) => {
      if (n.layer === LAYERS.length - 1) return
      const next = layerStart[n.layer + 1]
      const count = LAYERS[n.layer + 1] ** 2
      // link to the nearest neurons in the next layer plus one long-range link
      const near = Array.from({ length: count }, (_, k) => next + k)
        .sort((a, b) => Math.hypot(nodes[a].x - n.x, nodes[a].y - n.y) - Math.hypot(nodes[b].x - n.x, nodes[b].y - n.y))
        .slice(0, 2)
      near.push(next + Math.floor(Math.random() * count))
      for (const j of new Set(near)) {
        n.out.push(j)
        edges.push([i, j])
      }
    })

    let w = 0
    let h = 0
    let dpr = 1
    let scale = 1
    let cx = 0
    let cy = 0
    let pulses: Pulse[] = []
    let yaw = -1.0
    let pitch = -0.22
    const target = { yaw: -1.0, pitch: -0.22 }
    const pointer = { x: -9999, y: -9999, on: false }
    const proj: { x: number; y: number; d: number; s: number }[] = nodes.map(() => ({ x: 0, y: 0, d: 0, s: 0 }))
    let raf = 0
    let last = 0
    let spawnClock = 0
    let visible = true

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      const wide = w > 900
      // on wide screens the model sits to the right of the text
      cx = wide ? w * 0.64 : w * 0.5
      cy = wide ? h * 0.52 : h * 0.36
      scale = Math.min(w, h) / (wide ? 960 : 640)
    }

    const project = (now: number) => {
      const cyw = Math.cos(yaw)
      const syw = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)
      const drift = Math.sin(now / 4200) * 6
      nodes.forEach((n, i) => {
        const x1 = n.x * cyw + n.z * syw
        const z1 = -n.x * syw + n.z * cyw
        const y1 = (n.y + drift) * cp - z1 * sp
        const z2 = (n.y + drift) * sp + z1 * cp
        const k = FOCAL / (FOCAL + z2)
        proj[i].x = cx + x1 * k * scale
        proj[i].y = cy + y1 * k * scale
        proj[i].s = k
        // depth cue: far neurons fade into the black
        proj[i].d = Math.max(0.12, Math.min(1, (FOCAL - z2 * 0.9) / FOCAL))
      })
    }

    const fire = (i: number, strength = 1) => {
      nodes[i].flash = Math.max(nodes[i].flash, strength)
      for (const j of nodes[i].out)
        if (Math.random() < 0.6 && pulses.length < 140)
          pulses.push({ from: i, to: j, t: 0, speed: 0.0011 + Math.random() * 0.0007 })
    }

    const step = (now: number, dt: number) => {
      yaw += (target.yaw + Math.sin(now / 9000) * 0.22 - yaw) * 0.03
      pitch += (target.pitch - pitch) * 0.03

      for (const p of pulses) p.t += p.speed * dt
      const done = pulses.filter((p) => p.t >= 1)
      pulses = pulses.filter((p) => p.t < 1)
      for (const p of done) {
        nodes[p.to].flash = 1
        // signals keep travelling deeper, thinning out as they go
        if (Math.random() < 0.55) fire(p.to, 1)
      }

      spawnClock += dt
      if (spawnClock > 260) {
        spawnClock = 0
        fire(Math.floor(Math.random() * LAYERS[0] ** 2))
      }

      nodes.forEach((n, i) => {
        if (pointer.on) {
          const d = Math.hypot(proj[i].x - pointer.x, proj[i].y - pointer.y)
          if (d < 70 && n.flash < 0.2 && Math.random() < 0.004 * dt) fire(i, 0.9)
        }
        n.flash *= Math.exp(-dt / 520)
      })
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // faint frames around each layer read as feature maps
      LAYERS.forEach((side, l) => {
        const a = layerStart[l]
        const corners = [a, a + side - 1, a + side * side - 1, a + side * (side - 1)].map((i) => proj[i])
        const pad = 0.5 / (side - 1)
        const ex = (p: { x: number; y: number }, q: { x: number; y: number }) => ({
          x: p.x + (p.x - q.x) * pad,
          y: p.y + (p.y - q.y) * pad,
        })
        const [c0, c1, c2, c3] = corners
        const pts = [ex(c0, c2), ex(c1, c3), ex(c2, c0), ex(c3, c1)]
        ctx.strokeStyle = `rgba(${WHITE}, ${0.07 * c0.d + 0.03})`
        ctx.lineWidth = 1
        ctx.beginPath()
        pts.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.closePath()
        ctx.stroke()
      })

      ctx.lineWidth = 0.6
      for (const [i, j] of edges) {
        const a = proj[i]
        const b = proj[j]
        ctx.strokeStyle = `rgba(${WHITE}, ${0.07 * Math.min(a.d, b.d)})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // pulses: a short red streak with a bright head
      ctx.lineCap = 'round'
      for (const p of pulses) {
        const a = proj[p.from]
        const b = proj[p.to]
        const t0 = Math.max(0, p.t - 0.22)
        const hx = a.x + (b.x - a.x) * p.t
        const hy = a.y + (b.y - a.y) * p.t
        const depth = Math.min(a.d, b.d)
        ctx.strokeStyle = `rgba(${RED}, ${0.55 * depth})`
        ctx.lineWidth = 1.4 * a.s
        ctx.beginPath()
        ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0)
        ctx.lineTo(hx, hy)
        ctx.stroke()
        ctx.fillStyle = `rgba(${RED}, ${0.95 * depth})`
        ctx.beginPath()
        ctx.arc(hx, hy, 1.6 * a.s, 0, Math.PI * 2)
        ctx.fill()
      }

      // neurons, far to near so closer ones sit on top
      const order = proj.map((p, i) => i).sort((a, b) => proj[a].s - proj[b].s)
      for (const i of order) {
        const p = proj[i]
        const n = nodes[i]
        const r = (1.6 + 1.4 * n.flash) * p.s * Math.max(0.8, scale)
        if (n.flash > 0.08) {
          ctx.fillStyle = `rgba(${RED}, ${0.16 * n.flash * p.d})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(${RED}, ${(0.5 + 0.5 * n.flash) * p.d})`
        } else ctx.fillStyle = `rgba(${WHITE}, ${0.42 * p.d})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const frame = (now: number) => {
      const dt = Math.min(50, last ? now - last : 16)
      last = now
      step(now, dt)
      project(now)
      draw()
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const start = () => {
      if (!raf && !reduce) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    const host = canvas.parentElement!
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.on = true
      // tilt the model toward the pointer
      target.yaw = -1.0 + (pointer.x / w - 0.5) * 0.5
      target.pitch = -0.22 + (pointer.y / h - 0.5) * 0.3
    }
    const onLeave = () => {
      pointer.on = false
      target.yaw = -1.0
      target.pitch = -0.22
    }
    const onDown = (e: PointerEvent) => {
      if (reduce || (e.target as HTMLElement).closest('a, button')) return
      for (let i = 0; i < LAYERS[0] ** 2; i++) fire(i)
    }

    resize()
    project(0)
    draw()
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    const ro = new ResizeObserver(() => {
      resize()
      project(performance.now())
      draw()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)
    start()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return <canvas ref={ref} className="scape" aria-hidden="true" />
}
