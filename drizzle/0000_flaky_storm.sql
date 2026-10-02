CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`country` text NOT NULL,
	`industry` text NOT NULL,
	`interest` text NOT NULL,
	`message` text NOT NULL,
	`language` text NOT NULL,
	`created_at` integer NOT NULL
);
