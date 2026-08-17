CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`payment_method` text NOT NULL,
	`shipping_method` text NOT NULL,
	`shipping_fee` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`total` integer NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`address` text,
	`store_chain` text,
	`store_name` text,
	`store_code` text,
	`note` text,
	`items_json` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);