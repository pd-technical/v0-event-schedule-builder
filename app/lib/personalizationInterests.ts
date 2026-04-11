import type { Event } from "@/app/page"

/** Interest chips shown after “Yes, personalize” in onboarding (matches your sketch). */
export const PERSONALIZATION_PILLS = [
  { id: "dogs", label: "dogs", terms: ["dog", "dogs", "doxie", "dachshund", "canine", "puppy", "pet", "wiener"] },
  { id: "slime", label: "slime", terms: ["slime", "sticky", "ooze"] },
  { id: "crafts", label: "crafts", terms: ["craft", "crafts", "art", "make", "diy", "hands-on"] },
  { id: "dance", label: "dance", terms: ["dance", "dancing", "ballet", "movement"] },
  { id: "robots", label: "robots", terms: ["robot", "robots", "stem", "engineering", "tech", "coding", "lego"] },
  { id: "coffee", label: "coffee", terms: ["coffee", "cafe", "espresso", "tasting", "brew"] },
  { id: "printmaking", label: "printmaking", terms: ["print", "printing", "ink", "screen", "press"] },
  { id: "cockroaches", label: "cockroaches", terms: ["cockroach", "roach", "cockroach racing"] },
  { id: "bands", label: "bands", terms: ["band", "bands", "music", "jazz", "orchestra", "chorus", "concert"] },
  { id: "bats", label: "bats", terms: ["bat", "bats", "wildlife"] },
  { id: "chocolate", label: "chocolate", terms: ["chocolate", "cocoa", "candy", "sweet"] },
  { id: "bugs", label: "bugs", terms: ["bug", "bugs", "insect", "insects", "glow"] },
  { id: "entomology", label: "entomology", terms: ["entomology", "insect", "insects", "beetle"] },
  { id: "math", label: "math", terms: ["math", "mathematics", "puzzle", "numbers", "geometry"] },
  { id: "racecars", label: "racecars", terms: ["race", "racing", "car", "cars", "vehicle", "derby", "motor"] },
] as const

export type PersonalizationPillId = (typeof PERSONALIZATION_PILLS)[number]["id"]

const PILL_BY_ID = new Map(PERSONALIZATION_PILLS.map((p) => [p.id, p]))

/**
 * Each pill maps to a Picnic Day event by matching these phrases against `event.name` (case-insensitive).
 * Order matters: first match wins.
 */
const HARDCODED_NAME_PHRASES: Record<PersonalizationPillId, string[]> = {
  dogs: ["doxie derby"],
  slime: ["slime time"],
  crafts: [],
  dance: ["dance revolution"],
  robots: ["sound following robot", "sound following robots"],
  coffee: ["see, smell, touch", "coffee: see", "coffee: see, smell"],
  printmaking: ["archaeology", "printmaking"],
  cockroaches: ["cockroach racing"],
  bands: ["battle of the bands"],
  bats: ["bit about bats"],
  chocolate: ["bean to bar"],
  bugs: ["glowing insect", "glowing insects"],
  entomology: ["entomology at uc davis", "entomology at uc", "entomology"],
  math: ["adventure in math", "math and stats"],
  racecars: ["autonomous line following", "line following racecar", "line following racecars"],
}

function nameIncludes(name: string, phrase: string): boolean {
  return name.toLowerCase().includes(phrase.toLowerCase())
}

/** Pick the canonical event for one interest chip (hardcoded names). */
export function findHardcodedEventForPill(
  events: Event[],
  pillId: PersonalizationPillId
): Event | null {
  if (pillId === "crafts") {
    const openHouseCraft = events.find(
      (e) =>
        nameIncludes(e.name, "open house") &&
        (nameIncludes(e.name, "craft") || nameIncludes(e.location, "craft"))
    )
    if (openHouseCraft) return openHouseCraft
    const craftCenter = events.find(
      (e) => nameIncludes(e.name, "craft center") || nameIncludes(e.location, "craft center")
    )
    if (craftCenter) return craftCenter
  }

  const phrases = HARDCODED_NAME_PHRASES[pillId]
  for (const phrase of phrases) {
    const found = events.find((e) => nameIncludes(e.name, phrase))
    if (found) return found
  }
  return null
}

/** One event per selected pill, in selection order (deduped by id). */
export function eventsForHardcodedPersonalizationPicks(
  events: Event[],
  pillIds: PersonalizationPillId[]
): Event[] {
  const out: Event[] = []
  const seen = new Set<string>()
  for (const id of pillIds) {
    const ev = findHardcodedEventForPill(events, id)
    if (ev && !seen.has(ev.id)) {
      seen.add(ev.id)
      out.push(ev)
    }
  }
  return out
}

function scoreTermInHaystack(hay: string, term: string, event: Event): number {
  const t = term.toLowerCase()
  if (!t || !hay.includes(t)) return 0
  const name = event.name.toLowerCase()
  if (name.includes(t)) return 10
  if ((event.tags || []).some((tag) => tag.toLowerCase().includes(t))) return 6
  if (event.category?.toLowerCase().includes(t)) return 5
  if (event.location?.toLowerCase().includes(t)) return 4
  return 2
}

/** How well one event matches one interest (higher = better). */
export function scoreEventForPill(event: Event, pillId: string): number {
  const pill = PILL_BY_ID.get(pillId as PersonalizationPillId)
  if (!pill) return 0
  const hay = [
    event.name,
    event.description,
    event.location,
    event.category,
    ...(event.tags || []),
  ]
    .join(" ")
    .toLowerCase()
  let sum = 0
  for (const term of pill.terms) {
    sum += scoreTermInHaystack(hay, term, event)
  }
  return sum
}

/** Sum of scores across the user’s chosen interests (usually 3). */
export function scoreEventForInterests(event: Event, interestIds: string[]): number {
  let total = 0
  for (const id of interestIds) {
    total += scoreEventForPill(event, id)
  }
  return total
}

/**
 * Hardcoded matches for the user’s picks first, then everything else by interest score, then name.
 */
export function orderEventsByPersonalization(
  events: Event[],
  interestIds: PersonalizationPillId[]
): Event[] {
  if (interestIds.length === 0) return [...events]

  const hardcoded = eventsForHardcodedPersonalizationPicks(events, interestIds)
  const seen = new Set(hardcoded.map((e) => e.id))

  const rest = events.filter((e) => !seen.has(e.id))
  const scored = rest.map((e) => ({
    event: e,
    score: scoreEventForInterests(e, interestIds),
  }))
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.event.name.localeCompare(b.event.name, undefined, { sensitivity: "base" })
  })

  return [...hardcoded, ...scored.map((s) => s.event)]
}

/** First N events after personalization ordering (for generic “top picks” use cases). */
export function topEventsForPersonalization(
  events: Event[],
  interestIds: PersonalizationPillId[],
  n: number
): Event[] {
  return orderEventsByPersonalization(events, interestIds).slice(0, n)
}
