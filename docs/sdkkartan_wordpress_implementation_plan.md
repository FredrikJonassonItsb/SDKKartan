# Implementationsplan: SDKKartan på itsl.se

**Datum**: 2025-01-15  
**Författare**: Manus AI  
**Version**: 1.0  
**Status**: Utkast för godkännande

---

## Sammanfattning

Detta dokument beskriver en detaljerad implementationsplan för att integrera SDKKartan som en WordPress-app på ITSL Solutions webbplats (itsl.se). Planen baseras på den rekommenderade Reverse Proxy-lösningen från den tekniska utredningen och är strukturerad i fem huvudfaser över cirka sex veckor. Implementationen möjliggör att kartapplikationen körs på samma server som WordPress med URL-strukturen itsl.se/karta, vilket ger optimal SEO, säkerhet och användarupplevelse.

**Estimerad tid**: 6 veckor (64 arbetstimmar)  
**Estimerad kostnad**: Utveckling + eventuell server-uppgradering  
**Risk-nivå**: Medel (hanteras genom noggrann staging och testning)

---

## 1. Projektöversikt och mål

### 1.1 Projektmål

ITSL Solutions behöver en professionell och lättillgänglig visualisering av vilka kommuner och organisationer som är anslutna till HubS SDK-plattformen. SDKKartan ska integreras på itsl.se för att ge potentiella och befintliga kunder en tydlig översikt över plattformens spridning och användning inom svensk offentlig sektor.

Huvudmålen med implementationen är att skapa en sömlös integration mellan WordPress och kartapplikationen, säkerställa hög prestanda och säkerhet, samt etablera en underhållbar lösning som kan växa med verksamheten. Lösningen ska följa ITSL Solutions värderingar kring öppen källkod, säkerhet och kontroll över data.

### 1.2 Framgångskriterier

Projektet anses framgångsrikt när följande kriterier är uppfyllda:

**Tekniska kriterier**: Kartapplikationen laddas på mindre än tre sekunder från itsl.se/karta. Systemet uppnår minst 99.9% uptime under den första månaden efter lansering. Alla funktioner i både publik kartvy och admin-gränssnitt fungerar felfritt. Inga säkerhetsincidenter rapporteras under första kvartalet.

**Användarkriterier**: Besökare på itsl.se hittar enkelt till kartan via huvudnavigationen. Sökfunktionen ger relevanta resultat inom en sekund. Admin-gränssnittet är intuitivt och kräver minimal utbildning. Mobil-upplevelsen är lika bra som desktop-versionen.

**Affärskriterier**: Kartan används aktivt i säljprocesser för att visa plattformens spridning. Positiv feedback erhålls från minst 80% av användarna. Support-ärenden relaterade till "vilka kommuner som är anslutna" minskar med minst 50%. Kartan bidrar till ökad trovärdighet och synlighet för HubS-plattformen.

### 1.3 Omfattning

**Inkluderat i projektet**:

Implementationen omfattar installation och konfiguration av Node.js-runtime och PM2 process manager på produktionsservern. Nginx konfigureras som reverse proxy för att dirigera trafik mellan WordPress och SDKKartan. En separat MySQL-databas skapas och migreras med produktionsdata. Miljövariabler och secrets konfigureras säkert. SSL-certifikat utökas för att täcka både WordPress och kartapplikationen.

WordPress-integration inkluderar skapande av en ny sida för kartan, uppdatering av huvudnavigation och menyer, samt grundläggande SEO-optimering. Omfattande testning genomförs i staging-miljö innan produktionsdeploy. Monitoring och logging sätts upp för både WordPress och Node.js-processer. Komplett dokumentation skapas för drift-team inklusive utbildningsmaterial.

**Exkluderat från projektet**:

Projektet inkluderar inte djup integration mellan WordPress-användarsystem och SDKKartans admin-autentisering (kan läggas till i fas 2). Utveckling av nya funktioner utöver befintlig funktionalitet ingår ej. Migration till ny hosting-leverantör eller server-uppgradering hanteras separat om det visar sig nödvändigt. Redesign av itsl.se eller större WordPress-uppdateringar ligger utanför scope.

---

## 2. Teknisk arkitektur

### 2.1 Arkitekturöversikt

Den valda arkitekturen bygger på Nginx som reverse proxy mellan internet och de två applikationerna. När en användare besöker itsl.se hanteras requesten av Nginx som analyserar URL-mönstret. Requests till root-domänen (itsl.se/) dirigeras till WordPress via PHP-FPM, medan requests till itsl.se/karta proxyas till Node.js-applikationen som lyssnar på localhost:3000.

Denna arkitektur ger flera fördelar. Användaren upplever en enhetlig domän utan att behöva navigera till subdomäner eller externa sajter. Ett enda SSL-certifikat täcker både WordPress och kartapplikationen. Node.js-applikationen exponeras aldrig direkt mot internet, vilket ökar säkerheten. Nginx kan implementera caching, rate limiting och andra optimeringar centralt.

### 2.2 Komponentöversikt

**Nginx (Reverse Proxy)**: Fungerar som ingångspunkt för all HTTP/HTTPS-trafik. Hanterar SSL-terminering och dirigerar requests baserat på URL-mönster. Kan konfigurera caching för statiska assets och implementera rate limiting för att skydda mot DDoS-attacker.

**WordPress (PHP-FPM)**: Befintlig WordPress-installation fortsätter att hantera huvudsajten. En ny sida skapas för att länka till kartapplikationen. Navigation uppdateras för att inkludera länk till kartan. Ingen större modifiering av WordPress-kärnan krävs.

**SDKKartan (Node.js + Express)**: Kartapplikationen körs som en separat Node.js-process managerad av PM2. Lyssnar på localhost:3000 och är endast åtkomlig via Nginx reverse proxy. React-frontend serveras som statiska filer från dist-mappen. tRPC API hanterar all backend-logik och databas-kommunikation.

**MySQL-databas**: En delad MySQL-instans används med separata databaser för WordPress och SDKKartan. Varje applikation har sin egen databas-användare med begränsade behörigheter. Detta förenklar backup-strategier och resurshantering samtidigt som säkerhet upprätthålls genom separation.

### 2.3 Dataflöde

Ett typiskt användarscenario illustrerar dataflödet. Användaren besöker itsl.se och navigerar till "Karta" i huvudmenyn. Nginx tar emot requesten till itsl.se/karta och proxar den till Node.js-applikationen på localhost:3000. Node.js serverar React-frontend som statiska filer. React-applikationen gör API-anrop till tRPC-endpoints via samma domän (itsl.se/karta/api). tRPC-backend hämtar data från MySQL-databasen och returnerar JSON-svar. React renderar kartan med data från API:et.

För admin-funktioner krävs autentisering. Användaren loggar in via admin-gränssnittet som validerar credentials mot databasen. En JWT-token genereras och sparas i browser. Alla efterföljande API-anrop inkluderar JWT-token i headers. Backend validerar token innan känsliga operationer tillåts.

### 2.4 Säkerhetsarkitektur

Säkerheten bygger på flera lager. Nginx fungerar som första försvarslinje och kan konfigurera rate limiting, IP-blocklisting och andra skyddsmekanismer. Node.js-applikationen exponeras aldrig direkt mot internet utan är endast åtkomlig via localhost. JWT-tokens används för autentisering med kort livstid (1-24 timmar). Databas-användare har minimala behörigheter enligt principle of least privilege.

