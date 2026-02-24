const COOKIE_NAME = "pd_onboarding_seen"

export function hasSeenOnboarding(): boolean {
  if (typeof document === "undefined") return true // SSR-safe — assume seen to avoid hydration mismatch
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`))
}

export function markOnboardingSeen(): void {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Lax`
}
