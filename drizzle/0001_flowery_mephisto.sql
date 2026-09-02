CREATE TABLE `ticket_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(32) NOT NULL,
	`manhole` varchar(32) NOT NULL,
	`title` text NOT NULL,
	`status` varchar(32) NOT NULL,
	`crew` varchar(80) NOT NULL,
	`deadline` varchar(16) NOT NULL,
	`ward` varchar(80),
	`fill` int,
	`proofPhotos` text,
	`details` text,
	`approvedBy` varchar(160),
	`approvedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_history_id` PRIMARY KEY(`id`)
);
