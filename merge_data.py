import json
import re

# Läs in skrapad data
with open('/home/ubuntu/hubs_customer_map/scraped_municipalities.json', 'r') as f:
    municipalities = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_regions.json', 'r') as f:
    regions = json.load(f)

# Skapa TypeScript-innehåll
ts_content = """import { MapData } from "@/types/data";

// Uppdaterad data från DIGG (2025-12-14)
export const mockData: MapData = {
  municipalities: [
"""

# Lägg till kommuner
for i, m in enumerate(municipalities):
    # Generera ett dummy-ID om vi inte har ett riktigt
    m_id = f"m{i:04d}"
    ts_content += f'    {{ id: "{m_id}", name: "{m["name"]}", status: "{m["status"]}" }},\n'

ts_content += """  ],
  regions: [
"""

# Lägg till regioner
for i, r in enumerate(regions):
    r_id = f"r{i:02d}"
    ts_content += f'    {{ id: "{r_id}", name: "{r["name"]}", status: "{r["status"]}" }},\n'

ts_content += """  ],
  organizations: [
    { 
      id: "org1", 
      name: "Försäkringskassan", 
      type: "authority", 
      status: "connected", 
      location: { lat: 59.3293, lng: 18.0686, city: "Stockholm" } 
    },
    { 
      id: "org2", 
      name: "Skatteverket", 
      type: "authority", 
      status: "connected", 
      location: { lat: 59.3326, lng: 18.0649, city: "Stockholm" } 
    },
    { 
      id: "org3", 
      name: "Arbetsförmedlingen", 
      type: "authority", 
      status: "qa", 
      location: { lat: 59.3340, lng: 18.0580, city: "Stockholm" } 
    },
    { 
      id: "org4", 
      name: "Bolagsverket", 
      type: "authority", 
      status: "connected", 
      location: { lat: 62.3908, lng: 17.3069, city: "Sundsvall" } 
    },
    { 
      id: "org5", 
      name: "Transportstyrelsen", 
      type: "authority", 
      status: "started", 
      location: { lat: 58.5884, lng: 16.1883, city: "Norrköping" } 
    },
  ]
};
"""

# Skriv till fil
with open('/home/ubuntu/hubs_customer_map/client/src/lib/mockData.ts', 'w') as f:
    f.write(ts_content)

print("mockData.ts updated successfully")
