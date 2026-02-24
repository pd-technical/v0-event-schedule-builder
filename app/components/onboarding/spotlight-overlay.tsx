"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Search, Filter, List, Map, Route, Calendar, Download,
  ChevronLeft, ChevronRight, X,
} from "lucide-react"
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorial-steps"

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Filter, List, Map, Route, Calendar, Download,
}

interface SpotlightOverlayProps {
  step: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export function SpotlightOverlay({ step, onNext, onBack, onSkip }: SpotlightOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [rectTarget, setRectTarget] = useState<string | null>(null)
  const current: TutorialStep = TUTORIAL_STEPS[step]
  const isFirst = step === 0
  const isLast = step === TUTORIAL_STEPS.length - 1
  const hasScrolledRef = useRef(false)

  // Fix #2: Reposition only (no scrollIntoView) — used for scroll/resize listeners
  // Skip updates while scrollIntoView is in progress to avoid flashing
  const reposition = useCallback(() => {
    if (!hasScrolledRef.current) return
    const el = document.querySelector(`[data-onboarding="${current.target}"]`)
    if (el) {
      setRect(el.getBoundingClientRect())
      setRectTarget(current.target)
    }
  }, [current.target])

  // Fix #2: Initial measure + optional scrollIntoView — only called once per step
  useEffect(() => {
    hasScrolledRef.current = false
    const el = document.querySelector(`[data-onboarding="${current.target}"]`)
    if (!el) return

    if (current.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      // Poll until element is within viewport, then reveal
      let frame: number
      const start = performance.now()
      const poll = () => {
        const r = el.getBoundingClientRect()
        const inViewport = r.top >= 0 && r.bottom <= window.innerHeight
        if (inViewport || performance.now() - start > 600) {
          setRect(r)
          setRectTarget(current.target)
          hasScrolledRef.current = true
        } else {
          frame = requestAnimationFrame(poll)
        }
      }
      frame = requestAnimationFrame(poll)
      return () => cancelAnimationFrame(frame)
    } else {
      setRect(el.getBoundingClientRect())
      setRectTarget(current.target)
      hasScrolledRef.current = true
    }
  }, [current.target, current.scrollIntoView])

  // Fix #2: Reposition on resize/scroll (no scrollIntoView)
  useEffect(() => {
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [reposition])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); onNext() }
      else if (e.key === "ArrowLeft" && !isFirst) { e.preventDefault(); onBack() }
      else if (e.key === "Escape") { e.preventDefault(); onSkip() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onNext, onBack, onSkip, isFirst])

  const ready = rect && rectTarget === current.target

  // Compute layout only when rect is valid for current step
  const padding = 8
  const cutout = ready ? {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  } : null

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const position = ready ? (isMobile ? current.mobilePosition : current.tooltipPosition) : "bottom"
  const Icon = ICON_MAP[current.icon] ?? Search
  const tooltipStyle = ready ? computeTooltipPosition(position, rect) : {}

  return (
    <>
      {/* Backdrop always renders — no flash between steps */}
      <div
        className="fixed inset-0 z-[2000]"
        onClick={onSkip}
      />

      {/* Spotlight always renders — 0x0 center fallback keeps box-shadow overlay visible between steps */}
      <div
        className="onboarding-spotlight"
        style={{
          position: "fixed",
          top: ready && cutout ? cutout.top : '50vh',
          left: ready && cutout ? cutout.left : '50vw',
          width: ready && cutout ? cutout.width : 0,
          height: ready && cutout ? cutout.height : 0,
          zIndex: 2001,
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />

      {/* Tooltip only renders when rect is measured for the current step */}
      {ready && cutout && (
        <div
          className="fixed z-[2002]"
          style={{
            ...tooltipStyle,
            width: "min(340px, 90vw)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="rounded-xl bg-white p-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                <Icon className="h-5 w-5 text-[var(--accent-foreground)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--primary)]">{current.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="rounded-md p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Close tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {current.description}
          </p>

          {/* Progress dots */}
          <div className="mt-4 flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-5 bg-[var(--primary)]"
                    : i < step
                    ? "w-2 bg-[var(--primary)]/40"
                    : "w-2 bg-[var(--border)]"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--muted)]"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <button
                onClick={onNext}
                className="flex h-9 min-w-[44px] items-center justify-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                {isLast ? "Done!" : (
                  <>Next <ChevronRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  )
}

// Fix #3 & #4: Correct tooltip positioning with overflow clamping and fallbacks
function computeTooltipPosition(
  position: string,
  rect: DOMRect,
): React.CSSProperties {
  const gap = 12
  const tooltipWidth = Math.min(340, window.innerWidth * 0.9)
  const vw = window.innerWidth

  const clampLeft = (left: number) => Math.max(8, Math.min(left, vw - tooltipWidth - 8))

  switch (position) {
    case "bottom":
      return {
        top: rect.bottom + gap,
        left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
      }
    case "top":
      return {
        top: Math.max(8, rect.top - gap - 200),
        left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
      }
    case "left": {
      const availLeft = rect.left - gap - tooltipWidth
      if (availLeft < 8) {
        return {
          top: rect.bottom + gap,
          left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
        }
      }
      return {
        top: Math.max(8, rect.top + rect.height / 2 - 100),
        left: availLeft,
      }
    }
    case "right": {
      const availRight = rect.right + gap
      if (availRight + tooltipWidth > vw - 8) {
        return {
          top: rect.bottom + gap,
          left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
        }
      }
      return {
        top: Math.max(8, rect.top + rect.height / 2 - 100),
        left: availRight,
      }
    }
    default:
      return { top: rect.bottom + gap, left: clampLeft(rect.left) }
  }
}
