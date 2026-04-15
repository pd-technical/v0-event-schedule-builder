"use client"

import { Pencil } from "lucide-react"
import {
  EVENT_FILTER_CATEGORY_PILLS,
  filterPillCategoryOn,
  filterPillIdle,
  filterPillRecommendedOn,
} from "@/app/lib/eventFilters"
import { SortDropdown, type SortOption } from "@/app/components/sort-dropdown"

interface FilterSectionProps {
  activeFeedTab: "recommended" | "all"
  setActiveFeedTab: (tab: "recommended" | "all") => void
  selectedInterestLabels: string[]
  onEditRecommended?: () => void
  onShowAll?: () => void
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  onSelectRecommended: () => void
  recommendedActive: boolean
  selectedSort?: SortOption
  setSelectedSort?: (sort: SortOption) => void
  mobile?: boolean
}

const DESKTOP_FILTER_BY_PILL_TEXT =
  "px-3 py-1.5 text-xs font-semibold leading-tight transition-colors"

const MOBILE_FILTER_BY_PILL_TEXT =
  "whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-tight transition-colors"

export function FilterSection({
  activeFeedTab,
  setActiveFeedTab,
  selectedInterestLabels,
  onEditRecommended,
  onShowAll,
  selectedCategories,
  toggleCategory,
  onSelectRecommended,
  recommendedActive,
  selectedSort = "relevance",
  setSelectedSort,
  mobile = false,
}: FilterSectionProps) {
  const allEventsActive = activeFeedTab === "all"
  const pillText = mobile
    ? MOBILE_FILTER_BY_PILL_TEXT
    : DESKTOP_FILTER_BY_PILL_TEXT

  return (
    <>
      {activeFeedTab === "recommended" && (
        <div className="mt-5 rounded-xl bg-[#FEF9E7] px-4 py-3.5 ring-1 ring-[#F3E5AB]/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-[#002D62]">
                Showing events for your interests:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {selectedInterestLabels.length > 0 ? (
                  <span className="text-sm italic text-[#002D62]">
                    {selectedInterestLabels.join(", ")}
                  </span>
                ) : (
                  <span className="text-sm italic text-[#64748B]">
                    Complete personalization to load your recommended picks.
                  </span>
                )}
                {onEditRecommended && (
                  <button
                    type="button"
                    onClick={onEditRecommended}
                    className="inline-flex shrink-0 rounded-md p-1 text-[#5c4033] hover:bg-black/[0.06]"
                    aria-label="Edit recommended interests"
                    title="Edit recommended interests"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
            {onShowAll && (
              <button
                type="button"
                onClick={onShowAll}
                className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#002D62] hover:underline"
              >
                SHOW ALL
              </button>
            )}
          </div>
        </div>
      )}


      <div
        data-onboarding="category-filters"
        className={
          mobile
            ? "mt-5 overflow-visible"
            : "mt-6 flex flex-wrap items-start gap-x-3 gap-y-2"
        }
      >
        {mobile ? (
          <>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#123E7C]">
              FILTER BY
            </h3>

            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={onSelectRecommended}
                className={`shrink-0 ${pillText} ${recommendedActive
                    ? "bg-[#123E7C] text-white shadow-sm"
                    : "bg-[#A9C0DE] text-white"
                  }`}
              >
                Recommended
              </button>

              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className={`shrink-0 ${pillText} ${allEventsActive
                    ? "bg-[#123E7C] text-white shadow-sm"
                    : "bg-[#A9C0DE] text-white"
                  }`}
              >
                All
              </button>

              {EVENT_FILTER_CATEGORY_PILLS.map((category) => {
                const isSelected = selectedCategories.includes(category.id)

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`shrink-0 ${pillText} ${isSelected ? filterPillCategoryOn : filterPillIdle
                      }`}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>

            {setSelectedSort && (
              <SortDropdown
                mobile
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
              />
            )}
          </>
        ) : (
          <>
            <h3 className="shrink-0 pt-2 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#123E7C]">
              FILTER BY
            </h3>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center rounded-full border border-[#C8D8EA] bg-[#DCE8F5] p-[2px]">
                <button
                  type="button"
                  onClick={onSelectRecommended}
                  className={`${DESKTOP_FILTER_BY_PILL_TEXT} rounded-full ${recommendedActive
                    ? "bg-[#123E7C] text-white"
                    : "bg-transparent text-[#5B6B84] hover:text-[#123E7C]"
                    }`}
                >
                  Recommended
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeedTab("all")}
                  className={`${DESKTOP_FILTER_BY_PILL_TEXT} rounded-full ${allEventsActive
                    ? "bg-[#123E7C] text-white"
                    : "bg-transparent text-[#5B6B84] hover:text-[#123E7C]"
                    }`}
                >
                  All
                </button>
              </div>

              {EVENT_FILTER_CATEGORY_PILLS.map((category) => {
                const isSelected = selectedCategories.includes(category.id)

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`${pillText} ${isSelected ? filterPillCategoryOn : filterPillIdle
                      }`}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {selectedCategories.length} filter
            {selectedCategories.length !== 1 ? "s" : ""} active
          </span>

          <button
            type="button"
            onClick={() => selectedCategories.forEach(toggleCategory)}
            className="font-semibold text-[#002D62] transition hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </>
  )
}