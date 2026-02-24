export interface TutorialStep {
  id: string
  target: string
  title: string
  description: string
  icon: string
  tooltipPosition: "bottom" | "top" | "left" | "right"
  scrollIntoView: boolean
  mobilePosition: "bottom" | "top"
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "search",
    target: "search-section",
    title: "Search for Events",
    description: "Search by name, keyword, or category to find Picnic Day events you're interested in.",
    icon: "Search",
    tooltipPosition: "bottom",
    scrollIntoView: false,
    mobilePosition: "bottom",
  },
  {
    id: "filters",
    target: "category-filters",
    title: "Filter & Sort",
    description: "Narrow results by category or sort by time to plan your day efficiently.",
    icon: "Filter",
    tooltipPosition: "bottom",
    scrollIntoView: false,
    mobilePosition: "bottom",
  },
  {
    id: "events",
    target: "event-list",
    title: "Browse Events",
    description: "Explore the full list of events. Tap the + button to add any event to your personal schedule.",
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
    description: "Drag events to reorder, tap X to remove. Time conflict warnings keep your day on track.",
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
