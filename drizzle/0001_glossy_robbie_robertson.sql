CREATE TABLE `international_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`key_hash` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`country` text NOT NULL,
	`service` text NOT NULL,
	`destination` text NOT NULL,
	`method` text NOT NULL,
	`contact_time` text NOT NULL,
	`message` text NOT NULL,
	`details` text NOT NULL,
	`files` text NOT NULL,
	`consent` integer NOT NULL,
	`medical_consent` integer NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `international_requests_code_unique` ON `international_requests` (`code`);