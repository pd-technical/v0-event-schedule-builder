import type { Event } from "@/app/page";

export async function getEvents(): Promise<Event[]> {
    try {
        const res = await fetch("/api/events");

        if (!res.ok) {
            throw new Error("Failed to fetch events");
        }

        const data = await res.json();

        const mapped = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            startTime: row.start_time,
            endTime: row.end_time,
            location: row.location?.name || "",
            lat: row.location?.latitude || 0,
            lng: row.location?.longitude || 0,
            location_details: row.location_detail || "",
            category: row.category || "",
            showtime: row.showtime || "",
            tags: row.tags || [],
        }));

        const sorted = mapped.sort((a: Event, b: Event) =>
           a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
                ignorePunctuation: true,
            })
        )
        return sorted;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}