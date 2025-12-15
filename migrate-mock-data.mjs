import { drizzle } from 'drizzle-orm/mysql2';
import { municipalities, regions, organizations } from './drizzle/schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

const mockData = {
  municipalities: [
    // Hubs-anslutna kommuner
    { name: "Habo kommun", status: "hubs" },
    { name: "Vaxholms kommun", status: "hubs" },
    { name: "Vännäs kommun", status: "hubs" },
    { name: "Sundbybergs kommun", status: "hubs" },
    { name: "Trollhättan stad", status: "hubs" },
    { name: "Solna stad", status: "hubs" },
    { name: "Sundsvalls kommun", status: "hubs" },
    { name: "Ånge kommun", status: "hubs" },
    { name: "Hudiksvalls kommun", status: "hubs" },
    { name: "Nordanstigs kommun", status: "hubs" },
    // Anslutna kommuner (exempel, lägg till fler från DIGG-data)
    { name: "Stockholm", status: "connected" },
    { name: "Göteborg", status: "connected" },
    { name: "Malmö", status: "connected" },
  ],
  regions: [
    { name: "Region Stockholm", status: "connected" },
    { name: "Västra Götalandsregionen", status: "connected" },
    { name: "Region Skåne", status: "connected" },
  ],
  organizations: [
    { name: "Socialstyrelsen", type: "authority", status: "hubs", latitude: "59.3293", longitude: "18.0686" },
    { name: "Cityurologen", type: "other", status: "hubs", latitude: "59.3293", longitude: "18.0686" },
  ]
};

async function migrate() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('Migrating municipalities...');
  for (const mun of mockData.municipalities) {
    await db.insert(municipalities).values(mun).onDuplicateKeyUpdate({ set: { status: mun.status } });
  }
  
  console.log('Migrating regions...');
  for (const reg of mockData.regions) {
    await db.insert(regions).values(reg).onDuplicateKeyUpdate({ set: { status: reg.status } });
  }
  
  console.log('Migrating organizations...');
  for (const org of mockData.organizations) {
    await db.insert(organizations).values(org).onDuplicateKeyUpdate({ set: { status: org.status, latitude: org.latitude, longitude: org.longitude } });
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
