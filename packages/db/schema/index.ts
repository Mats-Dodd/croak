import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

export const getCurrentTimeMs = () => {
  return new Date().getTime();
};

export const discordChannel = sqliteTable(
  "discord_channel",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    parent_channel_id: text("parent_channel_id"),
    thread_data_complete: integer("thread_data_complete", { mode: "boolean" }).notNull().$defaultFn(() => false),
    created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
  },
  (t) => ({
    nameIndex: index("discord_channel_name_index").on(t.name),
    parentChannelIndex: index("discord_channel_parent_index").on(t.parent_channel_id),
  })
);

export const discordMessage = sqliteTable(
  "discord_message",
  {
    id: text("id").primaryKey(),
    channel_id: text("channel_id")
      .notNull()
      .references(() => discordChannel.id),
    content: text("content").notNull(),
    author_id: text("author_id").notNull(),
    message_sent_at: integer("message_sent_at").notNull(),
    created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
  },
  (t) => ({
    channelIndex: index("discord_message_channel_index").on(t.channel_id),
    authorIndex: index("discord_message_author_index").on(t.author_id),
  })
);

export const insertDiscordChannelSchema = createInsertSchema(discordChannel);
export const insertDiscordMessageSchema = createInsertSchema(discordMessage);

export type DiscordChannelType = typeof discordChannel.$inferSelect;
export type DiscordMessageType = typeof discordMessage.$inferSelect;
