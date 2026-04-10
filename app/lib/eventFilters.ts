/** Unselected pill (mock: light gray, dark text) */
export const filterPillIdle =
  "rounded-full border border-[#cfd7e2] bg-[#eef2f7] text-[#334155] hover:bg-[#e4e9f0] hover:border-[#c5ced9]"
/** Category / “All events” selected — cream bar match, black text (not Recommended) */
export const filterPillCategoryOn =
  "rounded-full border border-[#f3e7c9] bg-[#f8f4e8] text-black hover:bg-[#f3ecd8] hover:border-[#e8dcc4]"
/** Recommended selected (mock: dark blue, white text) */
export const filterPillRecommendedOn =
  "rounded-full border border-primary bg-primary text-primary-foreground hover:bg-primary/90"

export const EVENT_FILTER_CATEGORY_PILLS = [
  { id: "family", label: "Family Friendly" },
  { id: "animals", label: "Animals" },
  { id: "science", label: "STEM" },
  { id: "music", label: "Music" },
  { id: "creative", label: "Creative" },
  { id: "food", label: "Food" },
  { id: "community", label: "Community" },
] as const