All kommunikation sker över HTTPS med moderna TLS-versioner. Känsliga miljövariabler (JWT_SECRET, DATABASE_URL) lagras säkert och exponeras aldrig i frontend-kod. CORS konfigureras strikt för att endast tillåta requests från itsl.se. Drizzle ORM parametriserar alla SQL-queries för att förhindra SQL injection. React saniterar automatiskt output för att skydda mot XSS-attacker.

---

## 3. Fas 1: Förberedelse och planering

**Varaktighet**: 1 vecka  
**Arbetstimmar**: 8 timmar  
**Ansvarig**: Teknisk projektledare + Systemadministratör

### 3.1 Mål och leveranser

Denna fas syftar till att säkerställa att alla förutsättningar är på plats innan implementation påbörjas. Målet är att identifiera och lösa potentiella blockerare tidigt, samt skapa en solid grund för resten av projektet.

**Leveranser**: Komplett inventering av server-specifikationer och hosting-miljö. Verifiering att Node.js 22.x kan installeras och köras. Backup av befintlig WordPress-installation och databas. Godkänd projektplan och tidsplan. Identifierade risker och mitigeringsstrategier.

### 3.2 Aktiviteter

**Aktivitet 1.1: Inventera server-infrastruktur (2 timmar)**

Kontakta hosting-leverantören för att få fullständig information om server-specifikationer. Dokumentera CPU, RAM, disk-utrymme och nätverkskapacitet. Verifiera att servern kör ett operativsystem som stödjer Node.js 22.x (Linux-baserat system rekommenderat). Kontrollera vilken webbserver som används (Nginx eller Apache) och vilken version.

Identifiera befintlig resursanvändning för WordPress. Använd verktyg som `top`, `htop` eller hosting-leverantörens kontrollpanel för att se CPU och RAM-användning under normal drift. Detta ger baseline för att bedöma om servern har tillräcklig kapacitet för att även köra SDKKartan.

**Aktivitet 1.2: Verifiera Node.js-support (2 timmar)**

Kontakta hosting-leverantören för att bekräfta att Node.js kan installeras och köras. Vissa managed WordPress-hosting-leverantörer har restriktioner som förhindrar custom runtime-miljöer. Om Node.js inte stöds måste alternativ hosting-lösning utredas.

Om möjligt, testa att installera Node.js i en test-miljö eller via SSH. Verifiera att PM2 kan installeras och köras. Kontrollera att nödvändiga portar (3000 eller annan vald port) är tillgängliga och inte blockerade av firewall.

**Aktivitet 1.3: Backup och säkerhetskopia (2 timmar)**

Skapa fullständig backup av WordPress-installation inklusive alla filer (themes, plugins, uploads) och databas. Testa att backupen kan återställas i en separat miljö för att verifiera integritet. Dokumentera backup-processen och spara backup-filer på säker plats (helst off-site).

Skapa snapshot av server-konfiguration inklusive Nginx/Apache-konfiguration, PHP-version, och installerade paket. Detta möjliggör snabb återställning om något går fel under implementationen.

**Aktivitet 1.4: Planera underhållsfönster (1 timme)**

Identifiera lämpligt datum och tid för produktionsdeploy. Välj en period med låg trafik (t.ex. helg eller kväll) för att minimera påverkan på användare. Kommunicera planerat underhållsfönster till relevanta intressenter.

Förbered kommunikation till användare om eventuell nedtid eller begränsad tillgänglighet. Skapa en enkel "underhåll pågår"-sida som kan visas om något går fel.

**Aktivitet 1.5: Riskanalys och mitigering (1 timme)**

Genomför en strukturerad riskanalys baserat på identifierade risker i analysunderlaget. För varje risk, definiera sannolikhet, påverkan och mitigeringsåtgärder. Prioritera risker och skapa handlingsplan för de mest kritiska.

Särskilt fokus bör läggas på risken att servern inte har tillräcklig kapacitet, att hosting-leverantören inte stödjer Node.js, och att det uppstår kompatibilitetsproblem mellan WordPress och SDKKartan.

### 3.3 Checklista Fas 1

- [ ] Server-specifikationer dokumenterade (CPU, RAM, disk)
- [ ] Hosting-leverantör kontaktad och Node.js-support verifierad
- [ ] Webbserver-typ och version identifierad (Nginx/Apache)
- [ ] Befintlig resursanvändning (WordPress) mätt och dokumenterad
- [ ] Fullständig WordPress-backup skapad och testad
- [ ] Server-konfiguration dokumenterad
- [ ] Underhållsfönster planerat och kommunicerat
- [ ] Riskanalys genomförd och dokumenterad
- [ ] Projektplan godkänd av beslutsfattare
- [ ] Budget och resurser allokerade

### 3.4 Beslutspunkter

**Beslut 1.1: Fortsätt med befintlig server eller uppgradera?**

Om server-inventeringen visar att befintlig server har mindre än 4GB RAM eller hög befintlig belastning, rekommenderas uppgradering innan implementation. Detta beslut måste tas innan Fas 2 påbörjas.

**Beslut 1.2: Fortsätt med befintlig hosting eller migrera?**

Om hosting-leverantören inte stödjer Node.js eller har andra begränsningar som förhindrar implementation, måste beslut tas om migration till ny hosting-leverantör. Detta kan förlänga projektet med 2-4 veckor.

---

## 4. Fas 2: Staging-miljö och testning

**Varaktighet**: 2 veckor  
**Arbetstimmar**: 24 timmar  
**Ansvarig**: Systemadministratör + Backend-utvecklare

### 4.1 Mål och leveranser

Fas 2 syftar till att skapa en komplett staging-miljö som speglar produktionsmiljön. Detta möjliggör säker testning och validering av alla komponenter innan deployment till produktion. Målet är att identifiera och lösa alla tekniska problem i staging innan de når produktionsmiljön.

**Leveranser**: Fullt funktionell staging-miljö med WordPress och SDKKartan. Nginx konfigurerad som reverse proxy i staging. SDKKartan deployad och körande under PM2. Testrapport som dokumenterar alla testfall och resultat. Identifierade buggar och lösningar dokumenterade.

### 4.2 Aktiviteter

**Aktivitet 2.1: Sätt upp staging-server (4 timmar)**

Skapa en staging-miljö som speglar produktionsmiljön så nära som möjligt. Detta kan vara en separat server, en virtuell maskin, eller en subdomain på befintlig server (t.ex. staging.itsl.se). Installera samma version av operativsystem, webbserver, PHP och MySQL som produktionsmiljön.

Kopiera WordPress-installation från produktion till staging. Detta inkluderar alla filer och en kopia av databasen. Uppdatera wp-config.php för att peka på staging-databas och URL. Verifiera att WordPress fungerar korrekt i staging-miljön.

**Aktivitet 2.2: Installera Node.js och dependencies (3 timmar)**

Installera Node.js 22.x på staging-servern. Använd officiella installationsmetoder (t.ex. NodeSource repository för Debian/Ubuntu). Verifiera installation genom att köra `node --version` och `npm --version`.

