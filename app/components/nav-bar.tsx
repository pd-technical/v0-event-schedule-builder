"use client"

import { Search, ChevronRight } from "lucide-react"

const navItems = [
  { label: "Home", hasDropdown: false },
  { label: "About", hasDropdown: true },
  { label: "Give to Picnic Day", hasDropdown: true },
  { label: "Safe Celebrations", hasDropdown: true },
  { label: "Plan Your Visit", hasDropdown: true },
  { label: "FAQs", hasDropdown: false },
  { label: "Find an Event", hasDropdown: false, active: true },
  { label: "Get Involved", hasDropdown: false },
]

export function NavBar() {
  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-[1100]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-12 md:h-14 min-h-12">
          {/* Nav Items - scroll horizontally on small screens */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 rounded ${
                  item.active ? "bg-white/10" : ""
                }`}
              >
                {item.label}
                {item.hasDropdown && <ChevronRight className="w-3 h-3 rotate-90" />}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-white/10 rounded transition-colors">
              Quick Links
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
