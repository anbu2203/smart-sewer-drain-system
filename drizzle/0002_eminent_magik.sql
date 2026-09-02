CREATE TABLE `employee_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crewName` varchar(80) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_profiles_crewName_unique` UNIQUE(`crewName`)
);
--> statement-breakpoint
CREATE TABLE `ticket_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(32) NOT NULL,
	`crewName` varchar(80) NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedBy` varchar(120) NOT NULL DEFAULT 'SSOP auto-assignment',
	CONSTRAINT `ticket_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_assignments_ticketId_unique` UNIQUE(`ticketId`)
);
