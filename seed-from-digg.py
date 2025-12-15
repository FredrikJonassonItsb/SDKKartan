#!/usr/bin/env python3
"""
Seed database with complete data from DIGG and local mockData.
This script combines scraped DIGG data with manually curated coordinates for organizations.
"""
import json
import mysql.connector
import os
from datetime import datetime

# Load environment
DB_URL = os.getenv('DATABASE_URL', '')
# Parse mysql://user:pass@host:port/dbname?params
if DB_URL.startswith('mysql://'):
    DB_URL = DB_URL.replace('mysql://', '')
    auth, rest = DB_URL.split('@')
    user, password = auth.split(':')
    host_port, dbname_with_params = rest.split('/')
    host, port = host_port.split(':')
    # Remove query params from dbname
    dbname = dbname_with_params.split('?')[0]
else:
    raise ValueError("DATABASE_URL must be in format mysql://user:pass@host:port/dbname")

# Load scraped data
with open('/home/ubuntu/hubs_customer_map/scraped_municipalities.json', 'r', encoding='utf-8') as f:
    municipalities_data = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_regions.json', 'r', encoding='utf-8') as f:
    regions_data = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_authorities.json', 'r', encoding='utf-8') as f:
    authorities_data = json.load(f)

with open('/home/ubuntu/hubs_customer_map/scraped_others.json', 'r', encoding='utf-8') as f:
    others_data = json.load(f)

# Hubs-anslutna (manuell lista)
hubs_municipalities = [
    "Habo kommun", "Vaxholms kommun", "Vännäs kommun", "Sundbybergs kommun",
    "Trollhättan stad", "Solna stad", "Sundsvalls kommun", "Ånge kommun",
    "Hudiksvalls kommun", "Nordanstigs kommun"
]

hubs_authorities = ["Socialstyrelsen"]
hubs_others = ["Cityurologen"]

# Organization coordinates (manually curated)
org_coordinates = {
    "Socialstyrelsen": {"lat": "59.3293", "lon": "18.0686"},
    "Cityurologen": {"lat": "59.3293", "lon": "18.0686"},
    # Add more as needed
}

# Connect to database
conn = mysql.connector.connect(
    host=host,
    port=int(port),
    user=user,
    password=password,
    database=dbname
)
cursor = conn.cursor()

print("Seeding municipalities...")
for mun in municipalities_data:
    name = mun['name']
    status = 'hubs' if name in hubs_municipalities else mun['status']
    cursor.execute("""
        INSERT INTO municipalities (name, status) 
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE status = %s
    """, (name, status, status))

print(f"Inserted/updated {len(municipalities_data)} municipalities")

print("Seeding regions...")
for reg in regions_data:
    name = reg['name']
    status = reg['status']
    cursor.execute("""
        INSERT INTO regions (name, status) 
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE status = %s
    """, (name, status, status))

print(f"Inserted/updated {len(regions_data)} regions")

print("Seeding authorities...")
for auth in authorities_data:
    name = auth['name']
    status = 'hubs' if name in hubs_authorities else auth['status']
    coords = org_coordinates.get(name, {"lat": None, "lon": None})
    cursor.execute("""
        INSERT INTO organizations (name, type, status, latitude, longitude) 
        VALUES (%s, 'authority', %s, %s, %s)
        ON DUPLICATE KEY UPDATE status = %s, latitude = %s, longitude = %s
    """, (name, status, coords['lat'], coords['lon'], status, coords['lat'], coords['lon']))

print(f"Inserted/updated {len(authorities_data)} authorities")

print("Seeding other organizations...")
for org in others_data:
    name = org['name']
    status = 'hubs' if name in hubs_others else org['status']
    coords = org_coordinates.get(name, {"lat": None, "lon": None})
    cursor.execute("""
        INSERT INTO organizations (name, type, status, latitude, longitude) 
        VALUES (%s, 'other', %s, %s, %s)
        ON DUPLICATE KEY UPDATE status = %s, latitude = %s, longitude = %s
    """, (name, status, coords['lat'], coords['lon'], status, coords['lat'], coords['lon']))

print(f"Inserted/updated {len(others_data)} other organizations")

# Initialize system settings
print("Initializing system settings...")
cursor.execute("""
    INSERT INTO system_settings (`key`, `value`, description) 
    VALUES ('auto_sync_enabled', 'false', 'Enable automatic daily sync from DIGG')
    ON DUPLICATE KEY UPDATE `value` = `value`
""")

cursor.execute("""
    INSERT INTO system_settings (`key`, `value`, description) 
    VALUES ('last_digg_check', %s, 'Timestamp of last DIGG check')
    ON DUPLICATE KEY UPDATE `value` = `value`
""", (datetime.now().isoformat(),))

conn.commit()
cursor.close()
conn.close()

print("✅ Database seeding complete!")
