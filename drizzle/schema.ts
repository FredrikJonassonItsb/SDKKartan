import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

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

/**
 * Municipalities (Kommuner)
 */
export const municipalities = mysqlTable("municipalities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["none", "started", "qa", "connected", "hubs"]).notNull().default("none"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Municipality = typeof municipalities.$inferSelect;
export type InsertMunicipality = typeof municipalities.$inferInsert;

/**
 * Regions (Regioner)
 */
export const regions = mysqlTable("regions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["none", "started", "qa", "connected", "hubs"]).notNull().default("none"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Region = typeof regions.$inferSelect;
export type InsertRegion = typeof regions.$inferInsert;

/**
 * Organizations (Myndigheter & Övriga organisationer)
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["authority", "other"]).notNull(),
  status: mysqlEnum("status", ["none", "started", "qa", "connected", "hubs"]).notNull().default("none"),
  latitude: text("latitude"),  // Stored as text to avoid precision issues
  longitude: text("longitude"), // Stored as text to avoid precision issues
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Update history (Uppdateringshistorik)
 * Logs all changes to municipalities, regions, and organizations
 */
export const updateHistory = mysqlTable("update_history", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["municipality", "region", "organization"]).notNull(),
  entityId: int("entityId").notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "import", "digg_sync"]).notNull(),
  changeType: mysqlEnum("changeType", ["manual", "automatic"]).notNull(),
  oldStatus: mysqlEnum("oldStatus", ["none", "started", "qa", "connected", "hubs"]),
  newStatus: mysqlEnum("newStatus", ["none", "started", "qa", "connected", "hubs"]),
  changedBy: int("changedBy"), // User ID if manual, null if automatic
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UpdateHistory = typeof updateHistory.$inferSelect;
export type InsertUpdateHistory = typeof updateHistory.$inferInsert;

/**
 * System settings (Systeminställningar)
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * DIGG sync log (DIGG-synkroniseringslogg)
 * Tracks when DIGG data was last checked and synced
 */
export const diggSyncLog = mysqlTable("digg_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  syncType: mysqlEnum("syncType", ["manual", "scheduled"]).notNull(),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  municipalitiesUpdated: int("municipalitiesUpdated").default(0),
  regionsUpdated: int("regionsUpdated").default(0),
  authoritiesUpdated: int("authoritiesUpdated").default(0),
  othersUpdated: int("othersUpdated").default(0),
  errorMessage: text("errorMessage"),
  triggeredBy: int("triggeredBy"), // User ID if manual, null if scheduled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiggSyncLog = typeof diggSyncLog.$inferSelect;
export type InsertDiggSyncLog = typeof diggSyncLog.$inferInsert;