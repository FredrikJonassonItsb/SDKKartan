import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { updateHistory } from "../../drizzle/schema";
import { desc, and, eq, gte, lte, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const ensureDb = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
};

export const changeReportsRouter = router({
  /**
   * Hämta ändringshistorik med filtrering och sökning
   */
  getChangeHistory: adminProcedure
    .input(z.object({
      // Filtrering
      entityType: z.enum(["all", "municipality", "region", "organization"]).default("all"),
      changeType: z.enum(["all", "manual", "automatic"]).default("all"),
      action: z.enum(["all", "create", "update", "delete", "import", "digg_sync"]).default("all"),
      
      // Datumintervall
      startDate: z.string().optional(), // ISO date string
      endDate: z.string().optional(),   // ISO date string
      
      // Sökning
      searchQuery: z.string().optional(),
      
      // Paginering
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      // Bygg WHERE-klausul
      const conditions: any[] = [];
      
      // Filtrera per entitetstyp
      if (input.entityType !== "all") {
        conditions.push(eq(updateHistory.entityType, input.entityType as any));
      }
      
      // Filtrera per ändringstyp
      if (input.changeType !== "all") {
        conditions.push(eq(updateHistory.changeType, input.changeType as any));
      }
      
      // Filtrera per action
      if (input.action !== "all") {
        conditions.push(eq(updateHistory.action, input.action as any));
      }
      
      // Datumfiltrering
      if (input.startDate) {
        conditions.push(gte(updateHistory.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        const endDate = new Date(input.endDate);
        endDate.setHours(23, 59, 59, 999); // Inkludera hela dagen
        conditions.push(lte(updateHistory.createdAt, endDate));
      }
      
      // Sökning i entitetsnamn
      if (input.searchQuery && input.searchQuery.trim().length > 0) {
        conditions.push(like(updateHistory.entityName, `%${input.searchQuery.trim()}%`));
      }
      
      // Hämta data med filtrering
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const changes = await db
        .select()
        .from(updateHistory)
        .where(whereClause)
        .orderBy(desc(updateHistory.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      // Räkna totalt antal för paginering
      const countResult = await db
        .select()
        .from(updateHistory)
        .where(whereClause);
      
      return {
        changes,
        total: countResult.length,
        hasMore: countResult.length > input.offset + input.limit,
      };
    }),

  /**
   * Hämta statistik över ändringar
   */
  getChangeStatistics: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      // Bygg WHERE-klausul för datumfiltrering
      const conditions: any[] = [];
      if (input.startDate) {
        conditions.push(gte(updateHistory.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        const endDate = new Date(input.endDate);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(updateHistory.createdAt, endDate));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Hämta alla ändringar för statistik
      const allChanges = await db
        .select()
        .from(updateHistory)
        .where(whereClause);
      
      // Beräkna statistik
      const stats = {
        total: allChanges.length,
        byEntityType: {
          municipality: allChanges.filter(c => c.entityType === "municipality").length,
          region: allChanges.filter(c => c.entityType === "region").length,
          organization: allChanges.filter(c => c.entityType === "organization").length,
        },
        byChangeType: {
          manual: allChanges.filter(c => c.changeType === "manual").length,
          automatic: allChanges.filter(c => c.changeType === "automatic").length,
        },
        byAction: {
          create: allChanges.filter(c => c.action === "create").length,
          update: allChanges.filter(c => c.action === "update").length,
          delete: allChanges.filter(c => c.action === "delete").length,
          import: allChanges.filter(c => c.action === "import").length,
          digg_sync: allChanges.filter(c => c.action === "digg_sync").length,
        },
      };
      
      return stats;
    }),

  /**
   * Hämta ändringar för en specifik entitet
   */
  getEntityChangeHistory: adminProcedure
    .input(z.object({
      entityType: z.enum(["municipality", "region", "organization"]),
      entityId: z.number(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      const changes = await db
        .select()
        .from(updateHistory)
        .where(
          and(
            eq(updateHistory.entityType, input.entityType),
            eq(updateHistory.entityId, input.entityId)
          )
        )
        .orderBy(desc(updateHistory.createdAt))
        .limit(input.limit);
      
      return changes;
    }),
});
