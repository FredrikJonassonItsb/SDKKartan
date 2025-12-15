import re

file_path = '/home/ubuntu/hubs_customer_map/client/src/lib/mockData.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Lista över organisationer som ska ha status 'hubs'
hubs_orgs = [
    "Habo",
    "Vaxholms stad", # Notera: i mockData heter den "Vaxholms stad" (från DIGG) eller bara "Vaxholms"? Vi kollar matchning.
    "Vännäs",
    "Sundbybergs stad",
    "Trollhättans stad",
    "Solna stad",
    "Sundsvalls",
    "Ånge",
    "Hudiksvalls",
    "Nordanstigs",
    "Socialstyrelsen"
]

# Mapping för exakta namn i mockData om de skiljer sig lite från listan
name_mapping = {
    "Vaxholms kommun": "Vaxholms stad",
    "Vännäs kommun": "Vännäs",
    "Sundbybergs kommun": "Sundbybergs stad",
    "Trollhättan stad": "Trollhättans stad",
    "Sundsvalls kommun": "Sundsvalls",
    "Ånge kommun": "Ånge",
    "Hudisvalls kommun": "Hudiksvalls", # Stavfel i bilden "Hudisvalls" -> "Hudiksvalls"
    "Nordanstigs kommun": "Nordanstigs"
}

# Uppdatera status för varje organisation
for org in hubs_orgs:
    # Hantera namnvariationer
    search_name = org
    
    # Regex för att hitta raden: { ... name: "Namn", ... status: "..." }
    # Vi söker efter name: "Namn" och ersätter status på samma rad
    
    pattern = r'(name:\s*"' + re.escape(search_name) + r'",[^}]*status:\s*)"[^"]*"'
    replacement = r'\1"hubs"'
    
    # Kör replace
    content = re.sub(pattern, replacement, content)
    print(f"Updated status for {search_name} to 'hubs'")

# Lägg till Cityurologen manuellt om den inte finns (den fanns inte i DIGG-listan)
if "Cityurologen" not in content:
    # Hitta slutet av organizations-arrayen
    insert_pos = content.rfind('  ]')
    if insert_pos != -1:
        new_org = """    { id: "new_hubs_1", name: "Cityurologen", type: "other", status: "hubs", location: { lat: 59.3326, lng: 18.0649, city: "Stockholm" } },
"""
        content = content[:insert_pos] + new_org + content[insert_pos:]
        print("Added Cityurologen")

with open(file_path, 'w') as f:
    f.write(content)
