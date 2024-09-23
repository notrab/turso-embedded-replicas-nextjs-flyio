import { createClient } from "@libsql/client";
import { revalidatePath } from "next/cache";

const db = createClient({
  url: "file:./local.db",
  syncUrl: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 1000,
});

async function insertMessage() {
  "use server";
  const sender = `User${Math.floor(Math.random() * 100) + 1}`;
  const recipient = `User${Math.floor(Math.random() * 100) + 1}`;
  const messageText = `New message ${Date.now()}: Hello, this is a test message.`;

  await db.execute({
    sql: "INSERT INTO messages (sender, recipient, message_text) VALUES (?, ?, ?)",
    args: [sender, recipient, messageText],
  });

  revalidatePath("/");
}

export default async function Home() {
  const fetchStart = performance.now();
  const data = await db.execute("SELECT * FROM messages");
  const fetchEnd = performance.now();
  const fetchTime = fetchEnd - fetchStart;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p className="mb-4">Fetch time: {fetchTime.toFixed(2)} ms</p>
      <form action={insertMessage}>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Insert New Message
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Data Results:</h2>
      <ul>
        {data?.rows?.map((row, index) => (
          <li key={index} className="mb-2">
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(row, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const revalidate = 0;
