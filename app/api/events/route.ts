import { getEvents } from "@/app/lib/db/queries";

export async function GET() {
  try {
    const events = getEvents();
    return Response.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return new Response("Failed to fetch events", { status: 500 });
  }
}