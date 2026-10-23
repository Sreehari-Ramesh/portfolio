import { useEffect, useRef, useState } from 'react'

// A small feed-forward network drawn like a figure in an ML paper: columns
// of neurons, every neuron wired to the next layer, link weight shown by
// line weight. A forward pass sweeps left to right; neurons fill in
// proportion to their activation and the outputs print their softmax
// values. Point at a neuron to see its connections, click to run a new pass.

const LAYERS = [4, 6, 6, 3]
const STEP_MS = 560 // time for the signal to cross one layer
const CYCLE_MS = 5200 // gap between automatic passes
const ACCENT = '124, 124, 240'

type Net = { w: number[][][]; b: number[][] }

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function makeNet(): Net {
  const w: number[][][] = []
  const b: number[][] = []
  for (let l = 0; l < LAYERS.length - 1; l++) {
    w.push(Array.from({ length: LAYERS[l] }, () => Array.from({ length: LAYERS[l + 1] }, () => rand(-1, 1))))
    b.push(Array.from({ length: LAYERS[l + 1] }, () => rand(-0.4, 0.4)))
  }
  return { w, b }
}

function forward(net: Net, input: number[]) {
  const acts = [input]
  for (let l = 0; l < net.w.length; l++) {
    const prev = acts[l]
    const z = net.b[l].map((bias, j) => prev.reduce((s, a, i) => s + a * net.w[l][i][j], bias))
    if (l === net.w.length - 1) {
      const m = Math.max(...z)
      const e = z.map((v) => Math.exp(2 * (v - m)))
      const sum = e.reduce((s, v) => s + v, 0)
      acts.push(e.map((v) => v / sum))
    } else acts.push(z.map((v) => (Math.tanh(v) + 1) / 2))
  }
  return acts
}

export default function NeuralNet() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [pass, setPass] = useState(1)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const net = makeNet()
    let acts = forward(net, Array.from({ length: LAYERS[0] }, () => Math.random()))
    let started = performance.now()
    let w = 0
    let h = 0
    let dpr = 1
    let pos: { x: number; y: number }[][] = []
    let hover: { l: number; i: number } | null = null
    let raf = 0
    let visible = true

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      const left = 44
      const right = w - 64
      const top = 28
      const span = h - 56
      const maxN = Math.max(...LAYERS)
      const gap = span / (maxN - 1)
      pos = LAYERS.map((n, l) =>
        Array.from({ length: n }, (_, i) => ({
          x: left + (l * (right - left)) / (LAYERS.length - 1),
          y: h / 2 + (i - (n - 1) / 2) * gap,
        })),
      )
    }

    const run = () => {
      acts = forward(net, Array.from({ length: LAYERS[0] }, () => Math.random()))
      started = performance.now()
      setPass((p) => p + 1)
    }

    const draw = (now: number) => {
      // p counts layers crossed; reduced motion shows the finished pass
      const p = reduce ? LAYERS.length : (now - started) / STEP_MS
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // links: resting weight first, then the travelling signal on top
      for (let l = 0; l < LAYERS.length - 1; l++) {
        const frac = p - l
        for (let i = 0; i < LAYERS[l]; i++)
          for (let j = 0; j < LAYERS[l + 1]; j++) {
            const a = pos[l][i]
            const b = pos[l + 1][j]
            const wt = Math.abs(net.w[l][i][j])
            const focus = hover && ((hover.l === l && hover.i === i) || (hover.l === l + 1 && hover.i === j))
            ctx.lineWidth = 0.5 + wt * 1.3
            ctx.strokeStyle = focus
              ? `rgba(247, 247, 248, ${0.25 + 0.5 * wt})`
              : `rgba(255, 255, 255, ${hover ? 0.025 : 0.035 + 0.06 * wt})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()

            const signal = acts[l][i] * wt
            if (frac > 0 && frac < 1 && signal > 0.18) {
              ctx.strokeStyle = `rgba(${ACCENT}, ${signal * (1 - Math.abs(frac - 0.5) * 1.6)})`
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
              if (signal > 0.45) {
                ctx.fillStyle = `rgba(${ACCENT}, 0.95)`
                ctx.beginPath()
                ctx.arc(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac, 1.7, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          }
      }

      // neurons fill as the pass reaches their layer
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'
      pos.forEach((layer, l) =>
        layer.forEach((n, i) => {
          const reached = Math.min(1, Math.max(0, (p - l) / 0.35))
          const a = acts[l][i] * reached
          const r = l === 0 || l === LAYERS.length - 1 ? 7 : 6
          ctx.fillStyle = '#131417'
          ctx.beginPath()
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
          ctx.fill()
          if (a > 0.02) {
            ctx.fillStyle = `rgba(${ACCENT}, ${0.15 + 0.85 * a})`
            ctx.beginPath()
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
            ctx.fill()
          }
          const isHover = hover && hover.l === l && hover.i === i
          ctx.lineWidth = 1
          ctx.strokeStyle = isHover ? '#F7F7F8' : a > 0.5 ? `rgba(${ACCENT}, 0.9)` : 'rgba(255, 255, 255, 0.18)'
          ctx.stroke()

          if (l === 0) {
            ctx.fillStyle = '#5C6370'
            ctx.textAlign = 'right'
            ctx.fillText(`x${i + 1}`, n.x - 14, n.y + 4)
          }
          if (l === LAYERS.length - 1) {
            ctx.textAlign = 'left'
            ctx.fillStyle = reached === 1 ? '#F7F7F8' : '#5C6370'
            ctx.fillText(reached === 1 ? acts[l][i].toFixed(2) : `y${i + 1}`, n.x + 14, n.y + 4)
          }
          if (isHover) {
            ctx.textAlign = 'center'
            ctx.fillStyle = '#F7F7F8'
            ctx.fillText(`a = ${acts[l][i].toFixed(2)}`, n.x, n.y - 14)
          }
        }),
      )
    }

    const loop = (now: number) => {
      if (now - started > CYCLE_MS) run()
      draw(now)
      raf = visible ? requestAnimationFrame(loop) : 0
    }
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop)
    }

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMove = (e: PointerEvent) => {
      const m = local(e)
      hover = null
      pos.forEach((layer, l) =>
        layer.forEach((n, i) => {
          if (Math.hypot(n.x - m.x, n.y - m.y) < 14) hover = { l, i }
        }),
      )
      canvas.style.cursor = hover ? 'pointer' : 'default'
      if (reduce) draw(performance.now())
    }
    const onLeave = () => {
      hover = null
      if (reduce) draw(performance.now())
    }
    const onClick = () => {
      run()
      if (reduce) draw(performance.now())
    }

    layout()
    draw(performance.now())
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)
    const ro = new ResizeObserver(() => {
      layout()
      draw(performance.now())
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
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <figure className="net-panel">
      <div className="net-head">
        <span className="net-title">
          <span className="live-dot" aria-hidden="true" />
          forward pass
        </span>
        <span className="net-meta">
          4 → 6 → 6 → 3 <span className="net-pass">pass {pass}</span>
        </span>
      </div>
      <canvas
        ref={ref}
        className="net-canvas"
        role="img"
        aria-label="A small neural network with 4 inputs, two hidden layers of 6 neurons and 3 outputs, running a forward pass"
      />
      <figcaption className="net-foot">
        <span className="mouse">Point at a neuron to see its weights. Click to run a new pass.</span>
        <span className="touch">Tap to run a new pass with new inputs.</span>
      </figcaption>
    </figure>
  )
}
