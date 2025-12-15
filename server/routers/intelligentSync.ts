import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { intelligentDiggSync } from "../lib/diggSync";

export const intelligentSyncRouter = router({
  /**
   * Kör intelligent DIGG-synkronisering med jämförelselogik
   * Returnerar detaljerad information om ändringar utan att applicera dem
   */
  analyzeChanges: adminProcedure
    .input(z.object({
      scrapedData: z.object({
        municipalities: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        regions: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        authorities: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        others: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await intelligentDiggSync(input.scrapedData, {
          userId: ctx.user.id,
          syncType: "manual",
          autoApply: false, // Bara analysera, applicera inte
          notifyOnChanges: false,
        });
        
        return {
          success: true,
          hasChanges: result.comparison.hasChanges,
          summary: result.comparison.summary,
          changes: result.comparison.changes,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze DIGG changes",
          cause: error,
        });
      }
    }),

  /**
   * Kör intelligent DIGG-synkronisering och applicera ändringar
   */
  syncWithNotification: adminProcedure
    .input(z.object({
      scrapedData: z.object({
        municipalities: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        regions: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        authorities: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
        others: z.array(z.object({
          name: z.string(),
          status: z.enum(["none", "started", "qa", "connected", "hubs"]),
        })),
      }),
      notifyOnChanges: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await intelligentDiggSync(input.scrapedData, {
          userId: ctx.user.id,
          syncType: "manual",
          autoApply: true, // Applicera ändringar
          notifyOnChanges: input.notifyOnChanges,
        });
        
        return {
          success: true,
          hasChanges: result.comparison.hasChanges,
          applied: result.applied,
          notificationSent: result.notificationSent,
          summary: result.comparison.summary,
          stats: result.stats,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync DIGG data",
          cause: error,
        });
      }
    }),
});
