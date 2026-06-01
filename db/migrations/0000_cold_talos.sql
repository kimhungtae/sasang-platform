CREATE TABLE `answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`response_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`choice_id` integer,
	`choice_ids_json` text,
	FOREIGN KEY (`response_id`) REFERENCES `responses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`choice_id`) REFERENCES `choices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `answers_response_idx` ON `answers` (`response_id`);--> statement-breakpoint
CREATE TABLE `choices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`order` integer NOT NULL,
	`label` text NOT NULL,
	`constitution_key` integer,
	`effects_json` text,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `choices_question_order_idx` ON `choices` (`question_id`,`order`);--> statement-breakpoint
CREATE TABLE `herbs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`aliases_json` text,
	`constitutions_json` text,
	`strength_class` text,
	`meridians_json` text,
	`qi` text,
	`flavor_json` text,
	`effects_json` text,
	`commentary` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `herbs_name_unique` ON `herbs` (`name`);--> statement-breakpoint
CREATE INDEX `herbs_name_idx` ON `herbs` (`name`);--> statement-breakpoint
CREATE TABLE `lifestyle_guides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`constitution` text NOT NULL,
	`category` text NOT NULL,
	`recommended_json` text,
	`avoid_json` text,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `prescription_ingredients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prescription_id` text NOT NULL,
	`herb_id` integer NOT NULL,
	`dose_don` real,
	`version` text DEFAULT 'current' NOT NULL,
	`order` integer NOT NULL,
	FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pi_prescription_idx` ON `prescription_ingredients` (`prescription_id`);--> statement-breakpoint
CREATE INDEX `pi_herb_idx` ON `prescription_ingredients` (`herb_id`);--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`constitution` text NOT NULL,
	`name` text NOT NULL,
	`composition_current` text,
	`composition_legacy` text,
	`source` text,
	`indications_json` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prescriptions_constitution_idx` ON `prescriptions` (`constitution`);--> statement-breakpoint
CREATE INDEX `prescriptions_name_idx` ON `prescriptions` (`name`);--> statement-breakpoint
CREATE TABLE `questionnaires` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`version` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`weights_json` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`qnaire_id` integer NOT NULL,
	`order` integer NOT NULL,
	`section` text,
	`code` text,
	`text` text NOT NULL,
	`tag` text,
	`type` text DEFAULT 'single' NOT NULL,
	`is_core` integer DEFAULT false NOT NULL,
	`confirm_constitution` text,
	`effects_json` text,
	FOREIGN KEY (`qnaire_id`) REFERENCES `questionnaires`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_qnaire_order_idx` ON `questions` (`qnaire_id`,`order`);--> statement-breakpoint
CREATE INDEX `questions_section_idx` ON `questions` (`section`);--> statement-breakpoint
CREATE TABLE `responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`qnaire_id` integer NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`qnaire_id`) REFERENCES `questionnaires`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `responses_user_idx` ON `responses` (`user_id`);--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`response_id` integer NOT NULL,
	`top` text NOT NULL,
	`second` text,
	`scores_json` text NOT NULL,
	`hanyul` text,
	`confidence` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`response_id`) REFERENCES `responses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `results_response_id_unique` ON `results` (`response_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`role` text DEFAULT 'public' NOT NULL,
	`license_no` text,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);