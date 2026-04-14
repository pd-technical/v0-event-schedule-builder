"use client";

import { useState } from "react";
import {
  X,
  AlertTriangle,
  Calendar,
  Download,
  ChevronUp,
  ChevronDown,
  Loader2,
  FileText,
  CalendarClock,
  MoreHorizontal,
} from "lucide-react";
import type { ScheduledEvent } from "@/app/page";

interface SchedulePanelProps {
  scheduledEvents: ScheduledEvent[];
  removeFromSchedule: (eventId: string) => void;
  reorderSchedule: (fromIndex: number, toIndex: number) => void;
  onExportPdf: () => void;
  onExportIcs: () => void;
  isExporting: boolean;
}

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let h = hours;
  if (period === "PM" && hours !== 12) h += 12;
  if (period === "AM" && hours === 12) h = 0;
  return h * 60 + minutes;
}

function isOutOfOrder(events: ScheduledEvent[], index: number): boolean {
  if (index === 0) return false;
  const currentTime = parseTime(events[index].startTime);
  const prevTime = parseTime(events[index - 1].startTime);
  return currentTime < prevTime;
}

export function SchedulePanel({
  scheduledEvents,
  removeFromSchedule,
  reorderSchedule,
  onExportPdf,
  onExportIcs,
  isExporting,
}: SchedulePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex >= 0 && toIndex < scheduledEvents.length) {
      reorderSchedule(fromIndex, toIndex);
    }
  };

  return (
    <div
      data-onboarding="schedule-panel"
      className={`w-full bg-card border border-border rounded-lg shadow-lg transition-all lg:absolute lg:left-auto lg:right-4 lg:top-4 lg:bottom-auto lg:w-72 lg:z-[1000] ${isCollapsed ? "h-auto" : "h-[300px] lg:max-h-[440px]"
        }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-border cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">My Schedule</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
            {scheduledEvents.length}
          </span>
        </div>
        <ChevronUp
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          {scheduledEvents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No events added yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click + on events to add them
              </p>
            </div>
          ) : (
            <div className="p-2 h-[200px] overflow-y-auto lg:max-h-[300px]">
              {scheduledEvents.map((event, index) => {
                const outOfOrder = isOutOfOrder(scheduledEvents, index);

                return (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-2 p-2 rounded-lg mb-1 transition-colors bg-secondary/50 hover:bg-secondary"
                  >
                    {/* Reorder buttons → bare chevrons */}
                    <div
                      className="flex shrink-0 flex-col items-center justify-center gap-0 pt-0.5"
                      role="group"
                      aria-label="Reorder in schedule"
                    >
                      <button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        aria-label={`Move "${event.name}" up`}
                        className="text-muted-foreground/50 hover:text-primary transition-colors disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ChevronUp className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === scheduledEvents.length - 1}
                        aria-label={`Move "${event.name}" down`}
                        className="text-muted-foreground/50 hover:text-primary transition-colors disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                    </div>

                    {/* Index Number */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </div>

                    {/* Event Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === event.id ? null : event.id)
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium text-foreground ${
                            expandedId === event.id ? "" : "line-clamp-2"
                          }`}
                        >
                          {event.name}
                        </p>
                        <MoreHorizontal
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${
                            expandedId === event.id
                              ? "text-primary"
                              : "text-muted-foreground/50"
                          }`}
                        />
                      </div>

                      <p className="text-[10px] text-muted-foreground">
                        {(event.startTime)} · {event.location}
                        {event.location_details && (
                          <> — {event.location_details}</>
                        )}
                      </p>

                      {expandedId === event.id && event.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-snug">
                          {event.description}
                        </p>
                      )}

                      {outOfOrder && (
                        <div className="flex items-center gap-1 mt-1 text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[10px] font-medium">
                            Time conflict with previous event
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromSchedule(event.id)}
                      className="flex-shrink-0 p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {scheduledEvents.length > 0 && (
            <div data-onboarding="export-button" className="p-3 border-t border-border relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Exporting..." : "Export Schedule"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showExportMenu && (
                <div data-onboarding-include className="absolute left-3 right-3 mt-2 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportPdf();
                    }}
                    disabled={isExporting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-60"
                  >
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportIcs();
                    }}
                    disabled={isExporting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-60"
                  >
                    <CalendarClock className="w-4 h-4" />
                    Export as iCal (.ics)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
