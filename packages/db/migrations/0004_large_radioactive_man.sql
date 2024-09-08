CREATE TABLE `discord_issue` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_channel_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discord_metadata` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_channel_id` text NOT NULL,
	`process_text` text NOT NULL,
	`cluster` integer NOT NULL,
	`cluster_label` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_issue` (
	`id` integer PRIMARY KEY NOT NULL,
	`issue_id` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_metadata` (
	`id` integer PRIMARY KEY NOT NULL,
	`github_issue_id` integer NOT NULL,
	`process_text` text NOT NULL,
	`cluster` integer NOT NULL,
	`cluster_label` text NOT NULL,
	`created_at` integer NOT NULL
);
