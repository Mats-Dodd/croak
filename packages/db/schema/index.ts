import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
    thread_data_complete: integer("thread_data_complete", { mode: "boolean" })
      .notNull()
      .$defaultFn(() => false),

    created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
  },
  (t) => ({
    nameIndex: index("discord_channel_name_index").on(t.name),
    parentChannelIndex: index("discord_channel_parent_index").on(
      t.parent_channel_id
    ),
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

export const github_issue = sqliteTable("github_issue", {
  id: integer("id").primaryKey(),
  issue_id: integer("issue_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const problem_space_cluster = sqliteTable("problem_space_cluster", {
  id: integer("id").primaryKey(),
  parent_problem_space_cluster_id: integer("parent_problem_space_cluster_id"),
  cluster: integer("cluster").notNull(),
  cluster_label: text("cluster_label").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const problem = sqliteTable("problem", {
  id: integer("id").primaryKey(),
  problem_space_cluster_id: integer("problem_space_cluster_id").notNull(),
  source_type: text("source_type", { enum: ["discord", "github"] }).notNull(),
  source_id: integer("source_id").notNull(),
  process_text: text("process_text").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const insertDiscordChannelSchema = createInsertSchema(discordChannel);
export const insertDiscordMessageSchema = createInsertSchema(discordMessage);

export type DiscordChannelType = typeof discordChannel.$inferSelect;
export type DiscordMessageType = typeof discordMessage.$inferSelect;
