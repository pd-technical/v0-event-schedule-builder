  "use client"

  import { Dog, FlaskConical, Leaf, Puzzle, Music, Utensils } from "lucide-react"

  interface CategoryFiltersProps {
    selectedCategories: string[]
    toggleCategory: (category: string) => void
  }

  const categories = [
    { 
      id: "fun", 
      label: "Fun and Games", 
      icon: Puzzle,
      description: "Games, crafts, & more",
    },
    { 
      id: "animals", 
      label: "Animals & Pets", 
      icon: Dog,
      description: "Furry friends & demos",
    },
    { 
      id: "science", 
      label: "Science & Tech", 
      icon: FlaskConical,
      description: "Labs & experiments",
    },
    { 
      id: "nature", 
      label: "Nature & Gardens", 
      icon: Leaf,
      description: "Plants & insects",
    },
    { 
      id: "arts", 
      label: "Arts & Music", 
      icon: Music,
      description: "Performances & shows",
    },
    { 
      id: "food", 
      label: "Food & Drinks", 
      icon: Utensils,
      description: "Vendors & tastings",
    },
  ]

  const categoryAccents: Record<string, string> = {
    fun: "#ec4899",   // pink
    animals: "#e8b04a",                   // soft warm gold
    science: "#1fa2c9",                   // cyan (already in chart-4)  
    nature: "#4fa36b",                    // soft natural green
    arts: "#7b6bd6",                      // muted violet
    food: "#d46a4f",                      // warm coral
  }
  
  export function CategoryFilters({ selectedCategories, toggleCategory }: CategoryFiltersProps) {
    return (
      <div className="w-full xl:w-48 xl:flex-shrink-0">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-4">
          Categories
        </h3>

        {/* Mobile: horizontal scroll; Desktop: vertical stack */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 xl:flex-col xl:gap-2 xl:space-y-0 xl:overflow-visible xl:mx-0 xl:pb-0">
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
                  flex-shrink-0 w-auto min-w-[160px] xl:w-full
                  bg-white border-border
                  hover:bg-[var(--color-secondary)]
                  ${isSelected ? "shadow-sm" : ""}
                `}
                style={{
                  borderLeft: `4px solid ${categoryAccents[category.id]}`,
                  backgroundColor: isSelected
                    ? `${categoryAccents[category.id]}15`
                    : undefined,
                }}
              >
                <Icon
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{
                    color: categoryAccents[category.id],
                  }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{category.label}</div>
                  <div className="text-xs text-primary mt-0.5">
                    {category.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {selectedCategories.length > 0 && (
          <button
            onClick={() => selectedCategories.forEach(toggleCategory)}
            className="
              w-full mt-4 px-3 py-2 text-xs font-semibold
              text-[var(--color-accent)]
              hover:text-[var(--color-primary)]
              transition-colors
            "
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }
