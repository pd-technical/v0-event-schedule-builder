  "use client"

  import { Dog, FlaskConical, Leaf, Puzzle, Music, Utensils } from "lucide-react"

  interface CategoryFiltersProps {
    selectedCategories: string[]
    toggleCategory: (category: string) => void
    sortOption: "alphabetical" | "time"
    setSortOption: (option: "alphabetical" | "time") => void
  }

  const categories = [
    { 
      id: "family", 
      label: "Family Friendly", 
      icon: Puzzle,
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
      icon: Leaf,
    },
    { 
      id: "arts", 
      label: "Art", 
      icon: Music,
    },
    { 
      id: "food", 
      label: "Food", 
      icon: Utensils,
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

      {/* HEADER */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Filters
        </h3>

        <select
          value={sortOption}
          onChange={(e) =>
            setSortOption(e.target.value as "alphabetical" | "time")
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
          <option value="alphabetical">Relevance</option>
          <option value="time">Time</option>
        </select>

        {/* Active badge */}
        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-semibold text-primary">
                {selectedCategories.length} active
              </span>
            </div>

            <button
              onClick={() => selectedCategories.forEach(toggleCategory)}
              className="
                text-[11px] font-medium
                text-muted-foreground
                hover:text-pink-500
                transition
              "
            >
              Clear
            </button>
          </div>
        )}
      </div>

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
                relative flex items-start gap-3 p-3 rounded-xl border
                transition-all duration-200 text-left
                flex-shrink-0 w-auto min-w-[170px] xl:w-full
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
    </div>
  )
}
