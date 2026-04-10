import type { ScheduledEvent } from "@/app/page"

function to24Hour(time: string): { hours: number; minutes: number } | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3]?.toUpperCase()

  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0

  return { hours, minutes }
}

function formatIcsDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  )
}

export async function exportScheduleIcs(scheduledEvents: ScheduledEvent[]) {
  const today = new Date(2026, 3, 18)

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PicnicDay//Scheduler//EN",
  ]

  for (const event of scheduledEvents) {
    const start = to24Hour(event.startTime)
    const end = to24Hour(event.endTime || event.startTime)

    if (!start) continue

    const startDate = new Date(today)
    startDate.setHours(start.hours, start.minutes, 0, 0)

    const endDate = new Date(today)
    if (end) {
      endDate.setHours(end.hours, end.minutes, 0, 0)
      if (endDate <= startDate) {
        // assume it crosses midnight
        endDate.setDate(endDate.getDate() + 1)
      }
    } else {
      endDate.setHours(start.hours + 1, start.minutes, 0, 0)
    }

    const uid = `${event.id}@picnicday`

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${event.name.replace(/\n/g, " ")}`,
      `LOCATION:${event.location || "UC Davis"}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, " ")}` : "",
      "END:VEVENT"
    )
  }

  lines.push("END:VCALENDAR")

  const content = lines.filter(Boolean).join("\r\n")
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "picnic-day-schedule.ics"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
