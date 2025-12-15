import cron from 'node-cron';
import { getDb } from './db';
import { systemSettings, diggSyncLog } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Scheduler för automatisk DIGG-synkronisering
 * Kör dagligen kl 02:00 om auto-update är aktiverat
 */

export function startScheduler() {
  // Kör varje dag kl 02:00
  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Kontrollerar om automatisk DIGG-synkronisering ska köras...');
    
    try {
      const db = await getDb();
      if (!db) {
        console.log('[Scheduler] Databas ej tillgänglig');
        return;
      }

      // Hämta inställningar
      const settingsData = await db.select().from(systemSettings).where(eq(systemSettings.key, 'autoUpdate')).limit(1);
      
      if (settingsData.length === 0) {
        console.log('[Scheduler] Inga inställningar hittades, hoppar över');
        return;
      }

      const autoUpdate = settingsData[0].value === 'true';
      
      if (!autoUpdate) {
        console.log('[Scheduler] Automatisk uppdatering är avstängd');
        return;
      }

      console.log('[Scheduler] Automatisk uppdatering är aktiverad, startar DIGG-synkronisering...');
      
      // Importera och kör intelligent DIGG-synkronisering
      const { scrapeDiggData } = await import('./lib/diggScraper');
      const { intelligentDiggSync } = await import('./lib/diggSync');
      
      try {
        // Skrapa data från DIGG
        const scrapedData = await scrapeDiggData();
        
        // Kör intelligent synkronisering med jämförelselogik
        const result = await intelligentDiggSync(scrapedData, {
          syncType: 'scheduled',
          autoApply: true, // Applicera ändringar automatiskt
          notifyOnChanges: true, // Skicka notifiering vid ändringar
        });
        
        if (result.comparison.hasChanges) {
          console.log(`[Scheduler] ${result.comparison.summary.totalChanges} ändringar upptäcktes och applicerades`);
          console.log(`[Scheduler] Skapade: ${result.stats.created}, Uppdaterade: ${result.stats.updated}, Borttagna: ${result.stats.removed}`);
          console.log(`[Scheduler] Notifiering skickad: ${result.notificationSent}`);
        } else {
          console.log('[Scheduler] Inga ändringar upptäcktes');
        }
      } catch (syncError) {
        console.error('[Scheduler] Fel vid DIGG-synkronisering:', syncError);
        throw syncError;
      }
      
    } catch (error) {
      console.error('[Scheduler] Fel vid automatisk DIGG-synkronisering:', error);
      
      // Logga felet
      try {
        const db = await getDb();
        if (db) {
          await db.insert(diggSyncLog).values({
            syncType: 'scheduled',
            status: 'failed',
            municipalitiesUpdated: 0,
            regionsUpdated: 0,
            authoritiesUpdated: 0,
            othersUpdated: 0,
            errorMessage: error instanceof Error ? error.message : String(error),
            triggeredBy: null,
            createdAt: new Date()
          });
        }
      } catch (logError) {
        console.error('[Scheduler] Kunde inte logga fel:', logError);
      }
    }
  });

  console.log('[Scheduler] Schemalagd DIGG-synkronisering aktiverad (dagligen kl 02:00)');
}
