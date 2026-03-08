import sync from "@/app/lib/db/syncEvents";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await sync();
    return new Response("Events synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing events:", error);
    return new Response("Failed to synchronize events", { status: 500 });
  }
}
