"use client"

import { Search, Clock, X } from "lucide-react"
import { useMemo, useState } from "react"
import type { Event } from "@/app/page"

interface SearchSectionProps {
  events: Event[]
  searchHistory: string[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: "browse" | "popular" | "nearby"
  setActiveTab: (tab: "browse" | "popular" | "nearby") => void
  onSearchSubmit: (value?: string) => void
  clearSearchHistory: () => void
}

const tabs = [
  { id: "browse" as const, label: "Browse All" },
  { id: "popular" as const, label: "Popular" },
  { id: "nearby" as const, label: "Near Me" },
]

export function SearchSection({ 
  events,
  searchHistory,
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  onSearchSubmit,
  clearSearchHistory
}: SearchSectionProps) {
  const dropdownItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    // If typing → show live event matches
    if (q) {
      return []
    }

    // If empty → show recent searches
    return searchHistory.slice(0, 5).map((term) => ({
      type: "history" as const,
      label: term
    }))
  }, [searchQuery, events, searchHistory])

  const [isFocused, setIsFocused] = useState(false)
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearchSubmit(searchQuery)
          }}
          className="flex w-full"
        >
          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Search for events..."
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />


          {/* Blue Submit Button */}
          <button
            type="submit"
            className="px-5 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {isFocused && dropdownItems.length > 0 && (
          <div className="absolute z-30 mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Recent Searches
              </span>

              <div className="flex items-center gap-3">
                {/* Clear Button */}
                <button
                  type="button"
                  onClick={clearSearchHistory}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>

                {/* Close X */}
                <button
                  type="button"
                  onClick={() => setIsFocused(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {dropdownItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={() => {
                  setSearchQuery(item.label)
                  onSearchSubmit(item.label)
                  setIsFocused(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}


      </div>
    {/* 
      // {Quick Search Tags}
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
      </div> */}
    </div>
  )
}