Installera PM2 globalt med `npm install -g pm2`. Verifiera att PM2 fungerar genom att starta en enkel test-applikation. Konfigurera PM2 att starta automatiskt vid server-omstart genom `pm2 startup systemd`.

Installera pnpm globalt med `npm install -g pnpm`. Detta är pakethanteraren som SDKKartan använder och ger snabbare installationer än npm.

**Aktivitet 2.3: Konfigurera Nginx reverse proxy (4 timmar)**

Skapa en ny Nginx server block-konfiguration för staging-miljön. Konfigurationen ska dirigera requests till root-domänen till WordPress och requests till /karta till Node.js-applikationen på localhost:3000.

Exempel på Nginx-konfiguration:

```nginx
server {
    listen 80;
    server_name staging.itsl.se;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.itsl.se;
    
    ssl_certificate /etc/ssl/certs/staging.itsl.se.crt;
    ssl_certificate_key /etc/ssl/private/staging.itsl.se.key;
    
    # WordPress (huvudsajt)
    location / {
        root /var/www/staging.itsl.se;
        index index.php index.html;
        try_files $uri $uri/ /index.php?$args;
    }
    
    # Node.js kartapplikation
    location /karta {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        
        # CORS headers (om nödvändigt)
        add_header Access-Control-Allow-Origin "https://staging.itsl.se" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
    
    # PHP-hantering för WordPress
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm/www.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Säkerhet: Blockera åtkomst till känsliga filer
    location ~ /\.ht {
        deny all;
    }
    
    location ~ /\.git {
        deny all;
    }
}
```

Testa Nginx-konfigurationen med `nginx -t` innan reload. Om testet lyckas, ladda om Nginx med `systemctl reload nginx` eller `service nginx reload`.

**Aktivitet 2.4: Deploya SDKKartan till staging (5 timmar)**

Klona SDKKartan-repositoryt från GitHub till staging-servern:

```bash
cd /var/www
git clone https://github.com/FredrikJonassonItsb/SDKKartan.git sdkkartan
cd sdkkartan
```

Installera dependencies med pnpm:

```bash
pnpm install
```

Skapa en `.env`-fil med staging-miljövariabler:

```env
# Databas
DATABASE_URL=mysql://sdkkartan_user:password@localhost:3306/sdkkartan_staging

# JWT för autentisering
JWT_SECRET=staging-secret-key-change-in-production

# OAuth (om använt)
OAUTH_SERVER_URL=https://oauth-staging.itsl.se
OWNER_OPEN_ID=staging-owner-id

# Google Maps (via Manus proxy)
VITE_FRONTEND_FORGE_API_KEY=staging-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api-url.com

# App-konfiguration
VITE_APP_TITLE=ITSL HubS Kunder - Staging
VITE_APP_LOGO=/logo.png
NODE_ENV=production
PORT=3000
```

Skapa staging-databas och kör migrationer:

```bash
mysql -u root -p -e "CREATE DATABASE sdkkartan_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'sdkkartan_user'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON sdkkartan_staging.* TO 'sdkkartan_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

pnpm db:push
```

Bygg produktionsversionen av frontend:

```bash
pnpm build
```

Starta applikationen med PM2:

```bash
pm2 start server/index.ts --name sdkkartan-staging
pm2 save
```

Verifiera att applikationen körs genom att besöka https://staging.itsl.se/karta i webbläsare.

**Aktivitet 2.5: Seed staging-databas med testdata (2 timmar)**

Populera staging-databasen med testdata för att möjliggöra realistisk testning. Detta kan göras genom att köra seed-scripts eller importera data från produktion (om sådan finns).

Om produktionsdata finns, exportera från produktion och importera till staging:

```bash
# På produktionsserver
mysqldump -u root -p sdkkartan_prod > sdkkartan_prod_backup.sql

# Kopiera till staging och importera
mysql -u sdkkartan_user -p sdkkartan_staging < sdkkartan_prod_backup.sql
```

Om ingen produktionsdata finns, använd DIGG-skrapning för att hämta initial data:

```bash
cd /var/www/sdkkartan
python3 seed-from-digg.py
```

Skapa minst en admin-användare för testning av admin-gränssnittet.

**Aktivitet 2.6: Omfattande testning (6 timmar)**

Genomför systematisk testning av alla funktioner i staging-miljön. Använd en testplan som täcker alla kritiska användarflöden och edge cases.

**Funktionalitetstestning**:
- Verifiera att publik kartvy laddas och visar korrekt data
- Testa sökfunktionen med olika söktermer
- Verifiera att statistik uppdateras korrekt
- Testa navigation mellan olika vyer
- Verifiera att alla länkar fungerar

**Admin-gränssnittstestning**:
- Testa inloggning med korrekta och felaktiga credentials
- Verifiera CRUD-operationer för kommuner, regioner, myndigheter
- Testa DIGG-skrapning och synkronisering
- Verifiera import/export-funktionalitet
- Testa ändringsrapporter och historik
- Verifiera notifikationssystem

**Prestanda-testning**:
- Mät sidladdningstider för olika vyer
- Testa applikationen under simulerad last (t.ex. med Apache Bench eller Artillery)
- Verifiera att API-endpoints svarar inom acceptabla tider
- Kontrollera minnesanvändning och CPU-belastning

**Säkerhetstestning**:
- Försök komma åt admin-endpoints utan autentisering
- Testa SQL injection i sökfält och formulär
- Verifiera att känsliga endpoints är skyddade
- Kontrollera att HTTPS används för all kommunikation
- Verifiera CORS-konfiguration

**Kompatibilitetstestning**:
- Testa i olika webbläsare (Chrome, Firefox, Safari, Edge)
- Testa på olika enheter (desktop, tablet, mobil)
- Verifiera responsiv design på olika skärmstorlekar
- Testa med olika nätverksförhållanden (snabbt/långsamt)

Dokumentera alla testresultat i en testrapport. För varje identifierad bugg, skapa en issue i GitHub och prioritera baserat på allvarlighetsgrad.

### 4.3 Checklista Fas 2

- [ ] Staging-server uppsatt och konfigurerad
- [ ] WordPress kopierad till staging och fungerar
- [ ] Node.js 22.x installerad och verifierad
- [ ] PM2 installerad och konfigurerad
- [ ] pnpm installerad
- [ ] Nginx reverse proxy konfigurerad och testad
- [ ] SSL-certifikat för staging konfigurerat
- [ ] SDKKartan-repository klonat
- [ ] Dependencies installerade (pnpm install)
- [ ] .env-fil skapad med staging-variabler
- [ ] Staging-databas skapad och migrerad
- [ ] Testdata seedat i databas
- [ ] Frontend byggd (pnpm build)
- [ ] Applikation startad med PM2
- [ ] Publik kartvy fungerar och visar data
- [ ] Admin-gränssnitt åtkomligt och fungerar
- [ ] Alla funktioner testade enligt testplan
- [ ] Prestanda-testning genomförd
- [ ] Säkerhetstestning genomförd
- [ ] Kompatibilitetstestning genomförd
- [ ] Testrapport skapad och dokumenterad
- [ ] Identifierade buggar fixade eller dokumenterade

### 4.4 Beslutspunkter

**Beslut 2.1: Är staging-miljön tillräckligt stabil för att fortsätta?**

