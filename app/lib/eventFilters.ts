/** Picnic Day mock: inactive pills — light gray bg, navy text, thin border */
export const filterPillIdle =
  "rounded-full border border-[#D1D5DB] bg-[#F1F5F9] text-[#002D62] hover:bg-[#E8EEF4] hover:border-[#C4CCD6]"
/** Selected category / “All Events” — white + navy ring (not Recommended) */
export const filterPillCategoryOn =
  "rounded-full border-2 border-[#002D62] bg-white text-[#002D62] shadow-sm hover:bg-[#F8FAFC]"
/** Recommended selected — solid navy, white text */
export const filterPillRecommendedOn =
  "rounded-full border-2 border-[#002D62] bg-[#002D62] text-white hover:bg-[#00244d]"

export const EVENT_FILTER_CATEGORY_PILLS = [
  { id: "family", label: "Family Friendly" },
  { id: "animals", label: "Animals" },
  { id: "science", label: "STEM" },
  { id: "music", label: "Music" },
  { id: "creative", label: "Creative" },
  { id: "community", label: "Community" },
  { id: "services", label: "Services" },
] as const
