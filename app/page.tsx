import { createClient } from "@libsql/client";
import { revalidatePath } from "next/cache";

const remoteDb = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const embeddedDb = createClient({
  url: "file:./local.db",
  syncUrl: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 1000,
});

async function insertMessage(formData: FormData) {
  "use server";
  const client = formData.get("client") as string;
  const db = client === "remote" ? remoteDb : embeddedDb;

  const sender = `User${Math.floor(Math.random() * 100) + 1}`;
  const recipient = `User${Math.floor(Math.random() * 100) + 1}`;
  const messageText = `New message ${Date.now()}: Hello, this is a test message.`;

  await db.execute({
    sql: "INSERT INTO messages (sender, recipient, message_text) VALUES (?, ?, ?)",
    args: [sender, recipient, messageText],
  });

  revalidatePath("/");
}

async function ClientColumn({ db, title }: { db: any; title: string }) {
  const fetchStart = performance.now();
  const data = await db.execute(
    "SELECT * FROM messages ORDER BY id DESC LIMIT 10",
  );
  const fetchEnd = performance.now();
  const fetchTime = fetchEnd - fetchStart;

  return (
    <div className="w-1/2 p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-4">Fetch time: {fetchTime.toFixed(2)} ms</p>
      <form action={insertMessage}>
        <input
          type="hidden"
          name="client"
          value={title === "Remote Client" ? "remote" : "embedded"}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Insert New Message
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">Latest Messages:</h3>
      <ul>
        {data?.rows?.map((row: any, index: number) => (
          <li key={index} className="mb-2">
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(row, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages Comparison</h1>
      <div className="flex">
        <ClientColumn db={remoteDb} title="Remote Client" />
        <ClientColumn db={embeddedDb} title="Embedded Replica Client" />
      </div>
    </div>
  );
}

export const revalidate = 0;
