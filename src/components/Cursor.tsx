import { useEffect, useRef } from 'react'

// A custom pointer for mouse users: a red dot that tracks the pointer exactly
// and a thin ring that glides after it. Over a link or button the ring
// wraps that element; a click sends out a quick pulse. It switches on at the
// first real mouse or trackpad movement rather than trusting media queries,
// which report many touch-screen laptops as touch-only, and steps aside
// whenever touch is used. Text fields keep their native cursor, and reduced
// motion drops the glide.

const TARGETS = 'a, button, [role="button"], .project-row'

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = dot.current!
    const r = ring.current!
    const root = document.documentElement

    const pos = { x: -100, y: -100 }
    const ringBox = { x: -100, y: -100, w: 30, h: 30 }
    let target: HTMLElement | null = null
    let raf = 0

    const onMove = (e: PointerEvent) => {
      // touch hands control back to the native cursor; a mouse takes it again
      if (e.pointerType === 'touch') {
        root.classList.remove('has-cursor')
        return
      }
      if (!root.classList.contains('has-cursor')) {
        root.classList.add('has-cursor')
        // start the ring where the pointer is, not gliding in from a corner
        Object.assign(ringBox, { x: e.clientX, y: e.clientY })
      }
      pos.x = e.clientX
      pos.y = e.clientY
      d.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      if (!(e.target instanceof Element)) return
      const el = e.target as HTMLElement
      // any movement over the page shows it again, so it can never stay hidden
      const typing = !!el.closest('input, textarea')
      root.classList.toggle('cursor-hidden', typing)
      const t = typing ? null : (el.closest(TARGETS) as HTMLElement | null)
      if (t !== target) {
        target = t
        r.classList.toggle('on-target', !!t)
      }
    }
    const onLeave = () => root.classList.add('cursor-hidden')
    const onEnter = () => root.classList.remove('cursor-hidden')
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        root.classList.remove('has-cursor')
        return
      }
      r.classList.remove('pulse')
      void r.offsetWidth // restart the pulse animation
      r.classList.add('pulse')
    }

    const frame = () => {
      // aim the ring at the hovered element's box, or a small circle at the pointer
      let goal = { x: pos.x, y: pos.y, w: 30, h: 30 }
      if (target) {
        const b = target.getBoundingClientRect()
        const pad = target.matches('.project-row') ? 6 : 8
        goal = { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width + pad * 2, h: b.height + pad * 2 }
      }
      const k = reduce ? 1 : 0.2
      ringBox.x += (goal.x - ringBox.x) * k
      ringBox.y += (goal.y - ringBox.y) * k
      ringBox.w += (goal.w - ringBox.w) * k
      ringBox.h += (goal.h - ringBox.h) * k
      r.style.width = `${ringBox.w}px`
      r.style.height = `${ringBox.h}px`
      r.style.transform = `translate(${ringBox.x - ringBox.w / 2}px, ${ringBox.y - ringBox.h / 2}px)`
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerenter', onEnter)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-cursor', 'cursor-hidden')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerenter', onEnter)
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
