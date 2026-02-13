"use client"

import { Search } from "lucide-react"

interface SearchSectionProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: "browse" | "popular" | "nearby"
  setActiveTab: (tab: "browse" | "popular" | "nearby") => void
}

const tabs = [
  { id: "browse" as const, label: "Browse All" },
  { id: "popular" as const, label: "Popular" },
  { id: "nearby" as const, label: "Near Me" },
]

export function SearchSection({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab 
}: SearchSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
      <div className="flex flex-wrap gap-2 mt-5 mb-1">
        {["children's discovery fair", "entertainment", "student organization fair", "exhibits", "animal events", "food"].map((tag) => (
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
