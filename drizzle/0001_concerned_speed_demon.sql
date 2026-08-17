CREATE TABLE `order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`created_at` text NOT NULL,
	`action` text NOT NULL,
	`previous_status` text NOT NULL,
	`next_status` text NOT NULL,
	`actor_email` text NOT NULL,
	`message` text,
	`external_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_order_events_order_id` ON `order_events` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_events_created_at` ON `order_events` (`created_at`);