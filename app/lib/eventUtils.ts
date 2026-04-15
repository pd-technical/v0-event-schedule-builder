import type { Event, ScheduledEvent } from "@/app/page"

export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return Number.POSITIVE_INFINITY

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0

  return hours * 60 + minutes
}

export function compareEventsByTime(
  a: Event | ScheduledEvent,
  b: Event | ScheduledEvent
) {
  const startCompare = timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  if (startCompare !== 0) return startCompare
  return timeToMinutes(a.endTime) - timeToMinutes(b.endTime)
}

export function isFoodEvent(event: Event | ScheduledEvent) {
  return event.tags?.some((tag) => tag.toLowerCase().includes("food")) ?? false
}

export function isRestroom(event: Event | ScheduledEvent) {
  return event.tags?.some((tag) => tag.toLowerCase().includes("restroom")) ?? false
}

export const CATEGORY_TO_TAGS: Record<string, string[]> = {
  family: ["kids", "toddlers", "fun", "activities", "games"],
  animals: ["animals", "bugs", "insects", "pets"],
  science: ["science", "education", "tech", "engineering", "math"],
  music: ["music", "performance"],
  creative: ["art", "crafts"],
  food: ["food", "drink", "coffee"],
  community: ["cultural", "culture", "personal"],
  services: ["info", "information", "booth", "services", "accessibility"],
}



// Map category/location/tag combos to an icon + color
export function getCategoryIcon(event: Event | ScheduledEvent): { icon: string; color: string } {
  const name = event.name?.toLowerCase() ?? ""
  const category = event.category?.toLowerCase() ?? ""
  const tags = event.tags?.map(t => t.toLowerCase()) ?? []
  const location = event.location?.toLowerCase() ?? ""

  const has = (...terms: string[]) =>
    terms.some(t =>  tags.includes(t) || category.includes(t) || name.includes(t) || location.includes(t))

  // info booths
  if (name.includes("info booth") ||  tags.includes("services")) return { icon: "info", color: "#64748B" }
  // Location-based overrides first
  if (location.includes("horse barn"))     return { icon: "horse",     color: "#8B4513" }
  // if (location.includes("meyer hall"))     return { icon: "egg",       color: "#F59E0B" }
  if (location.includes("briggs"))         return { icon: "bug",       color: "#16A34A" }
  if (location.includes("giedt"))          return { icon: "cat",       color: "#7C3AED" }
  if (location.includes("hutchison") || location.includes("leaf")) return { icon: "leaf", color: "#15803D" }
  if (location.includes("cole facility")) return { icon: "sun",        color: "#F97316" }
  if (location.includes("academic surge") || location.includes("fish")) return { icon: "fish", color: "#0EA5E9" }
// Music & Entertainment 
  if (has("battle of the bands", "music", "band", "ensemble", "performance", "synth", "microphone", "show", "entertainment"))
    return { icon: "music", color: "#d1115e" } 

  // STEM & Engineering
  if (has("robot", "engineering", "tech", "ece", "autonomous", "ecocar", "civil engineer", "esdc", "cultivating"))
    return { icon: "robot", color: "#385ec1" } 

  // Plants, Agriculture & Entomology 
  if (has("tractor", "strawberry", "tomato", "plant", "cacao", "coffee", "popcorn", "soil", "pistachio", "weed", "viticulture", "enology", "water", "agri", "bug", "insect", "entomolog"))
    return { icon: "leaf", color: "#166534" } 

  // Animals & Wildlife 
  if (has("animal", "paw", "canine", "dog", "otter", "bat", "wildlife", "primate", "frisbee dog", "kitten"))
    return { icon: "paw", color: "#92400E" } 

  // Science, Lab & Weather 
  if (has("chemistry", "dna", "biotechnology", "laser", "microbe", "physics", "nutrition", "math", "stats", "science", "weather", "balloon", "climate"))
    return { icon: "flask", color: "#0891B2" } 

  // Arts, Crafts & Kids 
  if (has("art", "fashion show", "craft center", "visual journal", "paintbrush", "craft", "crafts", "slime", "scissor", "make", "children", "kids"))
    return { icon: "scissors", color: "#D97706" } 

  // Food 
  if (has("food", "sorbet", "liquid nitrogen", "drink", "coffee", "popcorn", "ice cream"))
    return { icon: "utensils", color: "#BE123C" } 

  // Informational / Community 
  if (has("admissions", "educational", "education", "alumni", "fire department", "vip", "lounge", "book", "talk", "cultural"))
    return { icon: "book", color: "#64748B" }

  // Fallback
  return { icon: "pin", color: "#64748B" }
}
