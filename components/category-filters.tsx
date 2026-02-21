"use client"

import { Dog, FlaskConical, Leaf, Star, Music, Utensils } from "lucide-react"

interface CategoryFiltersProps {
  selectedCategories: string[]
  toggleCategory: (category: string) => void
}

const categories = [
  { id: "featured", label: "Featured", icon: Star },
  { id: "animals", label: "Animals", icon: Dog },
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "nature", label: "Nature", icon: Leaf },
  { id: "arts", label: "Arts & Music", icon: Music },
  { id: "food", label: "Food", icon: Utensils },
]

export function CategoryFilters({ selectedCategories, toggleCategory }: CategoryFiltersProps) {
  return (
    <div className="w-full mb-2">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategories.includes(category.id)
            //px-3 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full hover:bg-accent/30 transition-colors
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`flex items-center gap-2 px-1.75 py-1 rounded-full font-medium text-xs transition-all whitespace-nowrap flex-shrink-4  ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  // : "bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground "
                  : "bg-accent/20 text-accent-foreground border-accent hover:bg-accent/30 transition-colors"
              }`}
            >
              <Icon className="w-3 h-3" />
              {category.label}
            </button>
          )
        })}
        
        {selectedCategories.length > 0 && (
          <button
            onClick={() => selectedCategories.forEach(toggleCategory)}
            className="flex items-center gap-2 px-1.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0 "
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}