CREATE TABLE `problem` (
	`id` integer PRIMARY KEY NOT NULL,
	`problem` text NOT NULL,
	`parent_problem_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `problem_discord_channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_channel_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `problem_github_issue` (
	`id` integer PRIMARY KEY NOT NULL,
	`github_issue_id` text NOT NULL,
	`created_at` integer NOT NULL
);
