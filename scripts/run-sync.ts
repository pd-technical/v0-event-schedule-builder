import "dotenv/config";

async function runSync() {
  // make a POST request to the sync endpoint with the secret in the authorization header
  const res = await fetch("http://localhost:3000/api/admin/sync-events", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${process.env.SYNC_SECRET}`,
    },
  });

  const text = await res.text();

  console.log("Status:", res.status);
  console.log("Response:", text);
}

runSync();