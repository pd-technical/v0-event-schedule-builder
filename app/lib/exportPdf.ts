import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { ScheduledEvent } from "@/app/page"

function compactTime(time: string): string {
  // Handle already-formatted times like "10:00 AM" or "1:30 PM"
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return time

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3]

  if (period) {
    // Already in 12-hour format
    const p = period.toLowerCase()
    return minutes === 0 ? `${hours}${p}` : `${hours}:${String(minutes).padStart(2, "0")}${p}`
  }

  // 24-hour format fallback
  const p = hours >= 12 ? "pm" : "am"
  const h = hours % 12 || 12
  return minutes === 0 ? `${h}${p}` : `${h}:${String(minutes).padStart(2, "0")}${p}`
}

export async function exportSchedulePdf(scheduledEvents: ScheduledEvent[]) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // --- Header image + title ---
  try {
    const response = await fetch("/picnic-letterhead.png")
    const blob = await response.blob()
    const imgData: string = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })

    const img = new Image()
    img.src = imgData
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(null)
      img.onerror = reject
    })
    const aspectRatio = img.height / img.width || 0.28
    const imgWidth = pageWidth
    const imgHeight = imgWidth * aspectRatio
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    y = imgHeight + 8
  } catch (err) {
    console.warn("Could not load letterhead image:", err)
    y = margin
  }

  // Title below header image
  pdf.setTextColor(2, 40, 81) // UC Davis navy #022851
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("My Event Schedule", margin, y)
  y += 12

  // --- Map capture ---
  const mapContainer = document.querySelector(".leaflet-container") as HTMLElement | null
  if (mapContainer) {
    // Wait for route lines to finish rendering on canvas
    await new Promise(resolve => setTimeout(resolve, 800))
    try {
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 2,
        ignoreElements: (el) =>
          el.classList.contains("leaflet-control-container") ||
          el.classList.contains("leaflet-tooltip"),
      })
      const imgData = canvas.toDataURL("image/png")
      const aspectRatio = canvas.height / canvas.width
      const imgWidth = contentWidth
      const imgHeight = imgWidth * aspectRatio

      pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight)
      y += imgHeight + 8
    } catch (err) {
      console.warn("Could not capture map for PDF:", err)
    }
  }

  // --- Schedule list ---
  pdf.setTextColor(2, 40, 81)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Schedule", margin, y)
  y += 8

  for (let i = 0; i < scheduledEvents.length; i++) {
    const event = scheduledEvents[i]

    // Check if we need a new page
    if (y > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage()
      y = margin
    }

    // Number circle + event name
    pdf.setFillColor(2, 40, 81)
    pdf.circle(margin + 3, y - 1.5, 3, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.text(String(i + 1), margin + 3, y - 0.5, { align: "center" })

    pdf.setTextColor(2, 40, 81)
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    const name = pdf.splitTextToSize(event.name, contentWidth - 12)
    pdf.text(name, margin + 9, y)
    y += name.length * 5

    // Time & location
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 100, 100)
    pdf.text(`${compactTime(event.startTime)} – ${compactTime(event.endTime)}  |  ${event.location}`, margin + 9, y)
    y += 5

    // Description (truncated)
    if (event.description) {
      pdf.setFontSize(8)
      const descLines: string[] = pdf.splitTextToSize(event.description, contentWidth - 12)
      for (const line of descLines) {
        if (y > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin + 9, y)
        y += 3.5
      }
      y += 2
    }

    y += 4
  }

  // --- Footer ---
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.setFontSize(7)
  pdf.setTextColor(150, 150, 150)
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()} • ${scheduledEvents.length} events`,
    margin,
    pageHeight - 8
  )

  pdf.save("picnic-day-schedule.pdf")
}
