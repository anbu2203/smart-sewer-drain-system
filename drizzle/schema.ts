import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const ticketHistory = mysqlTable("ticket_history", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: varchar("ticketId", { length: 32 }).notNull(),
  manhole: varchar("manhole", { length: 32 }).notNull(),
  title: text("title").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  crew: varchar("crew", { length: 80 }).notNull(),
  deadline: varchar("deadline", { length: 16 }).notNull(),
  ward: varchar("ward", { length: 80 }),
  fill: int("fill"),
  proofPhotos: text("proofPhotos"),
  details: text("details"),
  approvedBy: varchar("approvedBy", { length: 160 }),
  approvedAt: timestamp("approvedAt").defaultNow().notNull(),
});

export type TicketHistory = typeof ticketHistory.$inferSelect;
export type InsertTicketHistory = typeof ticketHistory.$inferInsert;


export const employeeProfiles = mysqlTable("employee_profiles", {
  id: int("id").autoincrement().primaryKey(),
  crewName: varchar("crewName", { length: 80 }).notNull().unique(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ticketAssignments = mysqlTable("ticket_assignments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: varchar("ticketId", { length: 32 }).notNull().unique(),
  crewName: varchar("crewName", { length: 80 }).notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedBy: varchar("assignedBy", { length: 120 }).notNull().default("SSOP auto-assignment"),
});

export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type TicketAssignment = typeof ticketAssignments.$inferSelect;
