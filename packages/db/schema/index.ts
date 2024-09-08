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

export const problem = sqliteTable("problem", {
  id: integer("id").primaryKey(),
  problem_title: text("problem_title").notNull(),
  problem_description: text("problem_description").notNull(),
  parent_problem_id: integer("parent_problem_id"),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const problem_discord_channel = sqliteTable("problem_discord_channel", {
  id: integer("id").primaryKey(),
  discord_channel_id: text("discord_channel_id").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const problem_github_issue = sqliteTable("problem_github_issue", {
  id: integer("id").primaryKey(),
  github_issue_id: text("github_issue_id").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const discord_issue = sqliteTable("discord_issue", {
  id: integer("id").primaryKey(),
  discord_channel_id: text("discord_channel_id").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const github_issue = sqliteTable("github_issue", {
  id: integer("id").primaryKey(),
  issue_id: integer("issue_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const discord_metadata = sqliteTable("discord_metadata", {
  id: integer("id").primaryKey(),
  discord_channel_id: text("discord_channel_id").notNull(),
  process_text: text("process_text").notNull(),
  cluster: integer("cluster").notNull(),
  cluster_label: text("cluster_label").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const github_metadata = sqliteTable("github_metadata", {
  id: integer("id").primaryKey(),
  github_issue_id: integer("github_issue_id").notNull(),
  process_text: text("process_text").notNull(),
  cluster: integer("cluster").notNull(),
  cluster_label: text("cluster_label").notNull(),
  created_at: integer("created_at").notNull().$defaultFn(getCurrentTimeMs),
});

export const insertDiscordChannelSchema = createInsertSchema(discordChannel);
export const insertDiscordMessageSchema = createInsertSchema(discordMessage);

export type DiscordChannelType = typeof discordChannel.$inferSelect;
export type DiscordMessageType = typeof discordMessage.$inferSelect;
