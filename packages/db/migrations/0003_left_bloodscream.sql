ALTER TABLE `problem` RENAME COLUMN `problem` TO `problem_title`;--> statement-breakpoint
ALTER TABLE problem ADD `problem_description` text NOT NULL;