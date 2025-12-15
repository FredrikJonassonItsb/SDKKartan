import { getDb } from "../db";
import { municipalities, regions, organizations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type StatusType = "none" | "started" | "qa" | "connected" | "hubs";

export interface EntityChange {
  type: "municipality" | "region" | "organization";
  changeType: "new" | "status_change" | "removed";
  entityName: string;
  entityId?: number;
  oldStatus?: StatusType;
  newStatus?: StatusType;
  organizationType?: "authority" | "other";
}

export interface ComparisonResult {
  hasChanges: boolean;
  changes: EntityChange[];
  summary: {
    newEntities: number;
    statusChanges: number;
    removedEntities: number;
    totalChanges: number;
  };
}

/**
 * Jämför skrapad DIGG-data med befintlig databas och identifierar ändringar
 */
export async function compareDiggData(scrapedData: {
  municipalities: Array<{ name: string; status: StatusType }>;
  regions: Array<{ name: string; status: StatusType }>;
  authorities: Array<{ name: string; status: StatusType }>;
  others: Array<{ name: string; status: StatusType }>;
}): Promise<ComparisonResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const changes: EntityChange[] = [];

  // Jämför kommuner
  const existingMunicipalities = await db.select().from(municipalities);
  const existingMunMap = new Map(existingMunicipalities.map(m => [m.name, m]));
  const scrapedMunNames = new Set(scrapedData.municipalities.map(m => m.name));

  // Nya och ändrade kommuner
  for (const scraped of scrapedData.municipalities) {
    const existing = existingMunMap.get(scraped.name);
    
    if (!existing) {
      changes.push({
        type: "municipality",
        changeType: "new",
        entityName: scraped.name,
        newStatus: scraped.status,
      });
    } else if (existing.status !== scraped.status) {
      changes.push({
        type: "municipality",
        changeType: "status_change",
        entityName: scraped.name,
        entityId: existing.id,
        oldStatus: existing.status,
        newStatus: scraped.status,
      });
    }
  }

  // Borttagna kommuner (finns i DB men inte i skrapad data)
  for (const existing of existingMunicipalities) {
    if (!scrapedMunNames.has(existing.name)) {
      changes.push({
        type: "municipality",
        changeType: "removed",
        entityName: existing.name,
        entityId: existing.id,
        oldStatus: existing.status,
      });
    }
  }

  // Jämför regioner
  const existingRegions = await db.select().from(regions);
  const existingRegMap = new Map(existingRegions.map(r => [r.name, r]));
  const scrapedRegNames = new Set(scrapedData.regions.map(r => r.name));

  for (const scraped of scrapedData.regions) {
    const existing = existingRegMap.get(scraped.name);
    
    if (!existing) {
      changes.push({
        type: "region",
        changeType: "new",
        entityName: scraped.name,
        newStatus: scraped.status,
      });
    } else if (existing.status !== scraped.status) {
      changes.push({
        type: "region",
        changeType: "status_change",
        entityName: scraped.name,
        entityId: existing.id,
        oldStatus: existing.status,
        newStatus: scraped.status,
      });
    }
  }

  for (const existing of existingRegions) {
    if (!scrapedRegNames.has(existing.name)) {
      changes.push({
        type: "region",
        changeType: "removed",
        entityName: existing.name,
        entityId: existing.id,
        oldStatus: existing.status,
      });
    }
  }

  // Jämför myndigheter
  const existingOrgs = await db.select().from(organizations);
  const existingAuthMap = new Map(
    existingOrgs.filter(o => o.type === "authority").map(o => [o.name, o])
  );
  const scrapedAuthNames = new Set(scrapedData.authorities.map(a => a.name));

  for (const scraped of scrapedData.authorities) {
    const existing = existingAuthMap.get(scraped.name);
    
    if (!existing) {
      changes.push({
        type: "organization",
        changeType: "new",
        entityName: scraped.name,
        newStatus: scraped.status,
        organizationType: "authority",
      });
    } else if (existing.status !== scraped.status) {
      changes.push({
        type: "organization",
        changeType: "status_change",
        entityName: scraped.name,
        entityId: existing.id,
        oldStatus: existing.status,
        newStatus: scraped.status,
        organizationType: "authority",
      });
    }
  }

  for (const existing of existingOrgs.filter(o => o.type === "authority")) {
    if (!scrapedAuthNames.has(existing.name)) {
      changes.push({
        type: "organization",
        changeType: "removed",
        entityName: existing.name,
        entityId: existing.id,
        oldStatus: existing.status,
        organizationType: "authority",
      });
    }
  }

  // Jämför övriga organisationer
  const existingOthersMap = new Map(
    existingOrgs.filter(o => o.type === "other").map(o => [o.name, o])
  );
  const scrapedOthersNames = new Set(scrapedData.others.map(o => o.name));

  for (const scraped of scrapedData.others) {
    const existing = existingOthersMap.get(scraped.name);
    
    if (!existing) {
      changes.push({
        type: "organization",
        changeType: "new",
        entityName: scraped.name,
        newStatus: scraped.status,
        organizationType: "other",
      });
    } else if (existing.status !== scraped.status) {
      changes.push({
        type: "organization",
        changeType: "status_change",
        entityName: scraped.name,
        entityId: existing.id,
        oldStatus: existing.status,
        newStatus: scraped.status,
        organizationType: "other",
      });
    }
  }

  for (const existing of existingOrgs.filter(o => o.type === "other")) {
    if (!scrapedOthersNames.has(existing.name)) {
      changes.push({
        type: "organization",
        changeType: "removed",
        entityName: existing.name,
        entityId: existing.id,
        oldStatus: existing.status,
        organizationType: "other",
      });
    }
  }

  // Beräkna sammanfattning
  const summary = {
    newEntities: changes.filter(c => c.changeType === "new").length,
    statusChanges: changes.filter(c => c.changeType === "status_change").length,
    removedEntities: changes.filter(c => c.changeType === "removed").length,
    totalChanges: changes.length,
  };

  return {
    hasChanges: changes.length > 0,
    changes,
    summary,
  };
}

