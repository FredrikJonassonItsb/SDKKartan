# ITSL SDKKartan - Installationsguide

**Version**: 1.0.0  
**Datum**: 2025-01-15

---

## Översikt

ITSL SDKKartan är ett WordPress-plugin som integrerar den interaktiva kartan över anslutna kommuner och organisationer till ITSL HubS SDK-plattformen på din WordPress-webbplats.

## Snabbinstallation

### Steg 1: Ladda upp pluginet

1. Logga in på WordPress admin (itsl.se/wp-admin)
2. Gå till **Plugins → Lägg till nytt**
3. Klicka på **Ladda upp plugin** (knappen högst upp)
4. Välj filen `itsl-sdkkartan.zip`
5. Klicka på **Installera nu**
6. När installationen är klar, klicka på **Aktivera plugin**

### Steg 2: Verifiera installation

Efter aktivering sker följande automatiskt:

- En ny sida skapas på `/karta` med kartan inbäddad
- En ny meny "SDKKartan" läggs till i WordPress admin
- Standardinställningar konfigureras

Besök `itsl.se/karta` för att verifiera att kartan visas korrekt.

### Steg 3: Lägg till i navigation

1. Gå till **Utseende → Menyer**
2. Under "Sidor", hitta "Karta" och markera den
3. Klicka på **Lägg till i meny**
4. Dra "Karta" till önskad position i menyn
5. Klicka på **Spara meny**

---

## Användning

### Shortcodes

Använd shortcodes för att visa kartan på valfri sida eller inlägg:

| Shortcode | Beskrivning |
|-----------|-------------|
| `[sdkkartan]` | Visar hela kartan med standardinställningar |
| `[sdkkartan height="500px"]` | Kartan med anpassad höjd |
| `[sdkkartan show_header="no"]` | Kartan utan rubrik och beskrivning |
| `[sdkkartan title="Min rubrik"]` | Kartan med anpassad rubrik |
| `[sdkkartan_stats]` | Endast statistik (antal kommuner, etc.) |
| `[sdkkartan_stats style="cards"]` | Statistik i kortformat |
| `[sdkkartan_stats style="inline"]` | Statistik på en rad |

### Widget

Pluginet inkluderar en widget för sidofält:

1. Gå till **Utseende → Widgets**
2. Hitta "ITSL SDKKartan" i listan
3. Dra widgeten till önskat widget-område
4. Konfigurera titel och visningsalternativ
5. Klicka på **Spara**

---

## Inställningar

Gå till **SDKKartan → Inställningar** för att konfigurera pluginet:

### Allmänna inställningar

**SDKKartan URL**  
URL till SDKKartan-applikationen. Standardvärdet pekar på den officiella installationen. Ändra endast om du har en egen installation.

### Visningsinställningar

**Karta höjd**  
Standardhöjd för kartan. Kan anges i pixlar (t.ex. `700px`) eller viewport-enheter (t.ex. `80vh`).

**Visa rubrik**  
Om aktiverat visas en rubrik och beskrivning ovanför kartan.

**Anpassad CSS**  
Lägg till egen CSS för att anpassa kartans utseende. Exempel:

```css
.itsl-sdkkartan-container {
    border: 2px solid #0073aa;
    border-radius: 8px;
}

.itsl-sdkkartan-title {
    color: #0073aa;
}
```

---

## Admin Dashboard

Gå till **SDKKartan → Dashboard** för att se:

- **Snabbåtgärder**: Länkar till kartan, admin-gränssnitt och inställningar
- **Shortcodes**: Kopiera shortcodes med ett klick
- **Förhandsvisning**: Se hur kartan ser ut
- **Status**: Plugin-version, karta-URL, och systeminfo
- **Support**: Kontaktinformation och dokumentation

---

## Felsökning

### Kartan visas inte

1. Kontrollera att SDKKartan URL är korrekt i inställningarna
2. Verifiera att kartan är åtkomlig genom att besöka URL:en direkt
3. Kontrollera webbläsarens konsol för JavaScript-fel
4. Rensa WordPress-cache om du använder caching-plugin

### Karta-sidan saknas

1. Avaktivera och återaktivera pluginet
2. Alternativt, skapa en ny sida manuellt och lägg till `[sdkkartan]`

### Statistik visas inte korrekt

1. Statistik cachas i 1 timme - vänta eller rensa cache
2. Kontrollera att SDKKartan API är åtkomligt

### Stilkonflikter med tema

Använd anpassad CSS i inställningarna för att överskriva tema-stilar:

```css
.itsl-sdkkartan-container {
    /* Dina anpassningar här */
}
```

---

## Uppdatering

### Manuell uppdatering

1. Ladda ner ny version av `itsl-sdkkartan.zip`
2. Gå till **Plugins → Installerade plugins**
3. Avaktivera "ITSL SDKKartan"
4. Radera pluginet (data bevaras)
5. Ladda upp och aktivera ny version

### Automatisk uppdatering

Framtida versioner kommer stödja automatiska uppdateringar via WordPress.

---

## Avinstallation

1. Gå till **Plugins → Installerade plugins**
2. Avaktivera "ITSL SDKKartan"
3. Klicka på **Radera**

Vid radering tas plugin-inställningar bort. Karta-sidan bevaras och kan raderas manuellt om önskat.

---

## Support

Behöver du hjälp? Kontakta oss:

- **E-post**: support@itsl.se
- **Telefon**: +46 (0) 70 330 11 89
- **Webbplats**: https://itsl.se

---

## Teknisk information

- **Kräver WordPress**: 5.0 eller senare
- **Kräver PHP**: 7.4 eller senare
- **Testad med WordPress**: 6.4
- **Licens**: GPL v2 eller senare

---

*ITSL SDKKartan v1.0.0 - Utvecklad av ITSL Solutions*
