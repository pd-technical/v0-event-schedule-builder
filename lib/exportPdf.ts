import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { ScheduledEvent } from "@/app/page"

export async function exportSchedulePdf(scheduledEvents: ScheduledEvent[]) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // --- Header ---
  pdf.setFillColor(2, 40, 81) // UC Davis navy #022851
  pdf.rect(0, 0, pageWidth, 28, "F")
  pdf.setTextColor(218, 170, 0) // UC Davis gold #daaa00
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("UC Davis Picnic Day", margin, 14)
  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(255, 255, 255)
  pdf.text("My Event Schedule", margin, 22)
  y = 36

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
        ignoreElements: (el) => el.classList.contains("leaflet-control-container"),
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
    pdf.text(`${event.startTime} – ${event.endTime}  |  ${event.location}`, margin + 9, y)
    y += 5

    // Description (truncated)
    if (event.description) {
      const desc = event.description.length > 120
        ? event.description.slice(0, 120) + "..."
        : event.description
      pdf.setFontSize(8)
      const descLines = pdf.splitTextToSize(desc, contentWidth - 12)
      pdf.text(descLines, margin + 9, y)
      y += descLines.length * 3.5 + 2
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
