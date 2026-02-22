export function formatTimeRange(startTime: string, endTime: string) {
    if (startTime === "00:00:00" && endTime === "00:00:00") {
      return "All Day"
    }
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  const date = new Date()
  date.setHours(hours)
  date.setMinutes(minutes)

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}