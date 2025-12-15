import json

# Läs in skrapad data
with open('/home/ubuntu/hubs_customer_map/scraped_municipalities.json', 'r') as f:
    municipalities = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_regions.json', 'r') as f:
    regions = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_authorities.json', 'r') as f:
    authorities = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_others.json', 'r') as f:
    others = json.load(f)

# Manuella koordinater för myndigheter och organisationer (approximativa för huvudkontor)
coords = {
    "Arbetsförmedlingen": {"lat": 59.3340, "lng": 18.0580, "city": "Stockholm"},
    "Försäkringskassan": {"lat": 59.3293, "lng": 18.0686, "city": "Stockholm"},
    "Inspektionen för vård och omsorg": {"lat": 59.3326, "lng": 18.0649, "city": "Stockholm"},
    "Polismyndigheten": {"lat": 59.3300, "lng": 18.0500, "city": "Stockholm"},
    "Rättsmedicinalverket": {"lat": 59.3400, "lng": 18.0700, "city": "Stockholm"},
    "Skolverket": {"lat": 59.3500, "lng": 18.0000, "city": "Solna"},
    "Socialstyrelsen": {"lat": 59.3350, "lng": 18.0200, "city": "Stockholm"},
    "Statens Institutionsstyrelse": {"lat": 59.3450, "lng": 18.0300, "city": "Solna"},
    "Capio AB": {"lat": 57.7089, "lng": 11.9746, "city": "Göteborg"},
    "Folktandvården Gävleborg AB": {"lat": 60.6749, "lng": 17.1413, "city": "Gävle"},
    "Hälsa Hemma Sverige AB": {"lat": 57.7000, "lng": 11.9600, "city": "Göteborg"},
    "Höglandsförbundet": {"lat": 57.6496, "lng": 14.9675, "city": "Eksjö"},
    "Introcentrum AB": {"lat": 59.3293, "lng": 18.0686, "city": "Stockholm"}, # Antagande
    "Kommunalförbundet ITSAM": {"lat": 57.9945, "lng": 15.6560, "city": "Kisa"},
    "Kunskapsförbundet Väst": {"lat": 58.2833, "lng": 12.2833, "city": "Trollhättan"},
    "Sveriges kommuner och regioner": {"lat": 59.3170, "lng": 18.0530, "city": "Stockholm"},
    "Unilabs AB": {"lat": 59.3293, "lng": 18.0686, "city": "Stockholm"} # Antagande
}

# Skapa TypeScript-innehåll
ts_content = """import { MapData } from "@/types/data";

// Uppdaterad data från DIGG (2025-12-14)
export const mockData: MapData = {
  municipalities: [
"""

# Lägg till kommuner
for i, m in enumerate(municipalities):
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
"""

# Lägg till myndigheter
for i, a in enumerate(authorities):
    a_id = f"auth{i:02d}"
    coord = coords.get(a["name"], {"lat": 59.3293, "lng": 18.0686, "city": "Stockholm"})
    ts_content += f'    {{ id: "{a_id}", name: "{a["name"]}", type: "authority", status: "{a["status"]}", location: {{ lat: {coord["lat"]}, lng: {coord["lng"]}, city: "{coord["city"]}" }} }},\n'

# Lägg till övriga organisationer
for i, o in enumerate(others):
    o_id = f"other{i:02d}"
    coord = coords.get(o["name"], {"lat": 59.3293, "lng": 18.0686, "city": "Stockholm"})
    ts_content += f'    {{ id: "{o_id}", name: "{o["name"]}", type: "other", status: "{o["status"]}", location: {{ lat: {coord["lat"]}, lng: {coord["lng"]}, city: "{coord["city"]}" }} }},\n'

ts_content += """  ]
};
"""

# Skriv till fil
with open('/home/ubuntu/hubs_customer_map/client/src/lib/mockData.ts', 'w') as f:
    f.write(ts_content)

print("mockData.ts updated successfully with all data")
