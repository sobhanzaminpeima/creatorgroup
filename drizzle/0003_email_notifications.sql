CREATE TABLE `email_notifications` (
 `id` text PRIMARY KEY NOT NULL,
 `payload` text NOT NULL,
 `status` text DEFAULT 'pending' NOT NULL,
 `attempts` integer DEFAULT 0 NOT NULL,
 `next_attempt_at` integer NOT NULL,
 `updated_at` integer NOT NULL
);