Om kritiska buggar identifieras i staging måste dessa fixas innan fortsättning till Fas 3. Mindre buggar kan dokumenteras och hanteras senare, men applikationen måste vara grundläggande funktionell.

**Beslut 2.2: Behövs prestanda-optimeringar innan produktion?**

Om prestanda-testning visar att laddningstider eller API-svarstider är för långa, måste optimeringar göras. Detta kan inkludera databas-indexering, caching, eller kod-optimeringar.

---

## 5. Fas 3: WordPress-integration

**Varaktighet**: 1 vecka  
**Arbetstimmar**: 8 timmar  
**Ansvarig**: WordPress-utvecklare + Frontend-utvecklare

### 5.1 Mål och leveranser

Fas 3 fokuserar på att integrera SDKKartan i WordPress-sajten så att användare enkelt kan hitta och navigera till kartan. Målet är att skapa en sömlös användarupplevelse där kartan känns som en naturlig del av itsl.se.

**Leveranser**: Ny WordPress-sida för kartan med SEO-optimering. Uppdaterad huvudnavigation med länk till kartan. Breadcrumbs och intern länkning konfigurerad. (Valfritt) WordPress-plugin för djupare integration. Dokumentation av WordPress-ändringar.

### 5.2 Aktiviteter

**Aktivitet 3.1: Skapa WordPress-sida för kartan (2 timmar)**

Logga in i WordPress admin-gränssnittet och skapa en ny sida med titeln "Karta" eller "Anslutna kommuner". Välj en sidmall som passar (t.ex. "Full Width" för att ge kartan maximalt utrymme).

Sidinnehållet kan vara minimalt eftersom huvudfunktionaliteten hanteras av SDKKartan. Lägg till en kort introduktionstext som förklarar vad kartan visar:

> "Upptäck vilka svenska kommuner, regioner och organisationer som är anslutna till ITSL HubS SDK-plattform för säker digital kommunikation. Kartan uppdateras kontinuerligt och visar aktuell status för alla anslutningar."

Lägg till en "Visa karta"-knapp som länkar till /karta. Alternativt kan hela sidan redirecta direkt till /karta, men en introduktionssida ger bättre SEO och användarkontext.

Konfigurera SEO-inställningar för sidan (om Yoast SEO eller liknande plugin används):
- **Meta-titel**: "Karta över anslutna kommuner | ITSL HubS"
- **Meta-beskrivning**: "Interaktiv karta som visar vilka svenska kommuner och organisationer som är anslutna till ITSL HubS SDK-plattform för säker digital kommunikation."
- **Fokus-nyckelord**: "HubS karta", "anslutna kommuner", "SDK Sverige"

Publicera sidan och verifiera att den är åtkomlig.

**Aktivitet 3.2: Uppdatera huvudnavigation (1 timme)**

Navigera till Utseende → Menyer i WordPress admin. Lägg till den nyss skapade "Karta"-sidan i huvudmenyn. Placera den på en logisk plats, t.ex. mellan "Lösningar" och "Bolaget" eller som sista menyalternativ.

Om menyn har undermeny-struktur, överväg att placera "Karta" under "Hubs" eller "Lösningar" för att visa att det är en del av HubS-erbjudandet.

Testa navigationen på både desktop och mobil för att säkerställa att länken är lättillgänglig och tydlig. Överväg att använda en ikon (t.ex. en kartpin) för att göra menyalternativet mer visuellt.

**Aktivitet 3.3: Konfigurera intern länkning (1 timme)**

Uppdatera relevanta sidor på itsl.se för att inkludera länkar till kartan. Detta förbättrar både användarupplevelse och SEO.

**Sidor att uppdatera**:
- **Hubs-produktsidan**: Lägg till en sektion som länkar till kartan med text som "Se vilka kommuner som redan är anslutna"
- **Om-sidan**: Inkludera en mening om plattformens spridning med länk till kartan
- **Kontakt/Demo-sidan**: Referera till kartan som bevis på plattformens användning

Lägg till en widget i sidofältet (om sådan finns) med en "Snabblänk till karta"-knapp. Detta gör kartan åtkomlig från alla sidor på sajten.

**Aktivitet 3.4: SEO-optimering (2 timmar)**

Konfigurera structured data (schema.org markup) för kartsidan för att hjälpa sökmotorer förstå innehållet. Använd Schema.org typ "WebApplication" eller "Map".

Exempel på JSON-LD structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ITSL HubS Karta",
  "description": "Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattform",
  "url": "https://itsl.se/karta",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "SEK"
  },
  "provider": {
    "@type": "Organization",
    "name": "ITSL Solutions",
    "url": "https://itsl.se"
  }
}
```

Lägg till denna JSON-LD i WordPress-sidans HTML (kan göras via Yoast SEO eller custom HTML-block).

Skapa en XML sitemap-entry för kartsidan (de flesta SEO-plugins gör detta automatiskt). Verifiera att kartsidan inkluderas i sitemap.xml.

Uppdatera robots.txt för att säkerställa att /karta är tillåten för crawling:

```
User-agent: *
Allow: /karta
```

Skicka in uppdaterad sitemap till Google Search Console för snabbare indexering.

**Aktivitet 3.5: (Valfritt) Skapa WordPress-plugin för djupare integration (2 timmar)**

Om djupare integration önskas kan ett enkelt WordPress-plugin skapas. Detta plugin kan:
- Registrera en shortcode för att bädda in kartvy på andra sidor
- Skapa en widget för sidofält
- Lägga till admin-menyer som länkar till SDKKartans admin-gränssnitt
- Hantera SSO mellan WordPress och SDKKartan (framtida funktion)

Exempel på enkel plugin-struktur:

```php
<?php
/**
 * Plugin Name: ITSL HubS Karta Integration
 * Description: Integrerar SDKKartan med WordPress
 * Version: 1.0.0
 * Author: ITSL Solutions
 */

// Registrera shortcode
function itsl_karta_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '600px',
        'width' => '100%'
    ), $atts);
    
    return sprintf(
        '<iframe src="/karta" width="%s" height="%s" frameborder="0"></iframe>',
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
}
add_shortcode('itsl_karta', 'itsl_karta_shortcode');

// Lägg till admin-meny
function itsl_karta_admin_menu() {
    add_menu_page(
        'HubS Karta',
        'HubS Karta',
        'manage_options',
        'itsl-karta',
        'itsl_karta_admin_page',
        'dashicons-location-alt',
        30
    );
}
add_action('admin_menu', 'itsl_karta_admin_menu');

