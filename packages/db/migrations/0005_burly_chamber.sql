CREATE TABLE `problem_space` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_problem_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `problem_space_cluster` (
	`id` integer PRIMARY KEY NOT NULL,
	`problem_space_id` integer NOT NULL,
	`cluster` integer NOT NULL,
	`cluster_label` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `discord_issue`;--> statement-breakpoint
DROP TABLE `discord_metadata`;--> statement-breakpoint
DROP TABLE `github_metadata`;--> statement-breakpoint
DROP TABLE `problem_discord_channel`;--> statement-breakpoint
DROP TABLE `problem_github_issue`;--> statement-breakpoint
ALTER TABLE problem ADD `problem_space_cluster_id` integer NOT NULL;--> statement-breakpoint
ALTER TABLE problem ADD `source_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE problem ADD `source_id` integer NOT NULL;--> statement-breakpoint
ALTER TABLE problem ADD `process_text` text NOT NULL;--> statement-breakpoint
ALTER TABLE `problem` DROP COLUMN `problem_title`;--> statement-breakpoint
ALTER TABLE `problem` DROP COLUMN `problem_description`;--> statement-breakpoint
ALTER TABLE `problem` DROP COLUMN `parent_problem_id`;