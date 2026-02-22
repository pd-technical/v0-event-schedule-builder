import { supabase } from "@/app/lib/supabaseClient";
import type { Event } from "@/app/page";

export async function getEvents(): Promise<Event[]> {
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
    "SUPABASE KEY present:",
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase
        .from("events")
        .select(`
                id, 
                name, 
                description, 
                start_time, end_time, 
                category, 
                location_details,
                location_id, 
                showtime,
                locations (
                    name,
                    latitude,
                    longitude
                ),
                event_tags (
                    tags (
                        id,
                        name
                    )
                )
            `)
        .order("name", { ascending: true });

    if (error) {
        console.error("Supabase error object:", error);
        console.error("message:", error.message);
        console.error("details:", error.details);
        console.error("hint:", error.hint);
        console.error("code:", error.code);
        return [];
        }


    console.log("RAW supabase data:", data);
    console.log("FIRST ROW FULL:", data?.[0]);
    console.log("FIRST ROW event_tags:", data?.[0]?.event_tags);

    const mapped = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        startTime: row.start_time,
        endTime: row.end_time,
        location: row.locations?.name || " ", // Use the joined location name or fallback
        lat: row.locations?.latitude || 0,
        lng: row.locations?.longitude || 0,
        location_details: row.location_details || " ", 
        category: row.category,
        showtime: row.showtime,
        tags: row.event_tags?.map((et: any) => et.tags.name) || [],
    }));

    const sorted = mapped.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { 
            sensitivity: "base",
            ignorePunctuation: true,
        })
    );

    return sorted;
}