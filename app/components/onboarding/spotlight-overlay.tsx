"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Search, Filter, List, Map, Route, Calendar, Download,
  ChevronLeft, ChevronRight, X, CheckCircle2,
} from "lucide-react"
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorial-steps"

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Filter, List, Map, Route, Calendar, Download,
}

interface SpotlightOverlayProps {
  step: number
  onNext: () => void
  onSkip: () => void
  scheduledEventCount: number
}

export function SpotlightOverlay({ step, onNext, onSkip, scheduledEventCount }: SpotlightOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [rectTarget, setRectTarget] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const current: TutorialStep = TUTORIAL_STEPS[step]
  const isLast = step === TUTORIAL_STEPS.length - 1
  const hasScrolledRef = useRef(false)

  const isInteractive = current.requireInteraction ?? false
  const requiredCount = current.requiredScheduleCount ?? 0
  const interactionMet = !isInteractive || scheduledEventCount >= requiredCount

  // Track mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Reposition only (no scrollIntoView) — used for scroll/resize listeners
  const reposition = useCallback(() => {
    if (!hasScrolledRef.current) return
    const el = document.querySelector(`[data-onboarding="${current.target}"]`)
    if (el) {
      setRect(el.getBoundingClientRect())
      setRectTarget(current.target)
    }
  }, [current.target])

  // Initial measure + optional scrollIntoView — only called once per step
  useEffect(() => {
    hasScrolledRef.current = false
    const el = document.querySelector(`[data-onboarding="${current.target}"]`)
    if (!el) return

    if (current.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
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

  // Reposition on resize/scroll (no scrollIntoView)
  useEffect(() => {
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [reposition])

  // Reposition when the target element itself changes size
  useEffect(() => {
    const el = document.querySelector(`[data-onboarding="${current.target}"]`)
    if (!el) return
    const observer = new ResizeObserver(reposition)
    observer.observe(el)
    return () => observer.disconnect()
  }, [current.target, reposition])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "ArrowRight" || e.key === "Enter") && interactionMet) { e.preventDefault(); onNext() }
      else if (e.key === "Escape") { e.preventDefault(); onSkip() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onNext, onSkip, interactionMet])

  const ready = rect && rectTarget === current.target

  // On mobile, clamp the spotlight to the visible viewport so it doesn't extend off-screen
  const padding = 8
  const cutout = ready ? (() => {
    const vh = window.innerHeight
    const vw = window.innerWidth
    let top = rect.top - padding
    let left = rect.left - padding
    let width = rect.width + padding * 2
    let height = rect.height + padding * 2

    if (isMobile) {
      // Clamp to viewport bounds
      if (top < 0) { height += top; top = 0 }
      if (left < 0) { width += left; left = 0 }
      if (top + height > vh) height = vh - top
      if (left + width > vw) width = vw - left
    }

    return { top, left, width, height }
  })() : null

  const Icon = ICON_MAP[current.icon] ?? Search

  // On mobile, dock tooltip to bottom; on desktop, position relative to element
  const tooltipStyle: React.CSSProperties = ready
    ? isMobile
      ? {} // mobile uses bottom-docked layout via className
      : computeTooltipPosition(current.tooltipPosition, rect)
    : {}

  return (
    <>
      {/* Backdrop always renders — no flash between steps */}
      <div
        className="fixed inset-0 z-[2000]"
        style={{ pointerEvents: "none" }}
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
          className={`fixed z-[2002] ${
            isMobile
              ? "bottom-0 left-0 right-0 px-3 pb-3"
              : ""
          }`}
          style={{
            ...tooltipStyle,
            ...(isMobile ? {} : { width: "min(340px, 90vw)" }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className={`rounded-xl bg-white shadow-2xl ${isMobile ? "p-4" : "p-5"}`}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center rounded-lg bg-[var(--accent)]/15 ${isMobile ? "h-8 w-8" : "h-9 w-9"}`}>
                <Icon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-[var(--accent-foreground)]`} />
              </div>
              <h3 className={`font-bold text-[var(--primary)] ${isMobile ? "text-base" : "text-lg"}`}>{current.title}</h3>
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
          <p className={`mt-2 leading-relaxed text-[var(--muted-foreground)] ${isMobile ? "text-xs" : "text-sm"}`}>
            {current.description}
          </p>

          {/* Interactive counter */}
          {isInteractive && (
            <div className={`mt-2 flex items-center gap-2 font-medium ${isMobile ? "text-xs" : "text-sm"} ${
              interactionMet ? "text-green-600" : "text-[var(--primary)]"
            }`}>
              <CheckCircle2 className={`h-4 w-4 ${interactionMet ? "text-green-600" : "text-[var(--muted-foreground)]"}`} />
              Add {requiredCount} events to continue ({Math.min(scheduledEventCount, requiredCount)}/{requiredCount})
            </div>
          )}

          {/* Progress dots + Buttons row */}
          <div className={`${isMobile ? "mt-3" : "mt-4"} flex items-center justify-between`}>
            <div className="flex items-center gap-1.5">
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
            <div className="flex items-center gap-2">
              <button
                  onClick={onNext}
                  disabled={!interactionMet}
                  className={`flex items-center justify-center gap-1 rounded-lg text-sm font-semibold text-white transition-colors ${
                    isMobile ? "h-8 px-3" : "h-9 min-w-[44px] px-4"
                  } ${
                    interactionMet
                      ? "bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                      : "bg-[var(--primary)]/40 cursor-not-allowed"
                  }`}
                >
                  {isLast ? (
                    <>Finish</>
                  ) : (
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

function computeTooltipPosition(
  position: string,
  rect: DOMRect,
): React.CSSProperties {
  const gap = 12
  const tooltipWidth = Math.min(340, window.innerWidth * 0.9)
  const vw = window.innerWidth
  const vh = window.innerHeight

  const clampLeft = (left: number) => Math.max(8, Math.min(left, vw - tooltipWidth - 8))

  switch (position) {
    case "bottom": {
      const top = rect.bottom + gap
      // If tooltip would go off the bottom, place above instead
      if (top + 200 > vh) {
        return {
          top: Math.max(8, rect.top - gap - 200),
          left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
        }
      }
      return {
        top,
        left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
      }
    }
    case "top": {
      const top = rect.top - gap - 200
      // If tooltip would go off the top, place below instead
      if (top < 8) {
        return {
          top: rect.bottom + gap,
          left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
        }
      }
      return {
        top,
        left: clampLeft(rect.left + rect.width / 2 - tooltipWidth / 2),
      }
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
        top: Math.max(8, Math.min(rect.top + rect.height / 2 - 100, vh - 220)),
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
        top: Math.max(8, Math.min(rect.top + rect.height / 2 - 100, vh - 220)),
        left: availRight,
      }
    }
    default:
      return { top: rect.bottom + gap, left: clampLeft(rect.left) }
  }
}
