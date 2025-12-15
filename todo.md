# ITSL HubS Kunder - TODO

## Admingränssnitt
- [ ] Skapa admin-sida med autentisering
- [ ] CRUD-gränssnitt för kommuner
- [ ] CRUD-gränssnitt för regioner
- [ ] CRUD-gränssnitt för myndigheter
- [ ] CRUD-gränssnitt för övriga organisationer
- [ ] Import/Export-funktionalitet (CSV/JSON)
- [ ] DIGG-skrapning (manuell trigger)
- [ ] Schemalagd DIGG-kontroll (daglig)
- [ ] Inställning för automatisk uppdatering
- [ ] Historiktabell för alla uppdateringar
- [ ] Loggning av manuella ändringar
- [ ] Loggning av automatiska uppdateringar

## Databasschema
- [x] Tabell för kommuner
- [x] Tabell för regioner
- [x] Tabell för organisationer (myndigheter + övriga)
- [x] Tabell för uppdateringshistorik
- [x] Tabell för systeminställningar

## Backend
- [x] tRPC-procedurer för CRUD-operationer
- [ ] Backend-funktion för DIGG-skrapning
- [ ] Schemalagd jobb för daglig kontroll
- [ ] API för import/export
- [x] Loggningssystem (via updateHistory)

## Befintliga funktioner (klara)
- [x] Grundläggande kartvy
- [x] Filtrering på status
- [x] Visningslägen (Kommun, Region, Myndighet, Övriga)
- [x] Sökfunktion
- [x] Statistikpanel
- [x] Hubs-kategori

## Databasmigrering
- [x] Skapa databasschema
- [x] Migrera data från DIGG till databasen
- [x] Initiera systeminställningar

## Admingränssnitt - Genomfört
- [x] Skapa admin-sida med autentisering
- [x] Tabellvy för kommuner
- [x] Tabellvy för regioner
- [x] Tabellvy för organisationer
- [x] Historiktabell för alla uppdateringar
- [x] Inställningssida för automatisk uppdatering
- [ ] Fullständig CRUD-funktionalitet (create/update)
- [ ] Import/Export-funktionalitet (CSV/JSON)
- [ ] DIGG-skrapning (manuell trigger)
- [ ] Schemalagd DIGG-kontroll (daglig)

## Nya uppgifter (från användarfeedback)
- [ ] Fixa redigeringsfunktion för kommuner
- [ ] Lägg till redigeringsfunktion för regioner
- [ ] Dela upp organisationer i två separata flikar (Myndigheter och Övriga)
- [ ] Implementera Create-formulär för alla entiteter
- [ ] Implementera Update-formulär för alla entiteter
- [ ] Implementera DIGG-skrapningsfunktion i backend
- [ ] Koppla DIGG-skrapningsknapp till backend-funktionen

## CRUD-implementation (Genomförd)
- [x] Fixa redigeringsfunktion för kommuner
- [x] Lägg till redigeringsfunktion för regioner
- [x] Dela upp organisationer i två separata flikar (Myndigheter och Övriga)
- [x] Implementera Create-formulär för alla entiteter
- [x] Implementera Update-formulär för alla entiteter
- [x] Implementera Delete-funktionalitet för alla entiteter

## DIGG-skrapning (Genomförd)
- [x] Skapa diggScraper.ts-modul för att skrapa DIGG:s hemsida
- [x] Implementera scrapeDigg-procedur i backend
- [x] Skapa DiggSyncTab i admingränssnittet
- [x] Lägg till knapp för manuell synkronisering
- [x] Visa synkroniseringshistorik

## Bugfixar
- [x] Fixa latitude/longitude-validering i admin-formulär (konvertera nummer till sträng)

## Avancerad sökning och filtrering
- [ ] Lägg till sökfält i varje admintabell
- [ ] Implementera statusfilter (dropdown)
- [ ] Lägg till typfilter för organisationer (myndighet/övriga)
- [ ] Implementera sortering på kolumner

## Import/Export
- [x] Backend-procedur för export till CSV
- [x] Backend-procedur för export till JSON
- [x] Frontend-knapp för export i varje flik
- [x] Backend-procedur för import från CSV
- [x] Backend-procedur för import från JSON
- [x] Frontend-formulär för filuppladdning och import

## Schemalagd uppdatering
- [x] Skapa cron-jobb för daglig DIGG-kontroll
- [x] Implementera scheduler som kontrollerar autoUpdate-inställning
- [x] Integrera scheduler med server-start
- [x] Logga schemalagda körningar i diggSyncLog-tabellen
- [ ] Implementera jämförelselogik (detektera ändringar)
- [ ] Skicka notifiering vid ändringar (om aktiverat)
- [ ] Automatisk uppdatering (om aktiverat i inställningar)

## Intelligent jämförelselogik för DIGG-skrapning
- [x] Skapa jämförelsefunktion som detekterar ändringar mellan DIGG-data och databas
- [x] Kategorisera ändringar (nya poster, statusändringar, borttagna poster)
- [x] Implementera notifikationssystem för administratörer
- [x] Skapa detaljerad ändringsrapport i notifieringar
- [x] Integrera jämförelselogik med scheduler
- [x] Uppdatera DIGG-synkronisering för att använda jämförelselogik
- [x] Testa notifieringar vid olika typer av ändringar

## Ändringsrapporter-flik
- [x] Skapa backend-procedur för att hämta ändringshistorik från updateHistory
- [x] Implementera filtrering per entitetstyp, ändringstyp och datum
- [x] Skapa ChangeReportsTab-komponent med tidslinjevy
- [x] Lägg till sökfunktion för specifika entiteter
- [x] Implementera färgkodning och ikoner för olika ändringstyper
- [x] Visa detaljerad information (gamla → nya värden)
- [x] Lägg till ny flik i Admin-gränssnittet
- [x] Testa filtrering och sökning
