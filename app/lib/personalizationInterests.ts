import type { Event } from "@/app/page"

//Interest chips shown after “Yes, personalize” in onboarding
export const PERSONALIZATION_PILLS = [
  { id: "dogs", label: "dogs", terms: ["dog", "dogs", "doxie", "dachshund", "canine", "puppy", "pet"] },
  { id: "slime", label: "slime", terms: ["slime", "sticky", "ooze"] },
  { id: "crafts", label: "crafts", terms: ["craft", "crafts", "art", "make", "diy", "hands-on"] },
  { id: "dance", label: "dance", terms: ["dance", "dancing", "ballet", "movement"] },
  { id: "robots", label: "robots", terms: ["robot", "robots", "stem", "engineering", "tech", "coding", "lego"] },
  { id: "coffee", label: "coffee", terms: ["coffee", "cafe", "espresso", "tasting", "brew"] },
  { id: "anthropology", label: "anthropology", terms: ["cave", "rock"] },
  { id: "cockroaches", label: "cockroaches", terms: ["cockroach", "roach", "cockroach racing"] },
  { id: "bands", label: "bands", terms: ["band", "bands", "music", "jazz", "orchestra", "chorus", "concert"] },
  { id: "bats", label: "bats", terms: ["bat", "bats", "wildlife"] },
  { id: "chocolate", label: "chocolate", terms: ["cacao"] },
  { id: "bugs", label: "bugs", terms: ["bug", "bugs", "insect", "insects", "glow"] },
  { id: "horses", label: "horses", terms: ["polo club", "horses"] },
  { id: "math", label: "math", terms: ["math", "mathematics", "puzzle", "numbers", "geometry"] },
  { id: "racecars", label: "racecars", terms: ["race", "racing", "car", "cars", "vehicle", "derby", "motor"] },
] as const

export type PersonalizationPillId = (typeof PERSONALIZATION_PILLS)[number]["id"]

const PILL_BY_ID = new Map(PERSONALIZATION_PILLS.map((p) => [p.id, p]))

const HARDCODED_NAME_PHRASES: Record<PersonalizationPillId, string[]> = {
  dogs: ["Doxie Derby"],
  slime: ["AIChE Slime Time"],
  crafts: ["Beaded Friendship Bracelets"],
  dance: ["Freeze Dance"],
  robots: ["Remote-controlled robotic arm"],
  coffee: ["coffee: see, smell, touch, & taste"],
  anthropology: ["Cave & Rock Art of California!"],
  cockroaches: ["cockroach racing"],
  bands: ["video game orchestra"],
  bats: ["bats"],
  chocolate: ["building a cacao collection in davis"],
  bugs: ["glowing insect", "glowing insects"],
  horses: ["Polo Demo: Aggie Polo Club at UC Davis"],
  math: ["adventure in math", "math and stats"],
  racecars: ["autonomous line following", "line following racecar", "line following racecars"],
}

function nameIncludes(text: string, phrase: string): boolean {
  if (!phrase) return false
  return text.toLowerCase().includes(phrase.toLowerCase())
}

function hardcodedEventForPill(events: Event[], pillId: PersonalizationPillId): Event | null {
  for (const phrase of HARDCODED_NAME_PHRASES[pillId]) {
    const found = events.find((e) => nameIncludes(e.name, phrase))
    if (found) return found
  }
  return null
}

// How well `event` matches any of the selected interests (higher = better). */
function matchScore(event: Event, interestIds: PersonalizationPillId[]): number {
  const hay = [
    event.name,
    event.description,
    event.location,
    event.category,
    ...(event.tags || []),
  ]
    .join(" ")
    .toLowerCase()

  let total = 0
  for (const id of interestIds) {
    const pill = PILL_BY_ID.get(id)
    if (!pill) continue
    for (const term of pill.terms) {
      const t = term.toLowerCase()
      if (!t || !hay.includes(t)) continue
      const name = event.name.toLowerCase()
      if (name.includes(t)) total += 10
      else if ((event.tags || []).some((tag) => tag.toLowerCase().includes(t))) total += 6
      else if (event.category?.toLowerCase().includes(t)) total += 5
      else if (event.location?.toLowerCase().includes(t)) total += 4
      else total += 2
    }
  }
  return total
}

/**
 * Order: one hardcoded pick per selected pill (deduped, in pill order), then other events by match score, then name.
 * Returns the first `n` events (used for recommended list + schedule seed).
 */
export function topEventsForPersonalization(
  events: Event[],
  interestIds: PersonalizationPillId[],
  n: number
): Event[] {
  if (interestIds.length === 0) return events.slice(0, n)

  const hardcoded: Event[] = []
  const seen = new Set<string>()
  for (const id of interestIds) {
    const ev = hardcodedEventForPill(events, id)
    if (ev && !seen.has(ev.id)) {
      seen.add(ev.id)
      hardcoded.push(ev)
    }
  }

  const rest = events.filter((e) => !seen.has(e.id))
  rest.sort((a, b) => {
    const ds = matchScore(b, interestIds) - matchScore(a, interestIds)
    if (ds !== 0) return ds
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  })

  return [...hardcoded, ...rest].slice(0, n)
}
