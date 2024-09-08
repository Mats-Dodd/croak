CREATE TABLE `discord_channel` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`parent_channel_id` text,
	`thread_data_complete` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discord_message` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `discord_channel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `discord_channel_name_index` ON `discord_channel` (`name`);--> statement-breakpoint
CREATE INDEX `discord_channel_parent_index` ON `discord_channel` (`parent_channel_id`);--> statement-breakpoint
CREATE INDEX `discord_message_channel_index` ON `discord_message` (`channel_id`);--> statement-breakpoint
CREATE INDEX `discord_message_author_index` ON `discord_message` (`author_id`);