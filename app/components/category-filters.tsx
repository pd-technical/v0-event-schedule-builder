"use client"

import { Dog, FlaskConical, Palette, Laugh, Music, Utensils } from "lucide-react"

interface CategoryFiltersProps {
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  sortOption: "relevance" | "alphabetical" | "time"
  setSortOption: (option: "relevance" | "alphabetical" | "time") => void
}

const categories = [
  {
    id: "family",
    label: "Family Friendly",
    icon: Laugh,
    color: "#f59e0b", // amber
  },
  {
    id: "animals",
    label: "Animals",
    icon: Dog,
    color: "#8b5cf6", // violet
  },
  {
    id: "science",
    label: "STEM",
    icon: FlaskConical,
    color: "#ef4444", // red
  },
  {
    id: "music",
    label: "Music",
    icon: Music,
    color: "#3b82f6", // blue
  },
  {
    id: "arts",
    label: "Art",
    icon: Palette,
    color: "#ec4899", // pink
  },
  {
    id: "food",
    label: "Food",
    icon: Utensils,
    color: "#10b981", // emerald
  },
]

export function CategoryFilters({
selectedCategories,
toggleCategory,
sortOption,
setSortOption,
}: CategoryFiltersProps) {
  return (
    <div className="w-full xl:w-44 xl:flex-shrink-0 space-y-6">

      {/* SORT BY */}
      <div data-onboarding="sort-section" className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          SORT BY
        </h3>

        <select
          value={sortOption}
          onChange={(e) =>
            setSortOption(e.target.value as "relevance" | "alphabetical" | "time")
          }
          className="
            w-full
            text-xs
            px-3 py-2
            rounded-md
            border border-border
            bg-transparent
            text-muted-foreground
            hover:border-primary
            focus:outline-none
            focus:ring-1 focus:ring-primary
            transition
          "
        >
          <option value="relevance">Relevance</option>
          <option value="time">Time</option>
          <option value="alphabetical">Alphabetical</option>
        </select>

      </div>
      <div data-onboarding="category-filters">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          FILTER BY
        </h3>
        {/* CATEGORY LIST */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1
                        xl:flex-col xl:gap-2 xl:overflow-visible xl:mx-0 xl:pb-0">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategories.includes(category.id)

            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  relative flex items-start gap-3 p-2 rounded-lg border
                  transition-all duration-200 text-left flex-shrink-0 w-auto min-w-[170px] xl:w-full
                  border-border
                  hover:bg-pink-500/5
                  ${isSelected
                    ? "bg-pink-500/10 border-pink-500/50 shadow-sm"
                    : ""
                  }
                `}
                style={{
                  borderLeft: "4px solid #ec4899",
                }}
                >
                <Icon
                   className="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-500"

                />

                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {category.label}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {/* Active badge */}
        {selectedCategories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              {selectedCategories.length} filter{selectedCategories.length !== 1 && "s"} active
            </span>

            <button
              onClick={() => selectedCategories.forEach(toggleCategory)}
              className="font-medium hover:text-pink-500 transition"
            >
              Clear all
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
