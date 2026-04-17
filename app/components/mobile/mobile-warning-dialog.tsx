import * as Dialog from "@radix-ui/react-dialog"
import { Monitor } from "lucide-react"

// ─── Mobile Warning Dialog ────────────────────────────────────────────────────

export function MobileWarningDialog({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/50 animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[2001] w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 sm:p-8"
          onPointerDownOutside={onDismiss}
          onEscapeKeyDown={onDismiss}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent sm:mb-4 sm:h-14 sm:w-14">
            <Monitor className="h-6 w-6 text-accent-foreground sm:h-7 sm:w-7" />
          </div>

          <Dialog.Title className="text-center text-xl font-bold text-foreground sm:text-2xl">
            Best on a larger screen
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
            This experience is optimized for desktop or tablet. You're welcome to continue on mobile, but some features may be easier to use on a bigger screen.
          </Dialog.Description>

          <div className="mt-6 sm:mt-8">
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Got it, continue anyway
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
