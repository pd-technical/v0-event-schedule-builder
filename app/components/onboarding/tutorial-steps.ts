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
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "search",
    target: "search-section",
    title: "Search for Events",
    description: "Click one of the yellow pills below, or type something like 'music' to search for Picnic Day events.",
    icon: "Search",
    tooltipPosition: "bottom",
    scrollIntoView: false,
    mobilePosition: "bottom",
    interactionHint: "Try clicking a pill or typing a keyword",
  },
  {
    id: "sort",
    target: "sort-section",
    title: "Sort Events",
    description: "Use the Sort By dropdown to order events by time and plan your day from start to finish.",
    icon: "Filter",
    tooltipPosition: "bottom",
    scrollIntoView: false,
    mobilePosition: "bottom",
  },
  {
    id: "categories",
    target: "category-filters",
    title: "Categories",
    description: "Narrow results by category to find events that match your interests. Click a category pill to filter.",
    icon: "Filter",
    tooltipPosition: "right",
    scrollIntoView: false,
    mobilePosition: "bottom",
    interactionHint: "Click a category to filter events",
  },
  {
    id: "events",
    target: "event-list",
    title: "Browse Events",
    description: "Tap any event to expand its details, then click + to add it to your schedule.",
    icon: "List",
    tooltipPosition: "right",
    scrollIntoView: false,
    mobilePosition: "bottom",
  },
  {
    id: "map",
    target: "campus-map",
    title: "Campus Map",
    description: "See where events are located on campus. Navy dots show events you've scheduled.",
    icon: "Map",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
  {
    id: "routing",
    target: "campus-map",
    title: "Walking Routes",
    description: "Auto-generated walking paths connect your scheduled events so you never get lost.",
    icon: "Route",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
  {
    id: "schedule",
    target: "schedule-panel",
    title: "My Schedule",
    description: "Drag events to reorder, tap X to remove. Tap an event to expand its details. Time conflict warnings keep your day on track.",
    icon: "Calendar",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
  {
    id: "export",
    target: "schedule-panel",
    title: "Export Your Schedule",
    description: "Download a PDF with your full schedule and campus map — perfect for offline use on Picnic Day!",
    icon: "Download",
    tooltipPosition: "left",
    scrollIntoView: true,
    mobilePosition: "top",
  },
]
