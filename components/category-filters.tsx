"use client"

import { Dog, FlaskConical, Leaf, Star, Music, Utensils } from "lucide-react"

interface CategoryFiltersProps {
  selectedCategories: string[]
  toggleCategory: (category: string) => void
}

const categories = [
  { 
    id: "featured", 
    label: "Featured Events", 
    icon: Star,
    description: "Don't miss highlights"
  },
  { 
    id: "animals", 
    label: "Animals & Pets", 
    icon: Dog,
    description: "Furry friends & demos"
  },
  { 
    id: "science", 
    label: "Science & Tech", 
    icon: FlaskConical,
    description: "Labs & experiments"
  },
  { 
    id: "nature", 
    label: "Nature & Gardens", 
    icon: Leaf,
    description: "Plants & insects"
  },
  { 
    id: "arts", 
    label: "Arts & Music", 
    icon: Music,
    description: "Performances & shows"
  },
  { 
    id: "food", 
    label: "Food & Drinks", 
    icon: Utensils,
    description: "Vendors & tastings"
  },
]

export function CategoryFilters({ selectedCategories, toggleCategory }: CategoryFiltersProps) {
  return (
    <div className="w-full lg:w-48 lg:flex-shrink-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Categories
      </h3>

      {/* Mobile/tablet: horizontal scroll; Large: vertical stack */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 lg:flex-col lg:overflow-visible lg:mx-0 lg:pb-0 lg:space-y-1">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategories.includes(category.id)

          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left flex-shrink-0 w-[180px] lg:w-full ${
                isSelected
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
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
          className="w-full mt-3 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
