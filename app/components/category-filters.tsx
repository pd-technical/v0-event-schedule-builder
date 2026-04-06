"use client"

import { Dog, FlaskConical, Palette, Laugh, Music, Utensils, Users } from "lucide-react"

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
  },
  {
    id: "animals",
    label: "Animals",
    icon: Dog,
  },
  {
    id: "science",
    label: "STEM",
    icon: FlaskConical,
  },
  {
    id: "music",
    label: "Music",
    icon: Music,
  },
  {
    id: "creative",
    label: "Creative",
    icon: Palette,
  },
  {
    id: "food",
    label: "Food",
    icon: Utensils,
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
  },
]

export function CategoryFilters({
selectedCategories,
toggleCategory,
sortOption,
setSortOption,
}: CategoryFiltersProps) {
  return (
    <div className="min-w-0 w-full space-y-6 xl:w-44 xl:shrink-0">

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
        <div className="flex flex-wrap gap-2 pb-1 xl:flex-col xl:flex-nowrap xl:gap-2 xl:pb-0">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategories.includes(category.id)

            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  relative box-border flex min-w-0 items-start gap-3 rounded-lg border p-2
                  text-left transition-all duration-200 w-full sm:w-[calc(50%-0.25rem)] xl:w-full
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
