CREATE TABLE `whatsapp_notifications` (
 `id` text PRIMARY KEY NOT NULL,
 `payload` text NOT NULL,
 `status` text DEFAULT 'pending' NOT NULL,
 `attempts` integer DEFAULT 0 NOT NULL,
 `next_attempt_at` integer NOT NULL,
 `provider_id` text,
 `updated_at` integer NOT NULL
);
