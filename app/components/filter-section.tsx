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
  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold leading-tight transition-colors"

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
  selectedSort = "popular",
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
        <div
          className={
            mobile
              ? "mt-4 rounded-[20px] border border-[#F0B429] bg-[#FFF7D8] px-4 py-3.5"
              : "mt-5 rounded-xl bg-[#FEF9E7] px-4 py-3.5 ring-1 ring-[#F3E5AB]/80"
          }
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#9A4B12]">
                Showing events for your interests:
              </p>

              <div className="mt-2 flex min-w-0 items-start gap-2">
                {selectedInterestLabels.length > 0 ? (
                  <span className="min-w-0 flex-1 text-[15px] font-semibold text-[#9A4B12]">
                    {selectedInterestLabels.join(", ")}
                  </span>
                ) : (
                  <span className="min-w-0 flex-1 text-sm text-[#64748B]">
                    Complete personalization to load your recommended picks.
                  </span>
                )}

                {onEditRecommended && (
                  <button
                    type="button"
                    onClick={onEditRecommended}
                    className="ml-auto inline-flex shrink-0 self-start rounded-md p-1.5 text-[#9A4B12] hover:bg-black/[0.04]"
                    aria-label="Edit recommended interests"
                    title="Edit recommended interests"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
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
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6B84]">
              FILTER BY
            </h3>

            <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={onSelectRecommended}
                className={`${pillText} ${
                  recommendedActive ? filterPillRecommendedOn : filterPillIdle
                }`}
              >
                Recommended
              </button>

              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className={`${pillText} ${
                  allEventsActive ? filterPillCategoryOn : filterPillIdle
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
                    className={`${pillText} ${
                      isSelected ? filterPillCategoryOn : filterPillIdle
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
            <h3 className="shrink-0 pt-2 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-[#64748B]">
              FILTER BY
            </h3>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onSelectRecommended}
                className={`${pillText} ${
                  recommendedActive ? filterPillRecommendedOn : filterPillIdle
                }`}
              >
                Recommended
              </button>

              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className={`${pillText} ${
                  allEventsActive ? filterPillCategoryOn : filterPillIdle
                }`}
              >
                All Events
              </button>

              {EVENT_FILTER_CATEGORY_PILLS.map((category) => {
                const isSelected = selectedCategories.includes(category.id)

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`${pillText} ${
                      isSelected ? filterPillCategoryOn : filterPillIdle
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