import { env } from "@/env";
import { createDbClient } from "@repo/db";
import ora from "ora";
import { schema } from "@repo/db";
import { discordChannel } from "@repo/db/schema";
import { z } from "zod";

const ThreadResponseSchema = z.object({
  threads: z.array(z.object({
    id: z.string(),
  })),
  has_more: z.boolean(),
});

export async function threadIdScraper() {
  const token = env.DISCORD_TOKEN;
  const channelId = env.DISCORD_THREAD_CHANNEL_ID;
  const db = createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);
  
  async function fetchAndSaveThreads(
    offset: number = 0
  ): Promise<{ count: number; hasMore: boolean }> {
    const url = new URL(
      `https://discord.com/api/v9/channels/${channelId}/threads/search`
    );
    url.searchParams.append("archived", "true");
    url.searchParams.append("sort_by", "last_message_time");
    url.searchParams.append("sort_order", "desc");
    url.searchParams.append("tag_setting", "match_some");
    url.searchParams.append("offset", offset.toString());

    const spinner = ora("Fetching threads...").start();

    try {
      const response = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          authorization: token,
          "sec-ch-ua":
            '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-debug-options": "bugReporterEnabled",
          "x-discord-locale": "en-US",
          "x-discord-timezone": "America/Los_Angeles",
        },
        referrer: `https://discord.com/channels/${channelId.split("/")[0]}/${channelId}`,
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "5",
          10
        );
        spinner.text = `Rate limited. Waiting for ${retryAfter} seconds...`;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        spinner.stop();
        return fetchAndSaveThreads(offset);
      }

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} offset: ${offset}`
        );
      }

      const rawData = await response.json();
      const data = ThreadResponseSchema.parse(rawData);
      spinner.succeed("Threads fetched successfully");

      const threadIds = data.threads.map((thread) => thread.id);

      // Save thread IDs to the database
      await db.insert(discordChannel).values(
        threadIds.map(id => ({ id }))
      ).onConflictDoNothing();

      return {
        count: threadIds.length,
        hasMore: data.has_more,
      };
    } catch (error) {
      spinner.fail("Error fetching threads");
      console.error("Fetch error details:", error);
      throw error;
    }
  }

  try {
    let totalThreads = 0;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { count, hasMore: moreThreads } = await fetchAndSaveThreads(offset);
      totalThreads += count;
      offset += count;
      hasMore = moreThreads;
      console.log(
        `Fetched and saved ${count} thread IDs. Total: ${totalThreads}`
      );
    }

    console.log("Total thread IDs fetched and saved:", totalThreads);
  } catch (error) {
    console.error("Error fetching and saving thread IDs:", error);
    throw error;
  }
}
