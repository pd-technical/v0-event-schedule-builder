import sync from "@/app/lib/db/syncEvents";
import "dotenv/config";

async function runSync() {
  // make a POST request to the sync endpoint with the secret in the authorization header
  // const res = await fetch("http://localhost:3000/api/admin/sync-events", {
  //   method: "POST",
  //   headers: {
  //     "authorization": `Bearer ${process.env.SYNC_SECRET}`,
  //   },
  // });

  // const text = await res.text();

  // console.log("Status:", res.status);
  // console.log("Response:", text);

  try {
    await sync();
    console.log("Events synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing events:", error);
    process.exit(1);
  }
}

runSync();
