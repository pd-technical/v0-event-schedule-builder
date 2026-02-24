"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { MapPin, Sparkles } from "lucide-react"

interface WelcomeDialogProps {
  onStart: () => void
  onSkip: () => void
}

export function WelcomeDialog({ onStart, onSkip }: WelcomeDialogProps) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/50 animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[2001] w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-8 shadow-2xl animate-in fade-in-0 zoom-in-95"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={() => onSkip()}
        >
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]">
            <div className="relative">
              <MapPin className="h-9 w-9 text-[var(--accent)]" />
              <Sparkles className="absolute -right-3 -top-3 h-5 w-5 text-[var(--accent)]" />
            </div>
          </div>

          {/* Text */}
          <Dialog.Title className="text-center text-2xl font-bold text-[var(--primary)]">
            Welcome to Picnic Day!
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-[var(--muted-foreground)] leading-relaxed">
            Let us show you around — it only takes a moment. We&apos;ll walk you through searching events, building your schedule, and more.
          </Dialog.Description>

          {/* Buttons */}
          <div className="mt-7 flex flex-col gap-3">
            <button
              onClick={onStart}
              className="w-full rounded-lg bg-[var(--primary)] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Start Tutorial
            </button>
            <button
              onClick={onSkip}
              className="w-full rounded-lg px-5 py-3 text-base font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Skip, I&apos;ll explore on my own
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
