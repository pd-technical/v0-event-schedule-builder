"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { hasSeenOnboarding, markOnboardingSeen } from "@/app/lib/cookies"
import { TUTORIAL_STEPS } from "./tutorial-steps"
import { WelcomeDialog } from "./welcome-dialog"
import { SpotlightOverlay } from "./spotlight-overlay"
import { PersonalizationDialog } from "./personalization-dialog"
import type { PersonalizationPillId } from "@/app/lib/personalizationInterests"

type Phase = "checking" | "welcome" | "tutorial" | "personalization" | "done"

interface OnboardingContextValue {
  restart: () => void
  openPersonalizationEditor: () => void
  closePersonalizationEditor: () => void
}

const OnboardingContext = createContext<OnboardingContextValue>({
  restart: () => {},
  openPersonalizationEditor: () => {},
  closePersonalizationEditor: () => {},
})

export function useOnboarding() {
  return useContext(OnboardingContext)
}

interface OnboardingProviderProps {
  children: ReactNode
  onResetSearch?: () => void
  onClearSchedule?: () => void
  onPersonalizationComplete?: (interestIds: PersonalizationPillId[]) => void
  scheduledEventCount?: number
}

export function OnboardingProvider({
  children,
  onResetSearch,
  onClearSchedule,
  onPersonalizationComplete,
  scheduledEventCount = 0,
}: OnboardingProviderProps) {
  const [phase, setPhase] = useState<Phase>("checking")
  const [step, setStep] = useState(0)
  const [isPersonalizationEditorOpen, setIsPersonalizationEditorOpen] = useState(false)

  const onResetSearchRef = useRef(onResetSearch)
  useEffect(() => {
    onResetSearchRef.current = onResetSearch
  }, [onResetSearch])

  const onClearScheduleRef = useRef(onClearSchedule)
  useEffect(() => {
    onClearScheduleRef.current = onClearSchedule
  }, [onClearSchedule])

  const onPersonalizationCompleteRef = useRef(onPersonalizationComplete)
  useEffect(() => {
    onPersonalizationCompleteRef.current = onPersonalizationComplete
  }, [onPersonalizationComplete])

  useEffect(() => {
    if (hasSeenOnboarding()) {
      setPhase("done")
    } else {
      const timer = setTimeout(() => setPhase("welcome"), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const finishSkipped = useCallback(() => {
    markOnboardingSeen()
    setPhase("done")
    setIsPersonalizationEditorOpen(false)
    onResetSearchRef.current?.()
    onClearScheduleRef.current?.()
  }, [])

  const finishPersonalized = useCallback(() => {
    markOnboardingSeen()
    setPhase("done")
    setIsPersonalizationEditorOpen(false)
    onResetSearchRef.current?.()
  }, [])

  const handleStart = useCallback(() => {
    setStep(0)
    setPhase("tutorial")
  }, [])

  const handleNext = useCallback(() => {
    if (step >= TUTORIAL_STEPS.length - 1) {
      setPhase("personalization")
    } else {
      setStep(step + 1)
    }
  }, [step])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const restart = useCallback(() => {
    setStep(0)
    setPhase("welcome")
    setIsPersonalizationEditorOpen(false)
  }, [])

  const openPersonalizationEditor = useCallback(() => {
    setIsPersonalizationEditorOpen(true)
  }, [])

  const closePersonalizationEditor = useCallback(() => {
    setIsPersonalizationEditorOpen(false)
  }, [])

  const handlePersonalized = useCallback((interestIds: PersonalizationPillId[]) => {
    onPersonalizationCompleteRef.current?.(interestIds)
    finishPersonalized()
  }, [finishPersonalized])

  return (
    <OnboardingContext.Provider
      value={{
        restart,
        openPersonalizationEditor,
        closePersonalizationEditor,
      }}
    >
      {children}

      {phase === "welcome" && (
        <WelcomeDialog onStart={handleStart} onSkip={finishSkipped} />
      )}

      {phase === "tutorial" && (
        <SpotlightOverlay
          step={step}
          onNext={handleNext}
          onSkip={finishSkipped}
          scheduledEventCount={scheduledEventCount}
        />
      )}

      {phase === "personalization" && (
        <PersonalizationDialog
          onPersonalized={handlePersonalized}
          onDismiss={finishSkipped}
        />
      )}

      {isPersonalizationEditorOpen && phase !== "personalization" && (
        <PersonalizationDialog
          onPersonalized={handlePersonalized}
          onDismiss={closePersonalizationEditor}
          saveLabel="Save interests"
        />
      )}
    </OnboardingContext.Provider>
  )
}