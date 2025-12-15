CREATE TABLE `digg_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncType` enum('manual','scheduled') NOT NULL,
	`status` enum('success','partial','failed') NOT NULL,
	`municipalitiesUpdated` int DEFAULT 0,
	`regionsUpdated` int DEFAULT 0,
	`authoritiesUpdated` int DEFAULT 0,
	`othersUpdated` int DEFAULT 0,
	`errorMessage` text,
	`triggeredBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `digg_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `municipalities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('none','started','qa','connected','hubs') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `municipalities_id` PRIMARY KEY(`id`),
	CONSTRAINT `municipalities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('authority','other') NOT NULL,
	`status` enum('none','started','qa','connected','hubs') NOT NULL DEFAULT 'none',
	`latitude` text,
	`longitude` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('none','started','qa','connected','hubs') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regions_id` PRIMARY KEY(`id`),
	CONSTRAINT `regions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `update_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('municipality','region','organization') NOT NULL,
	`entityId` int NOT NULL,
	`entityName` varchar(255) NOT NULL,
	`action` enum('create','update','delete','import','digg_sync') NOT NULL,
	`changeType` enum('manual','automatic') NOT NULL,
	`oldStatus` enum('none','started','qa','connected','hubs'),
	`newStatus` enum('none','started','qa','connected','hubs'),
	`changedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `update_history_id` PRIMARY KEY(`id`)
);
