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
      className={`absolute top-[calc(100%+8px)] z-[200] overflow-hidden rounded-[18px] border border-[#C9D7E6] bg-[#F8FBFF] shadow-[0_16px_40px_rgba(2,40,81,0.18)] ring-1 ring-[#E6EEF8] ${
        mobile ? "left-0 right-0" : "right-0 w-[220px]"
      }`}
    >
      <button
        type="button"
        onClick={() => handleSortSelect("relevance")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${
          selectedSort === "relevance"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
        }`}
      >
        <span>Relevance</span>
        {selectedSort === "relevance" && (
          <span className="text-xs font-semibold text-[#123E7C]">
            Selected
          </span>
        )}
      </button>

      <div className="h-px bg-[#E3ECF5]" />

      <button
        type="button"
        onClick={() => handleSortSelect("earliest")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${
          selectedSort === "earliest"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
        }`}
      >
        <span>Earliest</span>
        {selectedSort === "earliest" && (
          <span className="text-xs font-semibold text-[#123E7C]">
            Selected
          </span>
        )}
      </button>

      <div className="h-px bg-[#E3ECF5]" />

      <button
        type="button"
        onClick={() => handleSortSelect("az")}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${
          selectedSort === "az"
            ? "bg-[#E8F1FB] font-semibold text-[#123E7C]"
            : "text-[#163A70] hover:bg-[#F1F6FC]"
        }`}
      >
        <span>A–Z</span>
        {selectedSort === "az" && (
          <span className="text-xs font-semibold text-[#123E7C]">
            Selected
          </span>
        )}
      </button>
    </div>
  )

  if (mobile) {
    return (
      <div ref={containerRef} className="relative mt-3 overflow-visible">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-semibold text-[#163A70] shadow-sm transition hover:bg-[#F8FAFC]"
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
  <div ref={containerRef} className="relative hidden md:block">
    <button
      type="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className={`inline-flex h-10 min-w-[190px] items-center justify-between rounded-lg border px-3.5 text-sm text-[#163A70] transition ${
        isOpen
          ? "border-[#9DB7D3] bg-white shadow-[0_6px_18px_rgba(2,40,81,0.10)]"
          : "border-[#D6E0EB] bg-[#F3F7FB] hover:border-[#BDD0E3] hover:bg-[#F8FBFF]"
      }`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span className="font-medium text-[#163A70]">
        {getSortLabel()}
      </span>

      <span className="ml-3 text-xs text-[#5B6B84]">{isOpen ? "▲" : "▼"}</span>
    </button>

    {isOpen && (
      <div className="absolute right-0 top-[calc(100%-1px)] z-[200] w-[220px] overflow-hidden rounded-lg border border-[#D6E0EB] bg-white shadow-[0_14px_30px_rgba(2,40,81,0.14)]">
        <button
          type="button"
          onClick={() => handleSortSelect("relevance")}
          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
            selectedSort === "relevance"
              ? "bg-[#EDF4FB] font-semibold text-[#123E7C]"
              : "text-[#163A70] hover:bg-[#F6FAFD]"
          }`}
        >
          <span>Relevance</span>
          {selectedSort === "relevance" && (
            <span className="text-xs font-semibold text-[#123E7C]">
              Selected
            </span>
          )}
        </button>

        <div className="h-px bg-[#E7EEF5]" />

        <button
          type="button"
          onClick={() => handleSortSelect("earliest")}
          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
            selectedSort === "earliest"
              ? "bg-[#EDF4FB] font-semibold text-[#123E7C]"
              : "text-[#163A70] hover:bg-[#F6FAFD]"
          }`}
        >
          <span>Earliest</span>
          {selectedSort === "earliest" && (
            <span className="text-xs font-semibold text-[#123E7C]">
              Selected
            </span>
          )}
        </button>

        <div className="h-px bg-[#E7EEF5]" />

        <button
          type="button"
          onClick={() => handleSortSelect("az")}
          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
            selectedSort === "az"
              ? "bg-[#EDF4FB] font-semibold text-[#123E7C]"
              : "text-[#163A70] hover:bg-[#F6FAFD]"
          }`}
        >
          <span>A–Z</span>
          {selectedSort === "az" && (
            <span className="text-xs font-semibold text-[#123E7C]">
              Selected
            </span>
          )}
        </button>
      </div>
    )}
  </div>
)
}