function itsl_karta_admin_page() {
    echo '<h1>HubS Karta Admin</h1>';
    echo '<p><a href="/karta/admin" target="_blank" class="button button-primary">Öppna Karta Admin</a></p>';
}
```

Detta plugin är valfritt och kan utvecklas vidare i framtiden baserat på behov.

### 5.3 Checklista Fas 3

- [ ] WordPress-sida "Karta" skapad och publicerad
- [ ] Introduktionstext och beskrivning tillagd
- [ ] SEO-inställningar konfigurerade (titel, beskrivning, nyckelord)
- [ ] Huvudnavigation uppdaterad med länk till kartan
- [ ] Navigation testad på desktop och mobil
- [ ] Intern länkning från relevanta sidor tillagd
- [ ] Structured data (schema.org) konfigurerad
- [ ] Sitemap uppdaterad och skickad till Google Search Console
- [ ] robots.txt verifierad
- [ ] (Valfritt) WordPress-plugin skapat och testat
- [ ] Alla WordPress-ändringar dokumenterade

### 5.4 Beslutspunkter

**Beslut 3.1: Ska WordPress-plugin utvecklas nu eller senare?**

Ett WordPress-plugin ger djupare integration men kräver extra utvecklingstid. Beslut måste tas om detta ska ingå i initial release eller utvecklas som fas 2-funktion.

**Beslut 3.2: Ska SSO mellan WordPress och SDKKartan implementeras?**

Single Sign-On mellan WordPress-användare och SDKKartans admin-gränssnitt förbättrar användarupplevelsen men ökar komplexiteten. Detta kan implementeras senare om behov uppstår.

---

## 6. Fas 4: Produktionsdeploy

**Varaktighet**: 1 vecka  
**Arbetstimmar**: 16 timmar  
**Ansvarig**: Systemadministratör + DevOps-ansvarig

### 6.1 Mål och leveranser

Fas 4 är den kritiska fasen där SDKKartan deployeras till produktionsmiljön. Målet är att genomföra en säker och kontrollerad deployment med minimal påverkan på befintliga användare av itsl.se.

**Leveranser**: SDKKartan körande i produktion på itsl.se/karta. Nginx konfigurerad för produktion med SSL. Monitoring och logging aktiverat. Backup-rutiner etablerade. Dokumentation för drift-team. Kommunikation till användare om ny funktion.

### 6.2 Aktiviteter

**Aktivitet 4.1: Förbered produktionsserver (3 timmar)**

Installera Node.js 22.x på produktionsservern enligt samma process som i staging. Installera PM2 och pnpm globalt. Konfigurera PM2 för autostart vid server-omstart.

Skapa produktionsdatabas:

```bash
mysql -u root -p -e "CREATE DATABASE sdkkartan_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'sdkkartan_prod'@'localhost' IDENTIFIED BY 'strong-production-password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON sdkkartan_prod.* TO 'sdkkartan_prod'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

Generera starka produktions-secrets för JWT_SECRET och andra känsliga variabler. Använd verktyg som `openssl rand -hex 32` för att generera kryptografiskt säkra nycklar.

**Aktivitet 4.2: Deploya SDKKartan till produktion (4 timmar)**

Klona SDKKartan-repositoryt till produktionsservern:

```bash
cd /var/www
git clone https://github.com/FredrikJonassonItsb/SDKKartan.git sdkkartan-prod
cd sdkkartan-prod
```

Skapa produktions `.env`-fil med korrekta värden. **Viktigt**: Använd starka passwords och secrets. Sätt `NODE_ENV=production`.

Installera dependencies och bygg:

```bash
pnpm install --prod
pnpm build
```

Migrera databas:

```bash
pnpm db:push
```

Om produktionsdata finns (från tidigare system eller export), importera den nu:

```bash
mysql -u sdkkartan_prod -p sdkkartan_prod < production_data.sql
```

Annars, seed initial data från DIGG:

```bash
python3 seed-from-digg.py
```

Starta applikationen med PM2:

```bash
pm2 start server/index.ts --name sdkkartan-prod --env production
pm2 save
pm2 startup systemd
```

Verifiera att applikationen körs:

```bash
pm2 status
pm2 logs sdkkartan-prod
curl http://localhost:3000/karta
```

**Aktivitet 4.3: Konfigurera Nginx för produktion (3 timmar)**

Uppdatera Nginx-konfigurationen för itsl.se för att inkludera reverse proxy till SDKKartan. Detta är en kritisk operation som måste göras noggrant för att inte bryta befintlig WordPress-funktionalitet.

Backup befintlig Nginx-konfiguration:

```bash
cp /etc/nginx/sites-available/itsl.se /etc/nginx/sites-available/itsl.se.backup
```

Redigera Nginx-konfigurationen för att lägga till SDKKartan-location block. Se exempel i Fas 2, men använd produktionsdomän (itsl.se) och produktions-SSL-certifikat.

Viktiga konfigurationsdetaljer för produktion:
- Använd HTTP/2 för bättre prestanda
- Konfigurera SSL med moderna cipher suites
- Lägg till security headers (HSTS, X-Frame-Options, etc.)
- Konfigurera rate limiting för att skydda mot DDoS
- Aktivera gzip-komprimering för statiska assets

Exempel på security headers:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Testa Nginx-konfigurationen:

```bash
nginx -t
```

Om testet lyckas, ladda om Nginx:

```bash
systemctl reload nginx
```

Verifiera att både WordPress och SDKKartan är åtkomliga:

```bash
curl -I https://itsl.se
curl -I https://itsl.se/karta
```

**Aktivitet 4.4: SSL-certifikat och HTTPS (2 timmar)**

Om Let's Encrypt används, förnya certifikatet för att inkludera /karta-sökvägen (detta sker automatiskt om certifikatet täcker hela domänen).

