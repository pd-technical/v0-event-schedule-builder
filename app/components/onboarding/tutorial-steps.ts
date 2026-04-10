export interface TutorialStep {
  id: string
  target: string
  title: string
  description: string
  icon: string
  tooltipPosition: "bottom" | "top" | "left" | "right"
  scrollIntoView: boolean
  mobilePosition: "bottom" | "top"
  interactionHint?: string
  requireInteraction?: boolean
  requiredScheduleCount?: number
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "search",
    target: "search-section",
    title: "Search for Events",
    description: "Type something like 'music' or 'science' in the search bar to find Picnic Day events.",
    icon: "Search",
    tooltipPosition: "bottom",
    scrollIntoView: false,
    mobilePosition: "bottom",
    interactionHint: "Try clicking a pill or typing a keyword",
  },
  {
    id: "events",
    target: "event-list",
    title: "Build Your Schedule",
    description: "Tap any event to see details, then click + to add it to your schedule.",
    icon: "List",
    tooltipPosition: "right",
    scrollIntoView: false,
    mobilePosition: "bottom",
    requireInteraction: true,
    requiredScheduleCount: 2,
  },
  {
    id: "map-area",
    target: "map-area",
    title: "Campus Map & Schedule",
    description: "See where your events are on the campus map. Your schedule panel shows all added events with auto-generated walking routes between them.",
    icon: "Map",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
  {
    id: "export",
    target: "export-button",
    title: "Export Your Schedule",
    description: "Download a PDF or add to your calendar. Perfect for offline use on Picnic Day!",
    icon: "Download",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
]
