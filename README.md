# SDKKartan - ITSL HubS Kunder

Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattformen.

## Översikt

SDKKartan är en modern webbapplikation som visualiserar vilka svenska kommuner, regioner, myndigheter och övriga organisationer som är anslutna till ITSL Solutions HubS-plattform för säker digital kommunikation (SDK). Applikationen erbjuder både en publik kartvy och ett omfattande admin-gränssnitt för datahantering.

## Funktioner

### Publik kartvy
- **Interaktiv Google Maps-integration** - Visualiserar anslutna kommuner och organisationer på en karta över Sverige
- **Statistik** - Visar antal anslutna kommuner, regioner, myndigheter och övriga organisationer
- **Sökfunktion** - Sök efter specifika kommuner eller organisationer
- **Responsiv design** - Fungerar på desktop, tablet och mobil

### Admin-gränssnitt
- **Datahantering** - CRUD-operationer för kommuner, regioner, myndigheter och övriga organisationer
- **DIGG-skrapning** - Automatisk hämtning av data från DIGG:s hemsida
- **Intelligent jämförelselogik** - Detekterar ändringar mellan DIGG-data och databas
- **Notifieringar** - Automatiska notiser till administratörer vid ändringar
- **Import/Export** - Stöd för CSV och JSON-format
- **Ändringsrapporter** - Tidslinje med historik över alla ändringar
- **Schemalagd uppdatering** - Daglig automatisk DIGG-synkronisering kl 02:00
- **Användarautentisering** - Säker inloggning för admin-funktioner

## Teknisk stack

### Frontend
- **React 19** - Modern UI-framework
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Komponentbibliotek
- **Wouter** - Lightweight routing
- **Google Maps API** - Kartintegration via Manus proxy
- **tRPC Client** - Type-safe API-kommunikation

### Backend
- **Node.js 22.13.0** - Runtime
- **Express** - Webbserver
- **tRPC** - Type-safe API
- **Drizzle ORM** - Databas-ORM
- **MySQL** - Databas
- **node-cron** - Schemaläggning
- **Cheerio** - Web scraping

### DevOps
- **Vite** - Build tool och dev server
- **TypeScript** - Type safety
- **PM2** - Process management (rekommenderat för produktion)

## Installation

### Förutsättningar
- Node.js 22.x eller senare
- MySQL 8.0 eller senare
- pnpm (rekommenderat) eller npm

### Steg 1: Klona repositoryt
```bash
git clone https://github.com/FredrikJonassonItsb/SDKKartan.git
cd SDKKartan
```

### Steg 2: Installera dependencies
```bash
pnpm install
```

### Steg 3: Konfigurera miljövariabler
Skapa en `.env`-fil i projektets rot med följande variabler:

```env
# Databas
DATABASE_URL=mysql://user:password@localhost:3306/sdkkartan

# JWT för autentisering
JWT_SECRET=your-secret-key-here

# OAuth (om använt)
OAUTH_SERVER_URL=https://your-oauth-server.com
OWNER_OPEN_ID=your-owner-id

# Google Maps (via Manus proxy)
VITE_FRONTEND_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api-url.com

# App-konfiguration
VITE_APP_TITLE=ITSL HubS Kunder - Interaktiv Karta
VITE_APP_LOGO=/logo.png
```

### Steg 4: Skapa databas och kör migrationer
```bash
# Skapa databas
mysql -u root -p -e "CREATE DATABASE sdkkartan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Kör migrationer
pnpm db:push
```

### Steg 5: (Valfritt) Seed databas med initial data
```bash
# Kör DIGG-skrapning för att hämta initial data
node seed-from-digg.py
```

### Steg 6: Starta utvecklingsserver
```bash
pnpm dev
```

Applikationen är nu tillgänglig på `http://localhost:3000`

## Produktion

### Bygg för produktion
```bash
pnpm build
```

### Starta produktionsserver
```bash
pnpm start
```

