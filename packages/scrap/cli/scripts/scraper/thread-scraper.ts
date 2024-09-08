import { env } from "@/env";

export async function threadScraper() {
  const token = env.DISCORD_TOKEN;

  try {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/threads/archived/private",
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const threadIds = data.threads.map((thread: any) => thread.id);

    console.log("Thread IDs:", threadIds);
    return threadIds;
  } catch (error) {
    console.error("Error fetching thread IDs:", error);
    throw error;
  }
}
