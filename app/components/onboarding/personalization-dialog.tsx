"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Sparkles, X } from "lucide-react"
import { useState, useCallback } from "react"
import { PERSONALIZATION_PILLS, type PersonalizationPillId } from "@/app/lib/personalizationInterests"

const MAX_PICKS = 3

interface PersonalizationDialogProps {
  /** Skip / no thanks / close — clears onboarding without personalization. */
  onDecline: () => void
  /** User picked exactly 3 interests and continued. */
  onPersonalized: (interestIds: PersonalizationPillId[]) => void
}

type Step = "choice" | "topics"

export function PersonalizationDialog({ onDecline, onPersonalized }: PersonalizationDialogProps) {
  const [step, setStep] = useState<Step>("choice")
  const [selected, setSelected] = useState<PersonalizationPillId[]>([])

  const togglePill = useCallback((id: PersonalizationPillId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_PICKS) return prev
      return [...prev, id]
    })
  }, [])

  const remaining = MAX_PICKS - selected.length
  const canContinue = selected.length === MAX_PICKS

  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/50 animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[2001] w-[min(520px,92vw)] max-h-[min(90vh,720px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 sm:p-8"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onDecline()
          }}
        >
          <button
            type="button"
            onClick={onDecline}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {step === "choice" ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary sm:mb-5 sm:h-20 sm:w-20">
                <Sparkles className="h-8 w-8 text-accent sm:h-9 sm:w-9" />
              </div>
              <Dialog.Title className="pr-10 text-center text-xl font-bold text-primary sm:text-2xl">
                Personalize Your Experience
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                Would you like personalized event recommendations based on your interests?
              </Dialog.Description>
              <div className="mt-6 flex flex-col gap-2 sm:mt-7 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep("topics")}
                  className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  Yes, personalize
                </button>
                <button
                  type="button"
                  onClick={onDecline}
                  className="w-full rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                >
                  No thanks
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent sm:mb-4 sm:h-14 sm:w-14">
                <Sparkles className="h-6 w-6 text-accent-foreground sm:h-7 sm:w-7" />
              </div>
              <Dialog.Title className="text-center text-xl font-bold text-foreground sm:text-2xl">
                Select 3 categories
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
                We&apos;ll show events that fit your interests and add a few to your schedule to
                get you started.
              </Dialog.Description>

              <div className="mt-6 flex flex-wrap gap-2">
                {PERSONALIZATION_PILLS.map((pill) => {
                  const isOn = selected.includes(pill.id)
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => togglePill(pill.id)}
                      className={`
                        rounded-full border px-3.5 py-2 text-sm font-medium transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2
                        ${
                          isOn
                            ? "border-primary bg-secondary text-primary shadow-sm"
                            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/60"
                        }
                      `}
                    >
                      {pill.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => onPersonalized(selected)}
                  className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-border disabled:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  {canContinue
                    ? "Continue"
                    : remaining === MAX_PICKS
                      ? `Select ${MAX_PICKS} to continue`
                      : `Select ${remaining} more to continue`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected([])
                    setStep("choice")
                  }}
                  className="text-center text-sm font-medium text-muted-foreground hover:text-primary hover:underline"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
