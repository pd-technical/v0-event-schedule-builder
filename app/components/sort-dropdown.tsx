"use client"

import { useEffect, useRef, useState } from "react"

export type SortOption = "relevance" | "earliest" | "az"

interface SortDropdownProps {
  selectedSort: SortOption
  setSelectedSort: (sort: SortOption) => void
  mobile?: boolean
}

export function SortDropdown({
  selectedSort,
  setSelectedSort,
  mobile = false,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getSortLabel = () => {
    if (selectedSort === "earliest") return "Earliest"
    if (selectedSort === "az") return "A–Z"
    return "Relevance"
  }

  const handleSortSelect = (sort: SortOption) => {
    setSelectedSort(sort)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menu = (
    <div
      className={`absolute z-[200] overflow-hidden border bg-white ${mobile
          ? "left-0 right-0 top-[calc(100%-1px)] rounded-b-[12px] rounded-t-none border-[#D7E2EE] shadow-[0_10px_24px_rgba(2,40,81,0.12)]"
          : "right-0 top-[calc(100%-1px)] w-[220px] rounded-lg border-[#D6E0EB] shadow-[0_14px_30px_rgba(2,40,81,0.14)]"
        }`}
    >
      <button
        type="button"
        onClick={() => handleSortSelect("relevance")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${selectedSort === "relevance"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
          }`}
      >
        <span>Relevance</span>
      </button>

      <div className="h-px bg-[#E3ECF5]" />

      <button
        type="button"
        onClick={() => handleSortSelect("earliest")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${selectedSort === "earliest"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
          }`}
      >
        <span>Earliest</span>
      </button>

      <div className="h-px bg-[#E3ECF5]" />

      <button
        type="button"
        onClick={() => handleSortSelect("az")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${selectedSort === "az"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
          }`}
      >
        <span>A–Z</span>
      </button>
    </div>
  )

  if (mobile) {
    return (
      <div ref={containerRef} className="relative mt-3 overflow-visible">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full border border-[#D7E2EE] bg-white px-3 py-2 text-left text-sm font-medium text-[#163A70] shadow-[0_2px_8px_rgba(2,40,81,0.06)] transition hover:bg-[#F8FAFC] ${isOpen ? "rounded-t-[10px] rounded-b-none" : "rounded-[10px]"
            }`}
        >
          <div className="flex items-center justify-between">
            <span>{getSortLabel()}</span>
            <span className="text-xs text-[#5B6B84]">{isOpen ? "▲" : "▼"}</span>
          </div>
        </button>

        {isOpen && menu}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative hidden md:block overflow-visible">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex h-10 min-w-[190px] items-center justify-between border bg-white px-3.5 text-sm font-medium text-[#163A70] shadow-[0_2px_8px_rgba(2,40,81,0.06)] transition hover:bg-[#F8FAFC] ${isOpen
            ? "rounded-t-[10px] rounded-b-none border-[#D7E2EE]"
            : "rounded-[10px] border-[#D7E2EE]"
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{getSortLabel()}</span>
        <span className="ml-3 text-xs text-[#5B6B84]">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%-1px)] z-[200] w-full min-w-[190px] overflow-hidden rounded-b-[10px] rounded-t-none border border-[#D7E2EE] bg-white shadow-[0_10px_24px_rgba(2,40,81,0.12)]">
          <button
            type="button"
            onClick={() => handleSortSelect("relevance")}
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${selectedSort === "relevance"
                ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
                : "text-[#163A70] hover:bg-[#F1F6FC]"
              }`}
          >
            <span>Relevance</span>
          </button>

          <div className="h-px bg-[#E3ECF5]" />

          <button
            type="button"
            onClick={() => handleSortSelect("earliest")}
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${selectedSort === "earliest"
                ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
                : "text-[#163A70] hover:bg-[#F1F6FC]"
              }`}
          >
            <span>Earliest</span>
          </button>

          <div className="h-px bg-[#E3ECF5]" />

          <button
            type="button"
            onClick={() => handleSortSelect("az")}
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${selectedSort === "az"
                ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
                : "text-[#163A70] hover:bg-[#F1F6FC]"
              }`}
          >
            <span>A–Z</span>
          </button>
        </div>
      )}
    </div>
  )
}