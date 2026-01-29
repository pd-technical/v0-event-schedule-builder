"use client"

import { Search, TrendingUp, MapPin, LayoutGrid } from "lucide-react"

interface SearchSectionProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: "browse" | "popular" | "nearby"
  setActiveTab: (tab: "browse" | "popular" | "nearby") => void
  hasScheduledEvents?: boolean
}

const tabs = [
  { id: "browse" as const, label: "Browse All", icon: LayoutGrid },
  { id: "popular" as const, label: "Popular", icon: TrendingUp },
  { id: "nearby" as const, label: "Near Me", icon: MapPin },
]

export function SearchSection({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  hasScheduledEvents = false
}: SearchSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isDisabled = tab.id === "nearby" && !hasScheduledEvents
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : isDisabled
                    ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
              title={isDisabled ? "Add events to your schedule first" : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Description */}
      <p className="text-xs text-muted-foreground mb-3">
        {activeTab === "browse" && "Showing all events"}
        {activeTab === "popular" && "Sorted by most added to schedules"}
        {activeTab === "nearby" && (hasScheduledEvents 
          ? "Sorted by distance from your selected/last scheduled event" 
          : "Add events to your schedule to see nearby options"
        )}
      </p>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for events, locations, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["doxie derby", "chemistry", "animals", "music"].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag)}
            className="px-3 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full hover:bg-accent/30 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