Verifiera SSL-konfiguration med verktyg som SSL Labs (https://www.ssllabs.com/ssltest/). Sikta på A+ rating.

Konfigurera automatisk certifikat-förnyelse:

```bash
certbot renew --dry-run
```

Testa att HTTPS fungerar för både WordPress och SDKKartan. Verifiera att HTTP redirectar till HTTPS.

**Aktivitet 4.5: Monitoring och logging (2 timmar)**

Konfigurera PM2 monitoring:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

Konfigurera Nginx access och error logging:

```nginx
access_log /var/log/nginx/itsl.se-access.log combined;
error_log /var/log/nginx/itsl.se-error.log warn;
```

Sätt upp logrotation för Nginx-loggar:

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

Konfigurera monitoring av server-resurser (CPU, RAM, disk) med verktyg som Netdata, Prometheus, eller hosting-leverantörens monitoring.

Sätt upp alerts för kritiska händelser:
- Node.js-process kraschar
- Hög CPU eller RAM-användning
- Disk-utrymme lågt
- SSL-certifikat går ut snart
- Onormalt många 500-fel

**Aktivitet 4.6: Backup-rutiner (2 timmar)**

Konfigurera automatiska dagliga backups av SDKKartan-databasen:

```bash
# /usr/local/bin/backup-sdkkartan.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sdkkartan"
mkdir -p $BACKUP_DIR

mysqldump -u sdkkartan_prod -p'password' sdkkartan_prod | gzip > $BACKUP_DIR/sdkkartan_$DATE.sql.gz

# Behåll endast 30 dagars backups
find $BACKUP_DIR -name "sdkkartan_*.sql.gz" -mtime +30 -delete
```

Lägg till i crontab för daglig körning kl 02:00:

```bash
0 2 * * * /usr/local/bin/backup-sdkkartan.sh
```

Verifiera att backups fungerar och kan återställas:

```bash
# Testa återställning i separat test-databas
mysql -u root -p -e "CREATE DATABASE sdkkartan_test;"
gunzip < /var/backups/sdkkartan/sdkkartan_latest.sql.gz | mysql -u root -p sdkkartan_test
mysql -u root -p -e "DROP DATABASE sdkkartan_test;"
```

Konfigurera off-site backup (t.ex. till S3, Google Cloud Storage, eller annan remote location) för disaster recovery.

### 6.3 Checklista Fas 4

- [ ] Node.js installerad på produktionsserver
- [ ] PM2 och pnpm installerade
- [ ] Produktionsdatabas skapad
- [ ] Starka produktions-secrets genererade
- [ ] SDKKartan-repository klonat till produktion
- [ ] Dependencies installerade (pnpm install --prod)
- [ ] Frontend byggd (pnpm build)
- [ ] .env-fil skapad med produktionsvärden
- [ ] Databas migrerad (pnpm db:push)
- [ ] Produktionsdata importerad eller seedat
- [ ] Applikation startad med PM2
- [ ] PM2 konfigurerad för autostart
- [ ] Nginx-konfiguration backupad
- [ ] Nginx uppdaterad med reverse proxy för /karta
- [ ] Security headers konfigurerade
- [ ] Rate limiting konfigurerat
- [ ] Nginx-konfiguration testad och reloaded
- [ ] SSL-certifikat verifierat och fungerar
- [ ] HTTPS fungerar för både WordPress och SDKKartan
- [ ] HTTP redirectar till HTTPS
- [ ] PM2 monitoring och logrotation konfigurerat
- [ ] Nginx logging konfigurerat
- [ ] Server-monitoring aktiverat
- [ ] Alerts konfigurerade för kritiska händelser
- [ ] Automatiska databas-backups konfigurerade
- [ ] Backup-återställning testad
- [ ] Off-site backup konfigurerat
- [ ] Dokumentation för drift-team skapad

### 6.4 Beslutspunkter

**Beslut 4.1: Är produktionsdeploy framgångsrik?**

Efter deployment, övervaka systemet noga under första timmarna. Om kritiska problem uppstår, var beredd att rollback till tidigare tillstånd genom att inaktivera Nginx reverse proxy och stoppa PM2-processen.

**Beslut 4.2: Ska soft launch eller full launch genomföras?**

Överväg att göra en soft launch där kartan är åtkomlig men inte aktivt marknadsförd. Detta ger tid att identifiera och fixa eventuella problem innan full lansering med marknadsföring.

---

## 7. Fas 5: Optimering och dokumentation

**Varaktighet**: 2 veckor (pågående)  
**Arbetstimmar**: 8 timmar initial + löpande  
**Ansvarig**: Hela teamet

### 7.1 Mål och leveranser

Fas 5 fokuserar på att optimera prestanda, samla användarfeedback, och säkerställa att drift-teamet har all nödvändig dokumentation och utbildning för att underhålla systemet långsiktigt.

**Leveranser**: Prestanda-optimeringar baserade på verklig användning. Komplett drift-dokumentation. Utbildningsmaterial för drift-team. Användarfeedback samlad och analyserad. Plan för framtida förbättringar.

### 7.2 Aktiviteter

**Aktivitet 5.1: Prestanda-optimering (3 timmar)**

Analysera verklig prestanda-data från produktionsmiljön under första veckan. Använd verktyg som Google PageSpeed Insights, Lighthouse, och server-monitoring för att identifiera flaskhalsar.

**Potentiella optimeringar**:

**Frontend-optimeringar**:
- Implementera code splitting för att minska initial bundle size
- Lazy load komponenter som inte behövs vid första sidladdning
- Optimera bilder (komprimering, modern format som WebP)
- Implementera service worker för offline-funktionalitet
- Använd React.memo för att förhindra onödiga re-renders

**Backend-optimeringar**:
- Lägg till databas-index på ofta queried kolumner
- Implementera query caching för statisk data
- Optimera tRPC-procedures för att minimera databas-anrop
- Implementera connection pooling för databas
- Överväg Redis för session-storage och caching

**Nginx-optimeringar**:
- Konfigurera caching för statiska assets
- Aktivera gzip-komprimering för text-baserade filer
- Implementera HTTP/2 server push för kritiska resurser
- Konfigurera browser caching headers
- Överväg CDN för statiska assets om global trafik förväntas

**Aktivitet 5.2: Skapa drift-dokumentation (3 timmar)**

Skapa omfattande dokumentation för drift-teamet som täcker alla aspekter av SDKKartans drift och underhåll.

**Dokumentation ska inkludera**:

**Översikt och arkitektur**:
- Systemöversikt och komponentdiagram
- Dataflöde och integration med WordPress
- Teknisk stack och versioner
- Säkerhetsarkitektur

**Daglig drift**:
- Hur man startar/stoppar SDKKartan
- Hur man läser och tolkar loggar
- Hur man övervakar prestanda och hälsa
- Hur man verifierar att backups fungerar

**Vanliga problem och lösningar**:
- Node.js-process kraschar → Kontrollera PM2-loggar, starta om med `pm2 restart sdkkartan-prod`
- Hög minnesanvändning → Kontrollera för memory leaks, överväg att öka server-RAM
- Databas-anslutning misslyckas → Verifiera DATABASE_URL, kontrollera MySQL-status
- Nginx 502 Bad Gateway → Verifiera att Node.js-process körs på rätt port
- CORS-fel → Kontrollera Nginx CORS-headers och SDKKartan CORS-konfiguration

**Underhåll och uppdateringar**:
- Hur man uppdaterar SDKKartan till ny version
- Hur man uppdaterar Node.js
- Hur man uppdaterar dependencies (pnpm update)
- Hur man kör databas-migrationer
- Hur man testar uppdateringar i staging innan produktion

**Säkerhet**:
- Hur man roterar JWT_SECRET och andra secrets
- Hur man hanterar säkerhetsuppdateringar
- Hur man övervakar för säkerhetsincidenter
- Kontaktinformation för säkerhetsrapportering

**Backup och återställning**:
- Hur man verifierar att backups fungerar
- Hur man återställer från backup
- Disaster recovery-plan
- RTO (Recovery Time Objective) och RPO (Recovery Point Objective)

**Aktivitet 5.3: Utbilda drift-team (1 timme)**

Genomför en utbildningssession med drift-teamet där dokumentationen gås igenom och praktiska övningar genomförs.

**Utbildningsagenda**:
1. Översikt av SDKKartan och integration med WordPress (15 min)
2. Demonstration av vanliga drift-uppgifter (20 min)
   - Kontrollera status med PM2
   - Läsa loggar
   - Starta om applikationen
   - Verifiera backup
3. Genomgång av vanliga problem och lösningar (15 min)
4. Frågor och svar (10 min)

Spela in utbildningssessionen för framtida referens och för nya teammedlemmar.

**Aktivitet 5.4: Samla användarfeedback (1 timme)**

Implementera ett enkelt feedback-system för att samla användaråsikter om kartan. Detta kan vara:
- En feedback-knapp i kartgränssnittet som öppnar ett formulär
- Google Analytics eller liknande för att spåra användarbeteende
- Enkät skickad till utvalda användare efter en vecka

Analysera feedback och identifiera förbättringsområden. Prioritera baserat på påverkan och implementationskostnad.

**Aktivitet 5.5: Planera framtida förbättringar (1 timme)**

Baserat på användarfeedback, prestanda-data och teamets erfarenheter, skapa en roadmap för framtida förbättringar.

**Potentiella framtida funktioner**:
- SSO-integration mellan WordPress och SDKKartan admin
- Export av kartvy som PDF eller bild
- Avancerad filtrering och gruppering i kartvy
- Historisk vy som visar hur anslutningar utvecklats över tid
- API för externa system att hämta data
- Notifikationer via e-post vid DIGG-ändringar
- Integrering med CRM-system
- Multi-språk-support (engelska)

Prioritera funktioner och skapa issues i GitHub för varje planerad förbättring.

### 7.3 Checklista Fas 5

- [ ] Prestanda-data från produktion analyserad
- [ ] Identifierade flaskhalsar dokumenterade
- [ ] Prestanda-optimeringar implementerade och testade
- [ ] Drift-dokumentation skapad och granskad
- [ ] Utbildningssession genomförd med drift-team
- [ ] Utbildning inspelad för framtida referens
- [ ] Feedback-system implementerat
- [ ] Användarfeedback samlad och analyserad
- [ ] Roadmap för framtida förbättringar skapad
- [ ] GitHub issues skapade för planerade förbättringar
- [ ] Post-mortem genomförd för att identifiera lärdomar
- [ ] Projektdokumentation arkiverad

---

## 8. Riskhantering

### 8.1 Identifierade risker

| Risk | Sannolikhet | Påverkan | Prioritet | Mitigering |
|------|-------------|----------|-----------|------------|
| Server-kapacitet otillräcklig | Medel | Hög | Hög | Testa i staging, planera för uppgradering, övervaka resurser noga |
| Hosting stödjer inte Node.js | Låg | Mycket hög | Hög | Verifiera tidigt i Fas 1, planera för migration om nödvändigt |
| Prestanda-problem vid hög trafik | Medel | Medel | Medel | Implementera caching, load testing, monitoring |
| Säkerhetsincident | Låg | Hög | Hög | Följ säkerhetsbest practices, regelbundna säkerhetsuppdateringar |
| Kompatibilitetsproblem med WordPress | Låg | Medel | Låg | Testa i staging, dokumentera konflikter |
| Databas-korruption | Låg | Hög | Medel | Dagliga backups, testa återställning regelbundet |
| SSL-certifikat går ut | Låg | Medel | Låg | Automatisk förnyelse, monitoring av utgångsdatum |
| PM2-process kraschar | Medel | Medel | Medel | PM2 auto-restart, monitoring, alerts |
| Användarförvirring | Låg | Låg | Låg | Tydlig navigation, användartest, feedback-system |
| Brist på dokumentation | Medel | Medel | Medel | Prioritera dokumentation, granska regelbundet |

### 8.2 Contingency-planer

**Om servern inte har tillräcklig kapacitet**:
- **Plan A**: Uppgradera befintlig server till högre specifikation
- **Plan B**: Flytta SDKKartan till separat server med subdomain (karta.itsl.se)
- **Plan C**: Använd managed Node.js-hosting (t.ex. Heroku, DigitalOcean App Platform)

**Om hosting inte stödjer Node.js**:
- **Plan A**: Migrera till ny hosting-leverantör som stödjer både WordPress och Node.js
- **Plan B**: Använd separat hosting för SDKKartan och integrera via subdomain
- **Plan C**: Omvärdera teknisk stack och överväg alternativa lösningar

**Om kritiska buggar upptäcks i produktion**:
- **Plan A**: Snabb hotfix och deploy via PM2 reload
- **Plan B**: Rollback till tidigare version genom att checka ut tidigare commit och rebuild
- **Plan C**: Inaktivera /karta-route i Nginx tills fix är klar

**Om prestanda är oacceptabel**:
- **Plan A**: Implementera caching och optimeringar enligt Fas 5
- **Plan B**: Uppgradera server-resurser
- **Plan C**: Implementera CDN för statiska assets

---

## 9. Kommunikationsplan

### 9.1 Intern kommunikation

**Kickoff-möte (Vecka 1)**:
- Presentera projektplan för alla intressenter
- Fördela roller och ansvar
- Sätt förväntningar och tidslinje
- Etablera kommunikationskanaler

**Veckovisa statusmöten (Under hela projektet)**:
- Genomgång av framsteg och blockerare
- Uppdatering av tidslinje om nödvändigt
- Beslut om kritiska frågor
- Planering för nästa vecka

**Fas-övergångar (Efter varje fas)**:
- Demonstration av leveranser
- Godkännande för att fortsätta till nästa fas
- Dokumentation av lärdomar
- Uppdatering av riskregister

**Post-launch-möte (Efter Fas 4)**:
- Utvärdering av deployment
- Identifiering av problem och lösningar
- Planering för optimering och förbättringar
- Firande av framgång!

### 9.2 Extern kommunikation

**Till användare av itsl.se**:
- **Före lansering**: Teaser på hemsidan och sociala medier om kommande funktion
- **Vid lansering**: Nyhet på hemsidan och blogg om nya kartan
- **Efter lansering**: Uppföljning med användarguide och tips

**Till befintliga HubS-kunder**:
- **Före lansering**: E-post om kommande kartfunktion
- **Vid lansering**: E-post med länk och instruktioner
- **Efter lansering**: Feedback-förfrågan

**Till potentiella kunder**:
- **Vid lansering**: Inkludera kartan i säljpresentationer
- **Löpande**: Använd kartan som proof of concept i demos

---

## 10. Budget och resurser

### 10.1 Tidsestimat

| Fas | Varaktighet | Arbetstimmar | Ansvarig |
|-----|-------------|--------------|----------|
| Fas 1: Förberedelse | 1 vecka | 8 timmar | Projektledare + Sysadmin |
| Fas 2: Staging | 2 veckor | 24 timmar | Sysadmin + Backend-dev |
| Fas 3: WordPress-integration | 1 vecka | 8 timmar | WordPress-dev + Frontend-dev |
| Fas 4: Produktion | 1 vecka | 16 timmar | Sysadmin + DevOps |
| Fas 5: Optimering | 2 veckor | 8 timmar | Hela teamet |
| **Total** | **6 veckor** | **64 timmar** | |

### 10.2 Kostnadsestimat

**Utveckling och implementation**:
- Personal-kostnader: 64 timmar × genomsnittlig timkostnad
- Projektledning: Inkluderat i ovan

**Infrastruktur**:
- Server-uppgradering (om nödvändigt): 0-5000 kr/månad
- SSL-certifikat: 0 kr (Let's Encrypt)
- Monitoring-verktyg: 0-500 kr/månad (beroende på val)
- Backup-lagring: 0-200 kr/månad

**Löpande kostnader (per månad)**:
- Underhåll: ~4 timmar × timkostnad
- Säkerhetsuppdateringar: ~2 timmar × timkostnad
- Support: Inkluderat i befintlig support

**Total initial kostnad**: Huvudsakligen personal-kostnader  
**Total löpande kostnad**: Minimal (huvudsakligen underhåll)

### 10.3 Resurskrav

**Personal**:
- Teknisk projektledare (10% av tid under 6 veckor)
- Systemadministratör (50% av tid under 6 veckor)
- Backend-utvecklare (25% av tid under 2 veckor)
- WordPress-utvecklare (25% av tid under 1 vecka)
- Frontend-utvecklare (10% av tid under 1 vecka)
- DevOps-ansvarig (25% av tid under 1 vecka)

**Infrastruktur**:
- Staging-server (kan vara subdomain på befintlig server)
- Produktionsserver med tillräcklig kapacitet
- Databas-server (kan dela med WordPress)
- Backup-lagring

**Verktyg**:
- GitHub (redan tillgängligt)
- Monitoring-verktyg (t.ex. Netdata, Prometheus)
- SSL-certifikat (Let's Encrypt)
- Projekthanteringsverktyg (t.ex. Jira, Trello)

---

## 11. Framgångsmätning

### 11.1 Key Performance Indicators (KPIs)

**Tekniska KPIs**:
- **Uptime**: Mål 99.9% första månaden, 99.95% långsiktigt
- **Laddningstid**: Mål <3 sekunder för initial load, <1 sekund för navigering
- **API-svarstid**: Mål <500ms för 95% av requests
- **Felfrekvens**: Mål <0.1% av requests resulterar i fel

**Användar-KPIs**:
- **Antal besökare**: Spåra dagliga/veckovisa besökare på /karta
- **Bounce rate**: Mål <40% (användare stannar och interagerar)
- **Tid på sida**: Mål >2 minuter (indikerar engagemang)
- **Sökningar**: Antal sökningar per session (indikerar användbarhet)

**Affärs-KPIs**:
- **Användning i säljprocesser**: Antal gånger kartan visas i demos
- **Kundförfrågningar**: Ökning av förfrågningar efter kartlansering
- **Support-ärenden**: Minskning av frågor om anslutna kommuner
- **Kundnöjdhet**: Feedback-score från användare

### 11.2 Uppföljning

**Veckovis uppföljning (Första månaden)**:
- Granska tekniska KPIs och identifiera avvikelser
- Analysera användardata och beteende
- Samla och prioritera feedback
- Implementera snabba förbättringar

**Månadsvis uppföljning (Långsiktigt)**:
- Omfattande analys av alla KPIs
- Jämförelse med målsättningar
- Identifiering av trender
- Planering av förbättringar

**Kvartalsvis review**:
- Utvärdering av projektets totala påverkan
- ROI-analys
- Strategisk planering för nästa kvartal
- Uppdatering av roadmap

---

## 12. Sammanfattning och nästa steg

### 12.1 Sammanfattning

Denna implementationsplan beskriver en strukturerad approach för att integrera SDKKartan på itsl.se som en WordPress-app. Planen är uppdelad i fem huvudfaser över sex veckor och täcker allt från initial förberedelse till långsiktig optimering och underhåll.

Den rekommenderade Reverse Proxy-lösningen med Nginx ger optimal balans mellan prestanda, säkerhet, SEO och underhållbarhet. Genom att följa denna plan systematiskt minimeras risker och säkerställs en framgångsrik implementation.

### 12.2 Kritiska framgångsfaktorer

**Tekniska faktorer**:
- Tillräcklig server-kapacitet för att köra både WordPress och Node.js
- Hosting-leverantör som stödjer Node.js och ger tillräcklig kontroll
- Noggrann testning i staging innan produktion
- Robust monitoring och alerting från dag ett

**Organisatoriska faktorer**:
- Tydligt mandat och stöd från ledning
- Tillräckliga resurser allokerade (personal och budget)
- God kommunikation mellan team och intressenter
- Dokumentation och kunskapsöverföring till drift-team

**Affärsmässiga faktorer**:
- Tydlig förståelse för värdet av kartan för verksamheten
- Användning av kartan i säljprocesser och marknadsföring
- Kontinuerlig förbättring baserad på användarfeedback
- Långsiktigt engagemang för underhåll och utveckling

### 12.3 Nästa steg

**Omedelbart (Denna vecka)**:
1. Granska och godkänn denna implementationsplan
2. Allokera nödvändiga resurser (personal, budget)
3. Kontakta hosting-leverantör för att verifiera Node.js-support
4. Sätt datum för kickoff-möte

**Kort sikt (Nästa vecka)**:
1. Genomför kickoff-möte med alla intressenter
2. Påbörja Fas 1: Förberedelse och planering
3. Inventera server-infrastruktur
4. Skapa fullständig backup av WordPress

**Medellång sikt (Vecka 2-4)**:
1. Sätt upp staging-miljö
2. Deploya och testa SDKKartan i staging
3. Genomför omfattande testning
4. Förbered WordPress-integration

**Långsikt (Vecka 5-6)**:
1. Deploya till produktion
2. Övervaka noga under första veckan
3. Samla användarfeedback
4. Implementera optimeringar

---

## Bilagor

### Bilaga A: Kontaktinformation

**Projektteam**:
- Projektledare: [Namn, E-post, Telefon]
- Systemadministratör: [Namn, E-post, Telefon]
- Backend-utvecklare: [Namn, E-post, Telefon]
- WordPress-utvecklare: [Namn, E-post, Telefon]
- DevOps-ansvarig: [Namn, E-post, Telefon]

**Externa kontakter**:
- Hosting-leverantör: [Företag, Kontaktperson, Support-telefon]
- Domänregistrator: [Företag, Kontaktperson]
- SSL-certifikat-leverantör: [Företag, Kontaktperson]

### Bilaga B: Teknisk referensdokumentation

**GitHub-repositories**:
- SDKKartan: https://github.com/FredrikJonassonItsb/SDKKartan
- Integration-utredning: https://github.com/FredrikJonassonItsb/ITSLyzer/blob/main/docs/itsl_kartintegration_utredning.md

**Teknisk dokumentation**:
- Node.js: https://nodejs.org/docs/
- PM2: https://pm2.keymetrics.io/docs/
- Nginx: https://nginx.org/en/docs/
- tRPC: https://trpc.io/docs/
- Drizzle ORM: https://orm.drizzle.team/docs/

**Säkerhetsresurser**:
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Let's Encrypt: https://letsencrypt.org/docs/
- SSL Labs: https://www.ssllabs.com/

### Bilaga C: Checklistor

Se respektive fas för detaljerade checklistor.

### Bilaga D: Mallar

**Mall för statusrapport**:
```
# Veckorapport - SDKKartan Implementation
Vecka: [Veckonummer]
Datum: [Datum]

## Framsteg
- [Vad som genomförts denna vecka]

## Blockerare
- [Identifierade problem och blockerare]

## Nästa vecka
- [Planerade aktiviteter]

## Risker
- [Nya eller uppdaterade risker]

## KPIs
- [Relevanta mätetal]
```

**Mall för incident-rapport**:
```
# Incident-rapport
Datum: [Datum och tid]
Rapportör: [Namn]
Allvarlighetsgrad: [Kritisk/Hög/Medel/Låg]

## Beskrivning
[Vad hände?]

## Påverkan
[Vilka användare/system påverkades?]

## Root cause
[Grundorsak till incidenten]

## Åtgärder
[Vad gjordes för att lösa problemet?]

## Förebyggande åtgärder
[Vad görs för att förhindra upprepning?]

## Lärdomar
[Vad lärde vi oss?]
```

---

**Dokumentslut**

*Detta dokument har sammanställts av Manus AI för ITSL Solutions. För frågor eller förtydliganden, vänligen kontakta projektledaren.*

**Version**: 1.0  
**Datum**: 2025-01-15  
**Status**: Utkast för godkännande  
**Nästa review**: Efter godkännande och innan Fas 1 påbörjas
