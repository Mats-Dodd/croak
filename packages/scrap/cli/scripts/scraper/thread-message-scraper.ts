import { env } from "@/env";
import { createDbClient } from "@repo/db";
import ora from "ora";
import { discordChannel, discordMessage } from "@repo/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const MessageResponseSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    content: z.string(),
    author: z.object({
      id: z.string(),
    }),
    channel_id: z.string(),
    timestamp: z.string(),
  })),
  has_more: z.boolean(),
});

export async function threadMessageScraper() {
  const token = env.DISCORD_TOKEN;
  const db = createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);

  async function fetchAndSaveMessages(
    channelId: string,
    before?: string
  ): Promise<{ count: number; hasMore: boolean }> {
    const url = new URL(`https://discord.com/api/v9/channels/${channelId}/messages`);
    url.searchParams.append("limit", "100");
    if (before) url.searchParams.append("before", before);

    const spinner = ora(`Fetching messages for channel ${channelId}...`).start();

    try {
      const response = await fetch(url.toString(), {
        headers: {
          authorization: token,
        },
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "5", 10);
        spinner.text = `Rate limited. Waiting for ${retryAfter} seconds...`;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        spinner.stop();
        return fetchAndSaveMessages(channelId, before);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} channelId: ${channelId}`);
      }

      const rawData = await response.json();
      const data = MessageResponseSchema.parse({ messages: rawData, has_more: rawData.length === 100 });
      spinner.succeed(`Messages fetched successfully for channel ${channelId}`);

      // Save messages to the database
      if (data.messages.length > 0) {
      await db.insert(discordMessage).values(
        data.messages.map(msg => ({
          id: msg.id,
          channel_id: msg.channel_id,
          content: msg.content,
          author_id: msg.author.id,
          message_sent_at: new Date(msg.timestamp).getTime(),
        }))
        ).onConflictDoNothing();
      }

      return {
        count: data.messages.length,
        hasMore: data.has_more,
      };
    } catch (error) {
      spinner.fail(`Error fetching messages for channel ${channelId}`);
      console.error("Fetch error details:", error);
      throw error;
    }
  }

  async function processChannel(channelId: string) {
    let totalMessages = 0;
    let lastMessageId: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const { count, hasMore: moreMessages } = await fetchAndSaveMessages(channelId, lastMessageId);
      totalMessages += count;
      hasMore = moreMessages;
      if (count > 0) {
        lastMessageId = (await db.select({ id: discordMessage.id })
          .from(discordMessage)
          .where(eq(discordMessage.channel_id, channelId))
          .orderBy(discordMessage.id)
          .limit(1)).at(0)?.id;
      }
      console.log(`Fetched and saved ${count} messages for channel ${channelId}. Total: ${totalMessages}`);
    }

    // Mark the channel as complete
    await db.update(discordChannel)
      .set({ thread_data_complete: true })
      .where(eq(discordChannel.id, channelId));

    console.log(`Channel ${channelId} processing complete. Total messages: ${totalMessages}`);
  }

  try {
    while (true) {
      const incompleteChannels = await db.select({ id: discordChannel.id })
        .from(discordChannel)
        .where(eq(discordChannel.thread_data_complete, false))
        .limit(1);

      if (incompleteChannels.length === 0) {
        console.log("No more incomplete channels. Waiting 5 seconds before trying again...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const channelId = incompleteChannels[0].id;
      try{
      await processChannel(channelId);
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error processing channels:", error);
    throw error;
  }
}
