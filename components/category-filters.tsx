"use client"

import { Dog, FlaskConical, Leaf, Star, Music, Utensils, Truck, Users, Baby } from "lucide-react"

interface CategoryFiltersProps {
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  locationFeatures?: string[]
}

// Event categories
const eventCategories = [
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

// Location-based features (from your data)
const featureCategories = [
  {
    id: "food_trucks",
    label: "Food Trucks",
    icon: Truck,
    description: "Food truck locations"
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Music,
    description: "Stages & performances"
  },
  {
    id: "student_org_fair",
    label: "Student Orgs",
    icon: Users,
    description: "SOF booths"
  },
  {
    id: "childrens_fair",
    label: "Kids Activities",
    icon: Baby,
    description: "Children's Discovery Fair"
  },
]

export function CategoryFilters({ selectedCategories, toggleCategory, locationFeatures = [] }: CategoryFiltersProps) {
  // Show feature categories only if they exist in the database
  const availableFeatures = featureCategories.filter(f => locationFeatures.includes(f.id))
  
  return (
    <div className="flex-shrink-0 w-4/12 max-h-[520px] overflow-y-auto pr-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Event Types
      </h3>
      
      <div className="space-y-1">
        {eventCategories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategories.includes(category.id)
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`w-full flex items-start gap-3 p-2.5 rounded-lg border transition-all text-left ${
                isSelected
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`} />
              <div>
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {category.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {availableFeatures.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-5">
            Locations
          </h3>
          
          <div className="space-y-1">
            {availableFeatures.map((feature) => {
              const Icon = feature.icon
              const isSelected = selectedCategories.includes(feature.id)
              
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleCategory(feature.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "bg-accent/30 border-accent/50 text-foreground"
                      : "bg-card border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isSelected ? "text-accent" : "text-muted-foreground"
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{feature.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {selectedCategories.length > 0 && (
        <button
          onClick={() => selectedCategories.forEach(toggleCategory)}
          className="w-full mt-4 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
