"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Sparkles, X } from "lucide-react"
import { useState, useCallback } from "react"
import { PERSONALIZATION_PILLS, type PersonalizationPillId } from "@/app/lib/personalizationInterests"

const MAX_PICKS = 3

interface PersonalizationDialogProps {
  /** User picked exactly 3 interests and continued. */
  onPersonalized: (interestIds: PersonalizationPillId[]) => void
  initialSelected?: PersonalizationPillId[]
  onDismiss?: () => void
  saveLabel?: string
}

export function PersonalizationDialog({
  onPersonalized,
  initialSelected,
  onDismiss,
  saveLabel = "Personalize",
}: PersonalizationDialogProps) {
  const [selected, setSelected] = useState<PersonalizationPillId[]>(initialSelected ?? [])

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
          onPointerDownOutside={(e) => {
            if (!onDismiss) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (onDismiss) {
              onDismiss()
            } else {
              e.preventDefault()
            }
          }}
        >
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close personalization editor"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent sm:mb-4 sm:h-14 sm:w-14">
            <Sparkles className="h-6 w-6 text-accent-foreground sm:h-7 sm:w-7" />
          </div>
          <Dialog.Title className="text-center text-xl font-bold text-foreground sm:text-2xl">
            What do you want to see?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
            Select 3 interests to see recommended events first. You can always edit these or view all events by toggling the filters.          </Dialog.Description>

          <p className="mt-5 text-center text-sm font-medium text-foreground" aria-live="polite">
            {selected.length} / {MAX_PICKS} selected
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PERSONALIZATION_PILLS.map((pill) => {
              const isOn = selected.includes(pill.id)
              const isLockedOut = !isOn && selected.length >= MAX_PICKS
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => togglePill(pill.id)}
                  disabled={isLockedOut}
                  className={`
                    rounded-full border px-3.5 py-2 text-sm font-medium transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-55
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
                ? saveLabel
                : remaining === MAX_PICKS
                  ? `Select ${MAX_PICKS} to continue`
                  : `Select ${remaining} more to continue`}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              You can tap a category again to swap it out.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
