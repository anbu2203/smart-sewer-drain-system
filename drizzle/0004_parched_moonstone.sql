CREATE TABLE `jarvis_assignment_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(32) NOT NULL,
	`crewName` varchar(80) NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedBy` varchar(120) NOT NULL DEFAULT 'JARVIS autonomous assignment',
	CONSTRAINT `jarvis_assignment_logs_id` PRIMARY KEY(`id`)
);
