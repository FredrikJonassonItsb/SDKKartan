import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { municipalities, regions, organizations, updateHistory, systemSettings, diggSyncLog } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const statusEnum = z.enum(["none", "started", "qa", "connected", "hubs"]);

const ensureDb = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
};

export const adminRouter = router({
  // ============ MUNICIPALITIES ============
  getMunicipalities: adminProcedure.query(async () => {
    const db = await ensureDb();
    return await db.select().from(municipalities).orderBy(municipalities.name);
  }),

  createMunicipality: adminProcedure
    .input(z.object({ name: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const result = await db.insert(municipalities).values(input);
      
      await db.insert(updateHistory).values({
        entityType: "municipality",
        entityId: result[0].insertId,
        entityName: input.name,
        action: "create",
        changeType: "manual",
        newStatus: input.status,
        changedBy: ctx.user.id,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  updateMunicipality: adminProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), status: statusEnum.optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(municipalities).where(eq(municipalities.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.update(municipalities).set(input).where(eq(municipalities.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "municipality",
        entityId: input.id,
        entityName: input.name || old[0].name,
        action: "update",
        changeType: "manual",
        oldStatus: old[0].status,
        newStatus: input.status || old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  deleteMunicipality: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(municipalities).where(eq(municipalities.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.delete(municipalities).where(eq(municipalities.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "municipality",
        entityId: input.id,
        entityName: old[0].name,
        action: "delete",
        changeType: "manual",
        oldStatus: old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  // ============ REGIONS ============
  getRegions: adminProcedure.query(async () => {
    const db = await ensureDb();
    return await db.select().from(regions).orderBy(regions.name);
  }),

  createRegion: adminProcedure
    .input(z.object({ name: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const result = await db.insert(regions).values(input);
      
      await db.insert(updateHistory).values({
        entityType: "region",
        entityId: result[0].insertId,
        entityName: input.name,
        action: "create",
        changeType: "manual",
        newStatus: input.status,
        changedBy: ctx.user.id,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  updateRegion: adminProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), status: statusEnum.optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(regions).where(eq(regions.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.update(regions).set(input).where(eq(regions.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "region",
        entityId: input.id,
        entityName: input.name || old[0].name,
        action: "update",
        changeType: "manual",
        oldStatus: old[0].status,
        newStatus: input.status || old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  deleteRegion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(regions).where(eq(regions.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.delete(regions).where(eq(regions.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "region",
        entityId: input.id,
        entityName: old[0].name,
        action: "delete",
        changeType: "manual",
        oldStatus: old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  // ============ ORGANIZATIONS ============
  getOrganizations: adminProcedure.query(async () => {
    const db = await ensureDb();
    return await db.select().from(organizations).orderBy(organizations.name);
  }),

  createOrganization: adminProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(["authority", "other"]),
      status: statusEnum,
      latitude: z.union([z.string(), z.number()]).optional().transform(val => val?.toString()),
      longitude: z.union([z.string(), z.number()]).optional().transform(val => val?.toString()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const result = await db.insert(organizations).values(input);
      
      await db.insert(updateHistory).values({
        entityType: "organization",
        entityId: result[0].insertId,
        entityName: input.name,
        action: "create",
        changeType: "manual",
        newStatus: input.status,
        changedBy: ctx.user.id,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  updateOrganization: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(["authority", "other"]).optional(),
      status: statusEnum.optional(),
      latitude: z.union([z.string(), z.number()]).optional().transform(val => val?.toString()),
      longitude: z.union([z.string(), z.number()]).optional().transform(val => val?.toString()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(organizations).where(eq(organizations.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.update(organizations).set(input).where(eq(organizations.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "organization",
        entityId: input.id,
        entityName: input.name || old[0].name,
        action: "update",
        changeType: "manual",
        oldStatus: old[0].status,
        newStatus: input.status || old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  deleteOrganization: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      const old = await db.select().from(organizations).where(eq(organizations.id, input.id)).limit(1);
      if (!old.length) throw new TRPCError({ code: "NOT_FOUND" });
      
      await db.delete(organizations).where(eq(organizations.id, input.id));
      
      await db.insert(updateHistory).values({
        entityType: "organization",
        entityId: input.id,
        entityName: old[0].name,
        action: "delete",
        changeType: "manual",
        oldStatus: old[0].status,
        changedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  // ============ HISTORY ============
  getUpdateHistory: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      return await db.select().from(updateHistory).orderBy(desc(updateHistory.createdAt)).limit(input.limit);
    }),

  // ============ SETTINGS ============
  getSettings: adminProcedure.query(async () => {
    const db = await ensureDb();
    return await db.select().from(systemSettings);
  }),

  updateSetting: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      await db.update(systemSettings).set({ value: input.value }).where(eq(systemSettings.key, input.key));
      return { success: true };
    }),

  // ============ DIGG SYNC ============
  getDiggSyncLogs: adminProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      return await db.select().from(diggSyncLog).orderBy(desc(diggSyncLog.createdAt)).limit(input.limit);
    }),

  triggerDiggSync: adminProcedure.mutation(async ({ ctx }) => {
    // This will be implemented later
    return { success: true, message: "DIGG sync triggered", userId: ctx.user.id };
  }),

  // ============ DIGG SCRAPING ============
  scrapeDigg: adminProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDb();
    const { scrapeDiggData } = await import("../lib/diggScraper");
    
    try {
      const scrapedData = await scrapeDiggData();
      
      let totalUpdated = 0;
      let totalCreated = 0;
      
      // Update municipalities
      for (const mun of scrapedData.municipalities) {
        const existing = await db.select().from(municipalities).where(eq(municipalities.name, mun.name)).limit(1);
        
        if (existing.length > 0) {
          const old = existing[0];
          if (old.status !== mun.status) {
            await db.update(municipalities).set({ status: mun.status }).where(eq(municipalities.id, old.id));
            await db.insert(updateHistory).values({
              entityType: "municipality",
              entityId: old.id,
              entityName: mun.name,
              action: "update",
              changeType: "automatic",
              oldStatus: old.status,
              newStatus: mun.status,
              changedBy: ctx.user.id,
            });
            totalUpdated++;
          }
        } else {
          const result = await db.insert(municipalities).values({ name: mun.name, status: mun.status });
          await db.insert(updateHistory).values({
            entityType: "municipality",
            entityId: result[0].insertId,
            entityName: mun.name,
            action: "create",
            changeType: "automatic",
            newStatus: mun.status,
            changedBy: ctx.user.id,
          });
          totalCreated++;
        }
      }
      
      // Update regions
      for (const reg of scrapedData.regions) {
        const existing = await db.select().from(regions).where(eq(regions.name, reg.name)).limit(1);
        
        if (existing.length > 0) {
          const old = existing[0];
          if (old.status !== reg.status) {
            await db.update(regions).set({ status: reg.status }).where(eq(regions.id, old.id));
            await db.insert(updateHistory).values({
              entityType: "region",
              entityId: old.id,
              entityName: reg.name,
              action: "update",
              changeType: "automatic",
              oldStatus: old.status,
              newStatus: reg.status,
              changedBy: ctx.user.id,
            });
            totalUpdated++;
          }
        } else {
          const result = await db.insert(regions).values({ name: reg.name, status: reg.status });
          await db.insert(updateHistory).values({
            entityType: "region",
            entityId: result[0].insertId,
            entityName: reg.name,
            action: "create",
            changeType: "automatic",
            newStatus: reg.status,
            changedBy: ctx.user.id,
          });
          totalCreated++;
        }
      }
      
      // Update authorities
      for (const auth of scrapedData.authorities) {
        const existing = await db.select().from(organizations).where(eq(organizations.name, auth.name)).limit(1);
        
        if (existing.length > 0) {
          const old = existing[0];
          if (old.status !== auth.status) {
            await db.update(organizations).set({ status: auth.status }).where(eq(organizations.id, old.id));
            await db.insert(updateHistory).values({
              entityType: "organization",
              entityId: old.id,
              entityName: auth.name,
              action: "update",
              changeType: "automatic",
              oldStatus: old.status,
              newStatus: auth.status,
              changedBy: ctx.user.id,
            });
            totalUpdated++;
          }
        }
      }
      
      // Update others
      for (const other of scrapedData.others) {
        const existing = await db.select().from(organizations).where(eq(organizations.name, other.name)).limit(1);
        
        if (existing.length > 0) {
          const old = existing[0];
          if (old.status !== other.status) {
            await db.update(organizations).set({ status: other.status }).where(eq(organizations.id, old.id));
            await db.insert(updateHistory).values({
              entityType: "organization",
              entityId: old.id,
              entityName: other.name,
              action: "update",
              changeType: "automatic",
              oldStatus: old.status,
              newStatus: other.status,
              changedBy: ctx.user.id,
            });
            totalUpdated++;
          }
        }
      }
      
      // Log sync
      await db.insert(diggSyncLog).values({
        syncType: "manual",
        status: "success",
        municipalitiesUpdated: totalUpdated,
        regionsUpdated: 0,
        authoritiesUpdated: 0,
        othersUpdated: 0,
        triggeredBy: ctx.user.id,
      });
      
      return {
        success: true,
        updated: totalUpdated,
        created: totalCreated,
      };
    } catch (error) {
      await db.insert(diggSyncLog).values({
        syncType: "manual",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        triggeredBy: ctx.user.id,
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to scrape DIGG data",
        cause: error,
      });
    }
  }),

  checkDiggUpdates: adminProcedure.query(async () => {
    const { checkDiggUpdates } = await import("../lib/diggScraper");
    return await checkDiggUpdates();
  }),

  // ============ IMPORT/EXPORT ============
  exportData: adminProcedure
    .input(z.object({
      entityType: z.enum(["municipalities", "regions", "organizations", "all"]),
      format: z.enum(["csv", "json"]),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      let data: any = {};

      if (input.entityType === "municipalities" || input.entityType === "all") {
        data.municipalities = await db.select().from(municipalities);
      }
      if (input.entityType === "regions" || input.entityType === "all") {
        data.regions = await db.select().from(regions);
      }
      if (input.entityType === "organizations" || input.entityType === "all") {
        data.organizations = await db.select().from(organizations);
      }

      if (input.format === "json") {
        return {
          format: "json",
          data: JSON.stringify(data, null, 2),
          filename: `export_${input.entityType}_${new Date().toISOString().split('T')[0]}.json`,
        };
      } else {
        // CSV format
        const csvLines: string[] = [];
        
        (Object.entries(data) as [string, any[]][]).forEach(([key, items]) => {
          if (items.length === 0) return;
          
          csvLines.push(`\n# ${key.toUpperCase()}`);
          const headers = Object.keys(items[0]);
          csvLines.push(headers.join(","));
          
          items.forEach((item) => {
            const values = headers.map((h) => {
              const val = item[h];
              if (val === null || val === undefined) return "";
              return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvLines.push(values.join(","));
          });
        });

        return {
          format: "csv",
          data: csvLines.join("\n"),
          filename: `export_${input.entityType}_${new Date().toISOString().split('T')[0]}.csv`,
        };
      }
    }),

  importData: adminProcedure
    .input(z.object({
      entityType: z.enum(["municipalities", "regions", "organizations"]),
      data: z.string(),
      format: z.enum(["csv", "json"]),
      mode: z.enum(["replace", "merge"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDb();
      let parsedData: any[] = [];

      try {
        if (input.format === "json") {
          const jsonData = JSON.parse(input.data);
          parsedData = jsonData[input.entityType] || jsonData;
          if (!Array.isArray(parsedData)) {
            throw new Error("Invalid JSON format");
          }
        } else {
          // CSV parsing
          const lines = input.data.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
          if (lines.length < 2) throw new Error("Invalid CSV format");
          
          const headers = lines[0].split(",").map((h) => h.trim());
          parsedData = lines.slice(1).map((line) => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const obj: any = {};
            headers.forEach((header, idx) => {
              let value = values[idx]?.trim() || "";
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/""/g, '"');
              }
              obj[header] = value;
            });
            return obj;
          });
        }

        // Validate and import
        const table = input.entityType === "municipalities" ? municipalities :
                     input.entityType === "regions" ? regions : organizations;

        if (input.mode === "replace") {
          await db.delete(table);
        }

        for (const item of parsedData) {
          const { id, ...data } = item;
          if (input.mode === "merge" && id) {
            await db.update(table).set(data).where(eq(table.id, id));
          } else {
            await db.insert(table).values(data);
          }
        }

        await db.insert(updateHistory).values({
          entityType: input.entityType.slice(0, -1) as any,
          entityId: 0,
          entityName: `Bulk import (${parsedData.length} items)`,
          action: "create",
          changeType: "manual",
          changedBy: ctx.user.id,
        });

        return { success: true, imported: parsedData.length };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Import failed: ${error.message}`,
        });
      }
    }),
});
