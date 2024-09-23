import { createClient } from "@libsql/client";

const db = createClient({
  url: "file:./local.db",
  syncUrl: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 1000,
});

export default async function Home() {
  const syncStart = performance.now();
  await db.sync();
  const syncEnd = performance.now();
  const syncTime = syncEnd - syncStart;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Database Operations</h1>
      <p className="mb-2">Sync time: {syncTime.toFixed(2)} ms</p>
    </div>
  );
}

export const revalidate = 0;