/**
 * Formatera ändringar till läsbar text för notifieringar
 */
export function formatChangesForNotification(result: ComparisonResult): string {
  if (!result.hasChanges) {
    return "Inga ändringar upptäcktes i DIGG-data.";
  }

  const lines: string[] = [
    `🔔 DIGG-uppdatering: ${result.summary.totalChanges} ändringar upptäcktes`,
    "",
    `📊 Sammanfattning:`,
    `- Nya poster: ${result.summary.newEntities}`,
    `- Statusändringar: ${result.summary.statusChanges}`,
    `- Borttagna poster: ${result.summary.removedEntities}`,
    "",
  ];

  // Gruppera ändringar per typ
  const byType = {
    municipality: result.changes.filter(c => c.type === "municipality"),
    region: result.changes.filter(c => c.type === "region"),
    organization: result.changes.filter(c => c.type === "organization"),
  };

  if (byType.municipality.length > 0) {
    lines.push(`📍 Kommuner (${byType.municipality.length} ändringar):`);
    for (const change of byType.municipality.slice(0, 10)) {
      lines.push(formatSingleChange(change));
    }
    if (byType.municipality.length > 10) {
      lines.push(`  ... och ${byType.municipality.length - 10} fler`);
    }
    lines.push("");
  }

  if (byType.region.length > 0) {
    lines.push(`🗺️ Regioner (${byType.region.length} ändringar):`);
    for (const change of byType.region.slice(0, 10)) {
      lines.push(formatSingleChange(change));
    }
    if (byType.region.length > 10) {
      lines.push(`  ... och ${byType.region.length - 10} fler`);
    }
    lines.push("");
  }

  if (byType.organization.length > 0) {
    lines.push(`🏢 Organisationer (${byType.organization.length} ändringar):`);
    for (const change of byType.organization.slice(0, 10)) {
      lines.push(formatSingleChange(change));
    }
    if (byType.organization.length > 10) {
      lines.push(`  ... och ${byType.organization.length - 10} fler`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function formatSingleChange(change: EntityChange): string {
  const statusLabels: Record<StatusType, string> = {
    none: "Ej ansluten",
    started: "Påbörjat",
    qa: "QA",
    connected: "Ansluten",
    hubs: "Hubs",
  };

  switch (change.changeType) {
    case "new":
      return `  ✨ NY: ${change.entityName} (${statusLabels[change.newStatus!]})`;
    case "status_change":
      return `  🔄 ${change.entityName}: ${statusLabels[change.oldStatus!]} → ${statusLabels[change.newStatus!]}`;
    case "removed":
      return `  ❌ BORTTAGEN: ${change.entityName} (var ${statusLabels[change.oldStatus!]})`;
    default:
      return `  ${change.entityName}`;
  }
}
