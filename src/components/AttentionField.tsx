import { useEffect, useRef } from 'react'

// The page backdrop: a grid of tokens, each row a sequence, decoded the way a
// language model writes. A few decoding heads move along the rows producing
// one token at a time; at every step arcs curve back from the new token to
// the earlier tokens it attends to, thicker for stronger attention. Pointing
// at a token makes it the query and shows its whole attention pattern; a
// click in the hero runs attention across that row. It dims once you scroll
// past the hero so the sections stay readable.

type Arc = { row: number; from: number; to: number; w: number; born: number; red: boolean }
type Head = { row: number; col: number; next: number }

const RED = '242, 84, 91'
const WHITE = '247, 247, 248'
const STEP_MS = 150 // one generated token per step
const GROW_MS = 380
const HOLD_MS = 1300
const FADE_MS = 900
const LIFE = GROW_MS + HOLD_MS + FADE_MS
const GLOW_MS = 5000 // how long a generated token stays lit

export default function AttentionField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let gap = 34
    let cols = 0
    let rows = 0
    let ox = 0
    let oy = 0
    let lit: Float64Array = new Float64Array(0) // time each token was generated
    let arcs: Arc[] = []
    let heads: Head[] = []
    let query: { row: number; col: number; weights: number[] } | null = null
    const pointer = { x: -9999, y: -9999 }
    let raf = 0

    const at = (row: number, col: number) => ({ x: ox + col * gap, y: oy + row * gap })

    const newHead = (now: number): Head => ({
      row: Math.floor(Math.random() * rows),
      col: Math.floor(Math.random() * Math.min(6, cols)),
      next: now + Math.random() * 600,
    })

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      gap = w < 700 ? 28 : 34
      cols = Math.floor(w / gap) + 1
      rows = Math.floor(h / gap) + 1
      ox = (w - (cols - 1) * gap) / 2
      oy = (h - (rows - 1) * gap) / 2
      lit = new Float64Array(cols * rows).fill(-1e9)
      arcs = []
      const now = performance.now()
      heads = Array.from({ length: w < 700 ? 5 : 6 }, () => newHead(now))
      query = null
    }

    // attention from one token to earlier tokens in its row: nearer tokens
    // tend to matter more, with a few strong long-range links
    const attend = (row: number, col: number, now: number, count: number, red: boolean) => {
      for (let k = 0; k < count && col > 0; k++) {
        const back = Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * col)
        const to = Math.max(0, col - back)
        const wgt = Math.min(1, 0.25 + Math.random() * 0.75 * (1 / Math.sqrt(back)))
        arcs.push({ row, from: col, to, w: wgt, born: now, red })
      }
    }

    const arcPath = (row: number, from: number, to: number) => {
      const a = at(row, from)
      const b = at(row, to)
      const span = Math.abs(from - to) * gap
      // arcs rise above the row, higher for longer reach
      const lift = Math.min(gap * 3.2, 10 + span * 0.32)
      return { a, b, cx: (a.x + b.x) / 2, cy: a.y - lift }
    }

    const step = (now: number) => {
      for (const hd of heads) {
        if (now < hd.next) continue
        hd.next = now + STEP_MS + Math.random() * 60
        hd.col += 1
        if (hd.col >= cols) {
          Object.assign(hd, newHead(now))
          continue
        }
        lit[hd.row * cols + hd.col] = now
        attend(hd.row, hd.col, now, 2 + Math.floor(Math.random() * 2), Math.random() < 0.3)
      }
      arcs = arcs.filter((a) => now - a.born < LIFE)
      if (arcs.length > 260) arcs.splice(0, arcs.length - 260)

      // the hovered token becomes the query; its pattern is fixed while it stays
      const col = Math.round((pointer.x - ox) / gap)
      const row = Math.round((pointer.y - oy) / gap)
      const near = Math.hypot(pointer.x - at(row, col).x, pointer.y - at(row, col).y) < gap * 0.45
      if (near && col > 0 && col < cols && row >= 0 && row < rows) {
        if (!query || query.row !== row || query.col !== col)
          query = {
            row,
            col,
            weights: Array.from({ length: col }, (_, j) =>
              Math.random() < 0.55 ? 0 : Math.min(1, (0.2 + Math.random()) / Math.sqrt(col - j)),
            ),
          }
      } else query = null
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // tokens: quiet dots, brighter for a while after they are generated
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const age = now - lit[r * cols + c]
          const glow = age < GLOW_MS ? 1 - age / GLOW_MS : 0
          const p = at(r, c)
          ctx.fillStyle = glow > 0 ? `rgba(${WHITE}, ${0.14 + 0.4 * glow})` : `rgba(${WHITE}, 0.12)`
          ctx.fillRect(p.x - 1, p.y - 1, glow > 0.6 ? 2.6 : 2, glow > 0.6 ? 2.6 : 2)
        }

      // attention arcs grow from the new token back to what it attends to
      ctx.lineCap = 'round'
      for (const arc of arcs) {
        const age = now - arc.born
        const grow = Math.min(1, age / GROW_MS)
        const fade = age > GROW_MS + HOLD_MS ? 1 - (age - GROW_MS - HOLD_MS) / FADE_MS : 1
        const { a, b, cx, cy } = arcPath(arc.row, arc.from, arc.to)
        ctx.strokeStyle = arc.red ? `rgba(${RED}, ${0.75 * arc.w * fade})` : `rgba(${WHITE}, ${0.32 * arc.w * fade})`
        ctx.lineWidth = 0.6 + arc.w * 1.6
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        // draw only the grown part of the curve
        const n = 18
        for (let k = 1; k <= Math.ceil(n * grow); k++) {
          const t = Math.min(grow, k / n)
          const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x
          const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // decoding heads: a small red block where the next token is written
      for (const hd of heads) {
        const p = at(hd.row, hd.col)
        ctx.fillStyle = `rgba(${RED}, 0.95)`
        ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5)
        ctx.fillStyle = `rgba(${RED}, 0.18)`
        ctx.fillRect(p.x - 6, p.y - 6, 12, 12)
      }

      // the pointer's query token and its full attention pattern
      if (query) {
        const q = at(query.row, query.col)
        query.weights.forEach((wgt, j) => {
          if (wgt < 0.05) return
          const { a, b, cx, cy } = arcPath(query!.row, query!.col, j)
          ctx.strokeStyle = `rgba(${RED}, ${0.25 + 0.7 * wgt})`
          ctx.lineWidth = 0.7 + wgt * 2.2
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.quadraticCurveTo(cx, cy, b.x, b.y)
          ctx.stroke()
          ctx.fillStyle = `rgba(${RED}, ${0.4 + 0.6 * wgt})`
          ctx.fillRect(b.x - 2, b.y - 2, 4, 4)
        })
        ctx.strokeStyle = `rgba(${RED}, 0.9)`
        ctx.lineWidth = 1
        ctx.strokeRect(q.x - 5, q.y - 5, 10, 10)
      }
    }

    const frame = (now: number) => {
      step(now)
      draw(now)
      raf = requestAnimationFrame(frame)
    }

    // dim the backdrop as the hero scrolls away
    const onScroll = () => {
      const past = Math.min(1, window.scrollY / (window.innerHeight * 0.9))
      canvas.style.opacity = String(1 - 0.62 * past)
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
      const el = e.target as HTMLElement
      if (reduce || !el.closest('.hero') || el.closest('a, button')) return
      const row = Math.max(0, Math.min(rows - 1, Math.round((e.clientY - oy) / gap)))
      const now = performance.now()
      for (let c = 1; c < cols; c += 2) {
        lit[row * cols + c] = now
        attend(row, c, now, 2, true)
      }
    }

    layout()
    if (reduce) {
      // a still frame: a few rows already decoded with their attention shown
      const now = performance.now()
      for (let r = 2; r < rows; r += 5)
        for (let c = 1; c < cols; c += 3) {
          lit[r * cols + c] = now
          attend(r, c, now - GROW_MS, 1, Math.random() < 0.3)
        }
      draw(now + GROW_MS)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    const onResize = () => {
      // phones resize when the address bar hides; only rebuild on real changes
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      layout()
      if (reduce) draw(performance.now())
    }
    window.addEventListener('resize', onResize)
    if (!reduce) raf = requestAnimationFrame(frame)

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
