DROP TABLE `problem_space`;--> statement-breakpoint
ALTER TABLE problem_space_cluster ADD `parent_problem_space_cluster_id` integer;--> statement-breakpoint
ALTER TABLE `problem_space_cluster` DROP COLUMN `problem_space_id`;