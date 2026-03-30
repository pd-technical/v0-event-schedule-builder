"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

interface PersonalizationDialogProps {
  onComplete: () => void
}

export function PersonalizationDialog({ onComplete }: PersonalizationDialogProps) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/50 animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[2001] w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in-0 zoom-in-95"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={() => onComplete()}
        >
          {/* Icon */}
          <div className="mx-auto mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[var(--primary)]">
            <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-[var(--accent)]" />
          </div>

          {/* Text */}
          <Dialog.Title className="text-center text-xl sm:text-2xl font-bold text-[var(--primary)]">
            Personalize Your Experience
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Would you like personalized event recommendations based on your interests?
          </Dialog.Description>

          {/* Buttons */}
          <div className="mt-5 sm:mt-7 flex flex-col gap-2 sm:gap-3">
            <button
              onClick={() => {
                toast("Coming soon! We'll add personalization in a future update.")
                onComplete()
              }}
              className="w-full rounded-lg bg-[var(--primary)] px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-[var(--primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Yes, personalize
            </button>
            <button
              onClick={onComplete}
              className="w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              No thanks
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