### Process management med PM2
```bash
# Installera PM2 globalt
npm install -g pm2

# Starta applikationen
pm2 start server/index.ts --name sdkkartan

# Spara PM2-konfiguration
pm2 save

# Konfigurera autostart
pm2 startup systemd
```

## Databas-schema

Applikationen använder följande huvudtabeller:

- **municipalities** - Svenska kommuner med status och koordinater
- **regions** - Svenska regioner
- **authorities** - Myndigheter
- **otherOrganizations** - Övriga organisationer
- **users** - Användare för admin-gränssnittet
- **settings** - Applikationsinställningar
- **updateHistory** - Historik över alla ändringar
- **diggSyncLog** - Logg över DIGG-synkroniseringar

Se `drizzle/schema.ts` för fullständigt schema.

## API-dokumentation

Applikationen använder tRPC för type-safe API-kommunikation. Huvudsakliga routers:

- **municipalities** - CRUD för kommuner
- **regions** - CRUD för regioner
- **authorities** - CRUD för myndigheter
- **others** - CRUD för övriga organisationer
- **admin** - Admin-funktioner (DIGG-skrapning, inställningar, historik)
- **auth** - Autentisering och användarhantering
- **intelligentSync** - Intelligent DIGG-synkronisering
- **changeReports** - Ändringsrapporter

## Säkerhet

- **Autentisering** - JWT-baserad autentisering för admin-funktioner
- **Behörighetskontroll** - Endast autentiserade användare kan nå admin-endpoints
- **SQL Injection-skydd** - Drizzle ORM parametriserar alla queries
- **XSS-skydd** - React saniterar automatiskt output
- **CORS** - Konfigurerat för säker cross-origin-kommunikation
- **Rate limiting** - Rekommenderas att implementera i reverse proxy (Nginx)

## Deployment

Se `docs/itsl_kartintegration_utredning.md` för detaljerad guide om hur man integrerar SDKKartan på en WordPress-sajt med olika alternativ:

1. **Reverse Proxy (Nginx)** - Rekommenderad lösning
2. iFrame-integration
3. WordPress Plugin
4. Custom Page Template
5. Separat subdomain

## Utveckling

### Projektstruktur
```
SDKKartan/
├── client/              # Frontend React-applikation
│   ├── public/          # Statiska filer
│   └── src/
│       ├── components/  # React-komponenter
│       ├── contexts/    # React contexts
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Utilities
│       └── pages/       # Sidor
├── server/              # Backend Node.js-applikation
│   ├── routers/         # tRPC routers
│   ├── lib/             # Backend utilities
│   └── _core/           # Core server-funktionalitet
├── shared/              # Delad kod mellan frontend och backend
├── drizzle/             # Databas-schema och migrationer
└── docs/                # Dokumentation
```

### Kodstil
- TypeScript för type safety
- ESLint för linting
- Prettier för formatering (rekommenderat)

### Tester
```bash
# Kör tester
pnpm test

# Kör tester i watch-läge
pnpm test:watch
```

## Bidra

Bidrag är välkomna! Vänligen:

1. Forka repositoryt
2. Skapa en feature branch (`git checkout -b feature/amazing-feature`)
3. Committa dina ändringar (`git commit -m 'Add some amazing feature'`)
4. Pusha till branchen (`git push origin feature/amazing-feature`)
5. Öppna en Pull Request

## Licens

Copyright © 2025 ITSL Solutions. Alla rättigheter förbehållna.

## Support

För frågor eller support, kontakta:
- **Email**: info@itsl.se
- **Webbplats**: https://itsl.se
- **Telefon**: +46 (0) 70 330 11 89

## Författare

Utvecklad för ITSL Solutions av Manus AI.

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial release
- Publik kartvy med Google Maps-integration
- Komplett admin-gränssnitt
- DIGG-skrapning och intelligent jämförelselogik
- Import/Export-funktionalitet
- Ändringsrapporter med tidslinje
- Schemalagd automatisk uppdatering
- Notifieringssystem för administratörer
