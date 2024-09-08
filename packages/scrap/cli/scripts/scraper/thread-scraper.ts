import { env } from "@/env";
import ora from "ora";

export async function threadScraper() {
  const token = env.DISCORD_TOKEN;
  const channelId = "1089389297548931182"; // You might want to make this configurable

  async function fetchThreads(
    offset: number = 0
  ): Promise<{ threadIds: string[]; hasMore: boolean }> {
    const url = new URL(
      `https://discord.com/api/v9/channels/${channelId}/threads/search`
    );
    url.searchParams.append("archived", "true");
    url.searchParams.append("sort_by", "last_message_time");
    url.searchParams.append("sort_order", "desc");
    url.searchParams.append("limit", "25");
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
        return fetchThreads(offset);
      }

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} offset: ${offset}`
        );
      }

      const data = await response.json();
      spinner.succeed("Threads fetched successfully");

      const threadIds = data.threads.map((thread: any) => thread.id);
      const channelIds = data.threads.map((thread: any) => thread.channel_id);
      const firstMessages = data.first_messages;

      const matchingFirstMessages = firstMessages.filter((message: any) =>
        threadIds.includes(message.channel_id)
      );

      console.log("Channel ID:", channelIds[0]); // Assuming all threads are from the same channel
      console.log(
        "Number of matching first messages:",
        matchingFirstMessages.length
      );

      return {
        threadIds: threadIds,
        hasMore: data.has_more,
      };
    } catch (error) {
      spinner.fail("Error fetching threads");
      console.error("Fetch error details:", error);
      throw error;
    }
  }

  try {
    let allThreadIds: string[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { threadIds, hasMore: moreThreads } = await fetchThreads(offset);
      allThreadIds = allThreadIds.concat(threadIds);
      offset += threadIds.length;
      hasMore = moreThreads;
      console.log(
        `Fetched ${threadIds.length} thread IDs. Total: ${allThreadIds.length}`
      );
    }

    console.log("Total thread IDs fetched:", allThreadIds.length);
    return allThreadIds;
  } catch (error) {
    console.error("Error fetching thread IDs:", error);
    throw error;
  }
}
