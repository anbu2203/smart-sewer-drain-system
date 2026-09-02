CREATE TABLE `ticket_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(120) NOT NULL DEFAULT 'JARVIS command',
	CONSTRAINT `ticket_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_statuses_ticketId_unique` UNIQUE(`ticketId`)
);
