"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { hasSeenOnboarding, markOnboardingSeen } from "@/app/lib/cookies"
import { TUTORIAL_STEPS } from "./tutorial-steps"
import { WelcomeDialog } from "./welcome-dialog"
import { SpotlightOverlay } from "./spotlight-overlay"

type Phase = "checking" | "welcome" | "tutorial" | "done"

interface OnboardingContextValue {
  restart: () => void
}

const OnboardingContext = createContext<OnboardingContextValue>({ restart: () => {} })

export function useOnboarding() {
  return useContext(OnboardingContext)
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking")
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (hasSeenOnboarding()) {
      setPhase("done")
    } else {
      // Delay to let the page render (especially map tiles)
      const timer = setTimeout(() => setPhase("welcome"), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const finish = useCallback(() => {
    markOnboardingSeen()
    setPhase("done")
  }, [])

  const handleStart = useCallback(() => {
    setStep(0)
    setPhase("tutorial")
  }, [])

  const handleNext = useCallback(() => {
    setStep((s) => {
      if (s >= TUTORIAL_STEPS.length - 1) {
        finish()
        return s
      }
      return s + 1
    })
  }, [finish])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const restart = useCallback(() => {
    setStep(0)
    setPhase("welcome")
  }, [])

  return (
    <OnboardingContext.Provider value={{ restart }}>
      {children}
      {phase === "welcome" && (
        <WelcomeDialog onStart={handleStart} onSkip={finish} />
      )}
      {phase === "tutorial" && (
        <SpotlightOverlay
          step={step}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={finish}
        />
      )}
    </OnboardingContext.Provider>
  )
}
