import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { EmployeeProfile, InsertTicketHistory, InsertUser, employeeProfiles, jarvisAssignmentLogs, ticketAssignments, ticketHistory, ticketStatuses, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


export async function listTicketHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketHistory).orderBy(desc(ticketHistory.approvedAt));
}

export async function saveTicketHistory(entry: InsertTicketHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(ticketHistory).values(entry);
  return { success: true } as const;
}


export async function listEmployeeProfiles(): Promise<EmployeeProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeProfiles).orderBy(employeeProfiles.crewName);
}

export async function listTicketAssignments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketAssignments).orderBy(desc(ticketAssignments.assignedAt));
}

export async function seedEmployeeProfiles(profiles: { crewName: string; displayName: string }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  for (const profile of profiles) {
    await db.insert(employeeProfiles).values(profile).onDuplicateKeyUpdate({ set: { displayName: profile.displayName } });
  }
  return listEmployeeProfiles();
}

export async function upsertTicketAssignment(ticketId: string, crewName: string, assignedBy = "SSOP auto-assignment") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(ticketAssignments).where(eq(ticketAssignments.ticketId, ticketId)).limit(1);
  if (existing.length) {
    await db.update(ticketAssignments).set({ crewName, assignedBy }).where(eq(ticketAssignments.ticketId, ticketId));
  } else {
    await db.insert(ticketAssignments).values({ ticketId, crewName, assignedBy });
  }
}

export async function listTicketStatuses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketStatuses);
}
export async function upsertTicketStatus(ticketId: string, status: string, updatedBy = "JARVIS command") {
  const db = await getDb();
  if (!db) return { ticketId, status };
  const existing = await db.select().from(ticketStatuses).where(eq(ticketStatuses.ticketId, ticketId)).limit(1);
  if (existing.length) await db.update(ticketStatuses).set({ status, updatedBy, updatedAt: new Date() }).where(eq(ticketStatuses.ticketId, ticketId));
  else await db.insert(ticketStatuses).values({ ticketId, status, updatedBy });
  return { ticketId, status };
}

export async function listJarvisAssignmentLogs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jarvisAssignmentLogs).orderBy(desc(jarvisAssignmentLogs.assignedAt));
}

export async function recordJarvisAssignment(ticketId: string, crewName: string, assignedBy = "JARVIS autonomous assignment") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(jarvisAssignmentLogs).values({ ticketId, crewName, assignedBy });
  return { success: true } as const;
}
