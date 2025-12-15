import { getDb } from "../db";
import { municipalities, regions, organizations, updateHistory, diggSyncLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { compareDiggData, formatChangesForNotification, type ComparisonResult } from "./diggCompare";
import { notifyOwner } from "../_core/notification";

export interface SyncOptions {
  userId?: number;
  syncType: "manual" | "scheduled";
  autoApply?: boolean; // Om true, applicera ändringar automatiskt
  notifyOnChanges?: boolean; // Om true, skicka notifiering vid ändringar
}

export interface SyncResult {
  success: boolean;
  comparison: ComparisonResult;
  applied: boolean;
  notificationSent: boolean;
  stats: {
    created: number;
    updated: number;
    removed: number;
  };
}

/**
 * Intelligent DIGG-synkronisering med jämförelselogik och notifieringar
 */
export async function intelligentDiggSync(
  scrapedData: {
    municipalities: Array<{ name: string; status: "none" | "started" | "qa" | "connected" | "hubs" }>;
    regions: Array<{ name: string; status: "none" | "started" | "qa" | "connected" | "hubs" }>;
    authorities: Array<{ name: string; status: "none" | "started" | "qa" | "connected" | "hubs" }>;
    others: Array<{ name: string; status: "none" | "started" | "qa" | "connected" | "hubs" }>;
  },
  options: SyncOptions
): Promise<SyncResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Steg 1: Jämför data och identifiera ändringar
  const comparison = await compareDiggData(scrapedData);
  
  let applied = false;
  let notificationSent = false;
  const stats = { created: 0, updated: 0, removed: 0 };

  // Steg 2: Skicka notifiering om ändringar upptäcktes
  if (comparison.hasChanges && options.notifyOnChanges) {
    const notificationContent = formatChangesForNotification(comparison);
    try {
      notificationSent = await notifyOwner({
        title: `DIGG-uppdatering: ${comparison.summary.totalChanges} ändringar`,
        content: notificationContent,
      });
      console.log(`[DIGG Sync] Notifiering skickad: ${notificationSent}`);
    } catch (error) {
      console.error("[DIGG Sync] Fel vid skickning av notifiering:", error);
    }
  }

  // Steg 3: Applicera ändringar om autoApply är aktiverat
  if (comparison.hasChanges && options.autoApply) {
    try {
      // Applicera alla ändringar
      for (const change of comparison.changes) {
        if (change.type === "municipality") {
          if (change.changeType === "new") {
            const result = await db.insert(municipalities).values({
              name: change.entityName,
              status: change.newStatus!,
            });
            await db.insert(updateHistory).values({
              entityType: "municipality",
              entityId: result[0].insertId,
              entityName: change.entityName,
              action: "create",
              changeType: "automatic",
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.created++;
          } else if (change.changeType === "status_change") {
            await db.update(municipalities)
              .set({ status: change.newStatus! })
              .where(eq(municipalities.id, change.entityId!));
            await db.insert(updateHistory).values({
              entityType: "municipality",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "update",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.updated++;
          } else if (change.changeType === "removed") {
            // Vi tar inte bort poster automatiskt, bara loggar
            await db.insert(updateHistory).values({
              entityType: "municipality",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "delete",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              changedBy: options.userId || null,
              notes: "Upptäckt som borttagen från DIGG (ej automatiskt raderad)",
            });
            stats.removed++;
          }
        } else if (change.type === "region") {
          if (change.changeType === "new") {
            const result = await db.insert(regions).values({
              name: change.entityName,
              status: change.newStatus!,
            });
            await db.insert(updateHistory).values({
              entityType: "region",
              entityId: result[0].insertId,
              entityName: change.entityName,
              action: "create",
              changeType: "automatic",
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.created++;
          } else if (change.changeType === "status_change") {
            await db.update(regions)
              .set({ status: change.newStatus! })
              .where(eq(regions.id, change.entityId!));
            await db.insert(updateHistory).values({
              entityType: "region",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "update",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.updated++;
          } else if (change.changeType === "removed") {
            await db.insert(updateHistory).values({
              entityType: "region",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "delete",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              changedBy: options.userId || null,
              notes: "Upptäckt som borttagen från DIGG (ej automatiskt raderad)",
            });
            stats.removed++;
          }
        } else if (change.type === "organization") {
          if (change.changeType === "new") {
            const result = await db.insert(organizations).values({
              name: change.entityName,
              type: change.organizationType!,
              status: change.newStatus!,
              latitude: null,
              longitude: null,
            });
            await db.insert(updateHistory).values({
              entityType: "organization",
              entityId: result[0].insertId,
              entityName: change.entityName,
              action: "create",
              changeType: "automatic",
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.created++;
          } else if (change.changeType === "status_change") {
            await db.update(organizations)
              .set({ status: change.newStatus! })
              .where(eq(organizations.id, change.entityId!));
            await db.insert(updateHistory).values({
              entityType: "organization",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "update",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              newStatus: change.newStatus,
              changedBy: options.userId || null,
            });
            stats.updated++;
          } else if (change.changeType === "removed") {
            await db.insert(updateHistory).values({
              entityType: "organization",
              entityId: change.entityId!,
              entityName: change.entityName,
              action: "delete",
              changeType: "automatic",
              oldStatus: change.oldStatus,
              changedBy: options.userId || null,
              notes: "Upptäckt som borttagen från DIGG (ej automatiskt raderad)",
            });
            stats.removed++;
          }
        }
      }
      
      applied = true;
      console.log(`[DIGG Sync] Ändringar applicerade: ${stats.created} skapade, ${stats.updated} uppdaterade, ${stats.removed} borttagna`);
    } catch (error) {
      console.error("[DIGG Sync] Fel vid applicering av ändringar:", error);
      throw error;
    }
  }

  // Steg 4: Logga synkroniseringen
  await db.insert(diggSyncLog).values({
    syncType: options.syncType,
    status: "success",
    municipalitiesUpdated: stats.created + stats.updated,
    regionsUpdated: 0,
    authoritiesUpdated: 0,
    othersUpdated: 0,
    triggeredBy: options.userId || null,
  });

  return {
    success: true,
    comparison,
    applied,
    notificationSent,
    stats,
  };
}
