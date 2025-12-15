import * as cheerio from "cheerio";

interface ScrapedEntity {
  name: string;
  status: "none" | "started" | "qa" | "connected" | "hubs";
}

interface DiggScrapedData {
  municipalities: ScrapedEntity[];
  regions: ScrapedEntity[];
  authorities: ScrapedEntity[];
  others: ScrapedEntity[];
}

const DIGG_URLS = {
  municipalities: "https://www.digg.se/saker-digital-kommunikation/vilka-ar-anslutna-till-sdk/anslutna-kommuner",
  regions: "https://www.digg.se/saker-digital-kommunikation/vilka-ar-anslutna-till-sdk/anslutna-regioner",
  authorities: "https://www.digg.se/saker-digital-kommunikation/vilka-ar-anslutna-till-sdk/anslutna-statliga-myndigheter",
  others: "https://www.digg.se/saker-digital-kommunikation/vilka-ar-anslutna-till-sdk/anslutna-ovriga-organisationer",
};

function mapStatusFromDigg(statusText: string): "none" | "started" | "qa" | "connected" | "hubs" {
  const lower = statusText.toLowerCase();
  if (lower.includes("påbörjat")) return "started";
  if (lower.includes("qa")) return "qa";
  if (lower.includes("ansluten")) return "connected";
  return "none";
}

async function scrapeTable(url: string): Promise<ScrapedEntity[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const entities: ScrapedEntity[] = [];
    
    // Find all table rows (skip header row)
    $("table tbody tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const name = $(cells[0]).text().trim();
        const statusText = $(cells[1]).text().trim();
        
        if (name) {
          entities.push({
            name,
            status: mapStatusFromDigg(statusText),
          });
        }
      }
    });
    
    return entities;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    throw error;
  }
}

export async function scrapeDiggData(): Promise<DiggScrapedData> {
  console.log("Starting DIGG scraping...");
  
  const [municipalities, regions, authorities, others] = await Promise.all([
    scrapeTable(DIGG_URLS.municipalities),
    scrapeTable(DIGG_URLS.regions),
    scrapeTable(DIGG_URLS.authorities),
    scrapeTable(DIGG_URLS.others),
  ]);
  
  console.log(`Scraped: ${municipalities.length} municipalities, ${regions.length} regions, ${authorities.length} authorities, ${others.length} others`);
  
  return {
    municipalities,
    regions,
    authorities,
    others,
  };
}

export async function checkDiggUpdates(): Promise<{ lastModified: string | null; contentHash: string }> {
  try {
    const response = await fetch(DIGG_URLS.municipalities, { method: "HEAD" });
    const lastModified = response.headers.get("last-modified");
    
    // For content hash, we'll fetch and hash the content
    const html = await (await fetch(DIGG_URLS.municipalities)).text();
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(html));
    const contentHash = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    return {
      lastModified,
      contentHash,
    };
  } catch (error) {
    console.error("Failed to check DIGG updates:", error);
    throw error;
  }
}
