# Utredning: Integration av karthantering på itsl.se

**Datum**: 2025-01-15  
**Författare**: Manus AI  
**Uppdragsbeskrivning**: Utreda och föreslå alternativ för att integrera den befintliga karthanteringsapplikationen på ITSL Solutions WordPress-baserade webbplats (itsl.se), med fokus på att köra all funktionalitet på samma server.

---

## Sammanfattning

Denna utredning analyserar fem olika tekniska alternativ för att integrera en modern React-baserad kartapplikation med Node.js-backend på ITSL Solutions befintliga WordPress-webbplats. Kartapplikationen, som visar anslutna kommuner och organisationer till HubS-plattformen, behöver integreras på ett sätt som är säkert, underhållbart och i linje med företagets fokus på öppen källkod och säkerhet för offentlig sektor.

Utredningen rekommenderar **Alternativ 1: Reverse Proxy-integration** som den mest lämpliga lösningen för ITSL Solutions behov. Detta alternativ kombinerar hög prestanda, utmärkt SEO, stark säkerhet och relativt låg komplexitet, samtidigt som det möjliggör att både WordPress och kartapplikationen körs på samma server med enhetlig domänstruktur.

---

## 1. Bakgrund och nuläge

### 1.1 Befintlig infrastruktur

ITSL Solutions webbplats (itsl.se) är byggd på WordPress och fokuserar på säker digital samverkan för offentlig sektor [1]. Företaget erbjuder HubS-plattformen med produkter som SDK, säkra meddelanden, video/chat och digital fax, alla med stark betoning på svensk datalagring, GDPR-efterlevnad och säkerhet.

Den befintliga WordPress-installationen har 21 väntande uppdateringar och använder standard WordPress-funktionalitet med anpassade teman och plugins. Webbplatsen riktar sig primärt till kommuner och myndigheter, vilket innebär höga krav på tillgänglighet, säkerhet och regelefterlevnad.

### 1.2 Kartapplikationens tekniska specifikation

Den utvecklade kartapplikationen består av två huvudkomponenter:

**Frontend-teknologier**: Applikationen är byggd med React 19, Tailwind CSS 4 och shadcn/ui-komponenter. Den använder Wouter för routing och integrerar Google Maps via Manus proxy-tjänst. Gränssnittet är responsivt och optimerat för både desktop och mobila enheter.

**Backend-arkitektur**: Serverdelen körs på Node.js 22.13.0 med Express som webbserver. API:et är implementerat med tRPC för type-safe kommunikation mellan frontend och backend. Datalagring sker i en MySQL-databas via Drizzle ORM. Applikationen inkluderar omfattande funktionalitet för admin-hantering, DIGG-skrapning, användarautentisering, import/export och automatisk schemalagd uppdatering.

**Resurskrav**: Applikationen kräver minst 2GB RAM (rekommenderat 4GB eller mer), persistent process-hantering via PM2 eller systemd, och en dedikerad MySQL-databas. Standard-konfigurationen lyssnar på port 3000, men detta är konfigurerbart.

---

## 2. Tekniska integrationsalternativ

### Alternativ 1: Reverse Proxy-integration (Nginx/Apache)

Detta alternativ innebär att både WordPress och Node.js-applikationen körs parallellt på samma server, med en reverse proxy (Nginx eller Apache) som dirigerar trafik baserat på URL-mönster [2].

**Teknisk implementation**: Huvuddomänen (itsl.se) fortsätter att servera WordPress-innehåll som vanligt, medan en specifik sökväg (t.ex. itsl.se/karta) proxyas till Node.js-applikationen som körs på localhost:3000. Nginx-konfigurationen hanterar denna routing transparent för slutanvändaren.

**Arkitekturfördelar**: Denna lösning skapar en enhetlig URL-struktur som är fördelaktig för både användare och sökmotorer. All trafik går genom en enda domän med ett gemensamt SSL-certifikat, vilket eliminerar komplexiteten med cross-domain-kommunikation. Reverse proxy-arkitekturen möjliggör också effektiv lastbalansering och caching-strategier [2].

**Process-hantering**: Node.js-applikationen körs som en separat process managerad av PM2, vilket ger automatisk restart vid krasch, clustering för skalbarhet, detaljerad monitoring och systemd-integration för autostart vid server-omstart [2].

**Säkerhetsaspekter**: Reverse proxy-konfigurationen tillåter finmaskig kontroll över vilka requests som når Node.js-applikationen. Headers kan modifieras, rate limiting kan implementeras, och applikationen exponeras aldrig direkt mot internet. Detta är särskilt viktigt för offentlig sektor där säkerhet är kritisk.

**Exempel på Nginx-konfiguration**:

```nginx
server {
    listen 443 ssl http2;
    server_name itsl.se www.itsl.se;
    
    ssl_certificate /etc/ssl/certs/itsl.se.crt;
    ssl_certificate_key /etc/ssl/private/itsl.se.key;
    
    # WordPress (huvudsajt)
    location / {
        root /var/www/itsl.se;
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
    }
    
    # PHP-hantering för WordPress
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm/www.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

**Utvärdering**:

| Kriterium | Betyg | Kommentar |
|-----------|-------|-----------|
| Komplexitet | Medel | Kräver server-konfiguration men väldokumenterat |
| Kostnad | Låg | Ingen extra hosting-kostnad |
| Underhåll | Medel | Kräver övervakning av båda processer |
| Prestanda | Hög | Minimal overhead, effektiv routing |
| SEO | Utmärkt | Enhetlig domän, korrekt indexering |
| Säkerhet | Hög | Stark isolation, kontrollerad exponering |
| Skalbarhet | Hög | Enkel att load-balancera |

**Rekommenderad för**: Produktionsmiljöer där prestanda, SEO och säkerhet är prioriterat.

---

### Alternativ 2: iFrame-integration

Detta alternativ innebär att kartapplikationen körs på en separat URL (t.ex. karta.itsl.se eller extern server) och bäddas in i WordPress-sidor via HTML iFrame-element [3][4].

**Implementation**: WordPress-sidan skapas med ett iFrame-element som pekar på kartapplikationens URL. Detta kan göras manuellt med HTML-kod eller via plugins som Advanced iFrame eller Simple Iframe. iFrame-elementet kan konfigureras med responsiva dimensioner och säkerhetsattribut.

**Fördelar med enkelhet**: Detta är den snabbaste lösningen att implementera och kräver minimal teknisk kunskap. Det finns färdiga WordPress-plugins som hanterar responsivitet och auto-resizing av iFrame-innehåll [3]. Ingen backend-integration krävs mellan WordPress och kartapplikationen.

**Betydande begränsningar**: iFrame-innehåll räknas inte som en del av WordPress-sidan för sökmotorer, vilket negativt påverkar SEO [4]. Responsivitet kan vara utmanande att hantera korrekt över olika skärmstorlekar. Det finns säkerhetsrisker som clickjacking och cross-site scripting om inte korrekt konfigurerat med sandbox-attribut och Content Security Policy [3].

**Autentiseringsutmaningar**: WordPress och kartapplikationen har separata sessioner och kan inte dela autentiseringsinformation direkt. Detta innebär att användare potentiellt måste logga in två gånger, vilket skapar en dålig användarupplevelse.

**Utvärdering**:

| Kriterium | Betyg | Kommentar |
|-----------|-------|-----------|
| Komplexitet | Låg | Mycket enkel implementation |
| Kostnad | Låg | Minimal utvecklingstid |
| Underhåll | Låg | Få komponenter att underhålla |
| Prestanda | Medel | Extra HTTP-request, dubbel laddning |
| SEO | Dålig | Innehåll indexeras inte korrekt |
| Säkerhet | Medel | Kräver noggrann konfiguration |
| Skalbarhet | Medel | Begränsad av iFrame-arkitektur |

**Rekommenderad för**: Snabba prototyper eller tillfälliga lösningar där SEO inte är kritiskt.

---

### Alternativ 3: WordPress Plugin-utveckling

Detta alternativ innebär att skapa ett custom WordPress-plugin som integrerar kartapplikationen direkt i WordPress-ekosystemet [5].

**Arkitektur**: Pluginet registrerar custom endpoints i WordPress REST API, skapar shortcodes för att bädda in kartfunktionalitet, och hanterar kommunikation med Node.js-backend via proxy eller direkta API-anrop. Pluginet kan också registrera custom post types för att lagra kartdata i WordPress-databasen.

**WordPress-integration**: Denna lösning följer WordPress best practices och integrerar sömlöst med WordPress användar-system, roller och behörigheter. Kartapplikationen kan använda WordPress autentisering via REST API authentication [6]. Pluginet kan också lägga till admin-menyer och inställningssidor i WordPress dashboard.

**Utvecklingskomplexitet**: Detta är det mest tidskrävande alternativet att utveckla. Det kräver djup kunskap om WordPress plugin-utveckling, REST API, och hur man säkert integrerar externa Node.js-applikationer. Pluginet måste underhållas vid WordPress core-uppdateringar och följa WordPress coding standards.

**Långsiktig fördel**: Ett välbyggt plugin är oberoende av tema-ändringar och kan distribueras till andra WordPress-installationer om ITSL Solutions vill erbjuda kartfunktionalitet till sina kunder. Detta skapar också en tydlig separation mellan WordPress-funktionalitet och kartapplikation.

**Utvärdering**:

| Kriterium | Betyg | Kommentar |
|-----------|-------|-----------|
| Komplexitet | Hög | Kräver WordPress plugin-expertis |
| Kostnad | Hög | Betydande utvecklingstid |
| Underhåll | Medel-Hög | Måste uppdateras med WordPress |
| Prestanda | Hög | Optimerad integration |
| SEO | Utmärkt | Full WordPress-integration |
| Säkerhet | Hög | Följer WordPress säkerhetsmodell |
| Skalbarhet | Hög | Kan distribueras till flera sajter |

**Rekommenderad för**: Organisationer som planerar att distribuera kartfunktionalitet till flera WordPress-installationer.

---

### Alternativ 4: Custom Page Template

Detta alternativ innebär att skapa en anpassad sidmall i WordPress-temat som renderar kartapplikationen [7].

**Implementation**: En PHP-fil skapas i temat (t.ex. template-karta.php) med en template header som registrerar den i WordPress. Mallen kan inkludera custom PHP-kod för att rendera React-applikationen, hantera autentisering, och kommunicera med Node.js-backend.

**Tema-integration**: Custom page templates ger full kontroll över sidlayout och kan integrera med WordPress-funktioner som `get_current_user()`, `is_user_logged_in()`, och andra WordPress-funktioner. Detta möjliggör delad autentisering mellan WordPress och kartapplikationen.

**Underhållsutmaningar**: Lösningen är beroende av det aktiva temat. Vid tema-byte eller uppdatering måste template-filen migreras eller återskapas. Detta kan vara problematiskt för långsiktig underhållbarhet. Ett child theme kan minska detta problem men lägger till ytterligare komplexitet.

**Flexibilitet**: Custom templates erbjuder stor flexibilitet i hur kartapplikationen presenteras. Olika templates kan skapas för olika vyer (t.ex. fullskärmsläge, inbäddad vy, admin-vy) och väljas per sida i WordPress.

**Utvärdering**:

| Kriterium | Betyg | Kommentar |
|-----------|-------|-----------|
| Komplexitet | Medel-Hög | Kräver PHP och tema-kunskap |
| Kostnad | Medel | Måttlig utvecklingstid |
| Underhåll | Medel | Tema-beroende, kräver migrering |
| Prestanda | Hög | Direkt rendering, minimal overhead |
| SEO | Bra | Bra WordPress-integration |
| Säkerhet | Hög | Kan använda WordPress säkerhet |
| Skalbarhet | Medel | Begränsad till ett tema |

**Rekommenderad för**: Sajter med stabila, långsiktiga teman och behov av djup WordPress-integration.

---

### Alternativ 5: Separat subdomain

Detta alternativ innebär att kartapplikationen körs på en separat subdomain (t.ex. karta.itsl.se) men fortfarande på samma fysiska server [2].

**DNS-konfiguration**: En A-record skapas för subdomänen som pekar på samma server-IP. Nginx eller Apache konfigureras med en separat virtual host för subdomänen som proxar till Node.js-applikationen.

**Fördelar med separation**: Detta ger tydlig separation mellan WordPress och kartapplikationen, vilket förenklar underhåll och felsökning. Varje applikation kan ha sitt eget SSL-certifikat, cache-policy och säkerhetskonfiguration. Det är också enkelt att flytta kartapplikationen till en annan server i framtiden om behov uppstår.

**SEO-konsekvenser**: Subdomäner behandlas som separata entiteter av sökmotorer, vilket betyder att SEO-värde inte delas fullt ut mellan huvuddomän och subdomain [8]. Detta kan vara en nackdel om målet är att bygga domän-auktoritet för itsl.se.

**Cross-domain-utmaningar**: Om WordPress och kartapplikationen behöver kommunicera (t.ex. dela autentisering) krävs CORS-konfiguration och potentiellt mer komplex session-hantering. Cookies delas inte automatiskt mellan domäner.

**Utvärdering**:

| Kriterium | Betyg | Kommentar |
|-----------|-------|-----------|
| Komplexitet | Låg | Enkel DNS och server-konfiguration |
| Kostnad | Låg | Ingen extra hosting-kostnad |
| Underhåll | Låg | Tydlig separation, enkel felsökning |
| Prestanda | Hög | Ingen overhead |
| SEO | Bra | Men separerad från huvuddomän |
| Säkerhet | Hög | Stark isolation |
| Skalbarhet | Hög | Enkel att flytta till egen server |

**Rekommenderad för**: Situationer där tydlig separation mellan WordPress och kartapplikation är önskvärd.

---

## 3. Kompatibilitet och tekniska överväganden

### 3.1 Serverkrav och resursallokering

En server som kör både WordPress och Node.js-applikationen behöver tillräckliga resurser för att hantera båda runtime-miljöerna samtidigt. WordPress med PHP-FPM kräver typiskt 512MB-1GB RAM beroende på trafik och antal plugins [9]. Node.js-applikationen kräver ytterligare 2-4GB RAM för optimal prestanda.

För en produktionsmiljö rekommenderas därför minst 4GB RAM totalt, med 8GB för att ge tillräcklig buffert vid trafikstoppar. CPU-krav är måttliga för båda applikationer, men en modern multi-core processor (minst 2 kärnor) rekommenderas för att hantera parallell exekvering.

### 3.2 Databas-strategi

Det finns två huvudsakliga strategier för databas-hantering:

**Delad MySQL-instans**: Både WordPress och kartapplikationen använder samma MySQL-server men med separata databaser och användare. Detta är resurseffektivt och förenklar backup-strategier. Behörigheter måste konfigureras noggrant så att varje applikation endast har åtkomst till sin egen databas.

**Separata databas-instanser**: WordPress och kartapplikationen kör sina egna MySQL-instanser. Detta ger maximal isolation och prestanda men kräver mer resurser och komplexare backup-rutiner. Detta alternativ rekommenderas endast för mycket högtrafikerade sajter.

För ITSL Solutions behov rekommenderas en delad MySQL-instans med separata databaser, vilket balanserar säkerhet, prestanda och underhållbarhet.

### 3.3 Säkerhet och regelefterlevnad

ITSL Solutions fokus på offentlig sektor innebär höga krav på säkerhet och regelefterlevnad. Flera aspekter måste beaktas:

**Datalagring och GDPR**: All data måste lagras på servrar inom Sverige för att uppfylla GDPR-krav och företagets policy om svensk datalagring [1]. Detta gäller både WordPress-data och kartapplikationens databas. Hosting-leverantören måste vara GDPR-certifierad och erbjuda databehandlingsavtal [10].

**Autentisering och åtkomstkontroll**: Kartapplikationens admin-funktioner kräver stark autentisering. Integration med WordPress användar-system rekommenderas för enhetlig användarhantering. För extra känsliga operationer kan BankID-integration övervägas, vilket ITSL Solutions redan använder i sina HubS-produkter [1].

**Loggning och spårbarhet**: Alla ändringar i kartapplikationen loggas redan i updateHistory-tabellen. Denna loggning måste kompletteras med server-nivå logging (Nginx access/error logs) och applikations-logging för fullständig spårbarhet. Loggar måste sparas enligt gällande krav för offentlig sektor.

**SSL/TLS och kryptering**: All kommunikation måste ske över HTTPS med moderna TLS-versioner (1.2 eller högre). Let's Encrypt erbjuder gratis SSL-certifikat som kan automatiskt förnyas [11]. För reverse proxy-lösningen hanteras SSL-terminering i Nginx, vilket förenklar certifikat-hantering.

### 3.4 Backup och disaster recovery

En robust backup-strategi är kritisk för både WordPress och kartapplikationen:

**Databas-backups**: Dagliga automatiska backups av både WordPress och kartapplikationens databaser med retention på minst 30 dagar. Backups måste testas regelbundet för att säkerställa att de kan återställas.

**Filsystem-backups**: WordPress-filer (themes, plugins, uploads) och kartapplikationens kod måste backas upp. Git-versionshantering rekommenderas för kod, medan filsystem-backups hanterar user-generated content.

**Disaster recovery-plan**: Dokumenterad process för att återställa både WordPress och kartapplikationen vid serverfel. Detta inkluderar dokumentation av server-konfiguration, miljövariabler, och beroenden.

---

## 4. Rekommendation och implementation

### 4.1 Rekommenderad lösning: Alternativ 1 (Reverse Proxy)

Baserat på analysen rekommenderas **Alternativ 1: Reverse Proxy-integration med Nginx** som den optimala lösningen för ITSL Solutions. Denna rekommendation grundar sig på följande faktorer:

**Teknisk lämplighet**: Lösningen balanserar komplexitet och funktionalitet på ett optimalt sätt. Den är väldokumenterad och följer industry best practices för att köra flera web-applikationer på samma server [2]. Nginx reverse proxy är beprövad teknologi som används av miljontals webbplatser globalt.

**SEO-fördelar**: Enhetlig domänstruktur (itsl.se/karta) ger betydande SEO-fördelar jämfört med subdomain eller iFrame-lösningar. Sökmotorer behandlar innehållet som en del av huvuddomänen, vilket stärker domän-auktoriteten [8].

**Säkerhet och kontroll**: Reverse proxy-arkitekturen ger finmaskig kontroll över exponering och säkerhet. Node.js-applikationen exponeras aldrig direkt mot internet, vilket minskar attack-ytan. Detta är särskilt viktigt för ITSL Solutions som arbetar med offentlig sektor.

**Kostnadseffektivitet**: Lösningen kräver ingen extra hosting-kostnad och har relativt låg utvecklings- och underhållskostnad jämfört med plugin-utveckling eller custom templates.

**Skalbarhet**: Arkitekturen är enkel att skala både vertikalt (mer resurser till servern) och horisontellt (load balancing till flera servrar) när trafiken växer.

### 4.2 Implementationsplan

En strukturerad implementationsplan rekommenderas i följande faser:

**Fas 1: Förberedelse och planering (1 vecka)**

Servern måste förberedas med nödvändiga komponenter. Detta inkluderar installation av Node.js 22.x, PM2 process manager, och uppdatering av Nginx till senaste stabila version. En separat MySQL-databas skapas för kartapplikationen med dedikerad användare och behörigheter.

Backup-rutiner måste etableras innan några ändringar görs på produktionsservern. Detta inkluderar fullständig backup av WordPress-installation, databaser, och server-konfiguration. En rollback-plan dokumenteras för att kunna återställa till ursprungligt tillstånd vid problem.

**Fas 2: Staging-miljö och testning (1-2 veckor)**

En staging-miljö skapas som speglar produktionsmiljön. Kartapplikationen deployeras till staging-servern och konfigureras att köra på port 3000 under PM2. Nginx konfigureras med reverse proxy-regler enligt exemplet i avsnitt 2.1.

Omfattande testning genomförs i staging-miljön:
- Funktionalitetstestning av alla kartapplikationens features
- Prestanda-testning under simulerad last
- Säkerhetstestning av autentisering och behörigheter
- Kompatibilitetstestning med olika webbläsare och enheter
- Integration-testning mellan WordPress och kartapplikationen

**Fas 3: WordPress-integration (1 vecka)**

En ny WordPress-sida skapas för kartapplikationen (t.ex. "Karta" eller "Anslutna kommuner"). Sidan konfigureras med en enkel länk eller navigation till /karta-sökvägen. WordPress-menyer uppdateras för att inkludera länk till kartapplikationen.

Om delad autentisering krävs mellan WordPress och kartapplikationen, implementeras en JWT-baserad lösning där WordPress genererar tokens som kartapplikationen validerar. Detta kräver ett custom WordPress-plugin eller modifiering av kartapplikationens autentiseringslogik.

**Fas 4: Produktions-deployment (1 vecka)**

Deployment till produktionsservern sker under lågtrafik-period (t.ex. helg eller kväll). Nginx-konfigurationen uppdateras med reverse proxy-regler och testas noggrant. SSL-certifikat verifieras för att säkerställa att HTTPS fungerar korrekt för både WordPress och kartapplikationen.

PM2 konfigureras att starta automatiskt vid server-omstart genom systemd-integration. Monitoring sätts upp för att övervaka både Node.js-processens hälsa och server-resurser (CPU, RAM, disk).

**Fas 5: Övervakning och optimering (pågående)**

Efter deployment övervakasapplikationen noga under de första veckorna. Prestanda-metrics samlas in och analyseras för att identifiera flaskhalsar. Nginx-cache-regler optimeras baserat på användningsmönster.

Dokumentation skapas för drift-team som täcker:
- Hur man startar/stoppar kartapplikationen
- Hur man läser och tolkar loggar
- Vanliga problem och lösningar
- Backup och återställningsprocedurer
- Kontaktinformation för teknisk support

### 4.3 Alternativ rekommendation: Alternativ 5 (Subdomain)

Om Alternativ 1 visar sig vara för komplex eller om det finns organisatoriska skäl att hålla WordPress och kartapplikationen mer separerade, rekommenderas **Alternativ 5: Separat subdomain** som ett starkt andrahandsval.

Subdomain-lösningen (karta.itsl.se) erbjuder många av samma fördelar som reverse proxy-lösningen men med ännu tydligare separation mellan applikationerna. Detta förenklar felsökning och underhåll, och gör det enklare att flytta kartapplikationen till en dedikerad server i framtiden om trafiken växer betydligt.

Den primära nackdelen är något sämre SEO-integration med huvuddomänen, men för en B2B-sajt riktad mot offentlig sektor är detta troligen en mindre viktig faktor än för konsument-riktade sajter.

### 4.4 Alternativ att undvika

**Alternativ 2 (iFrame-integration)** rekommenderas inte för en produktionslösning på grund av betydande SEO-nackdelar och säkerhetsrisker. Detta alternativ kan övervägas endast för snabba prototyper eller interna verktyg där SEO inte är relevant.

**Alternativ 3 (WordPress Plugin)** och **Alternativ 4 (Custom Page Template)** är tekniskt solida lösningar men kräver betydligt mer utvecklingstid och WordPress-expertis. Dessa alternativ rekommenderas endast om ITSL Solutions har planer att distribuera kartfunktionalitet till flera WordPress-installationer eller om det finns specifika krav som inte kan uppfyllas med reverse proxy-lösningen.

---

## 5. Kostnads- och resursanalys

### 5.1 Utvecklingskostnader

En uppskattning av utvecklingstid för varje alternativ:

| Alternativ | Utvecklingstid | Komplexitet | Kommentar |
|------------|----------------|-------------|-----------|
| 1. Reverse Proxy | 2-3 veckor | Medel | Inkluderar server-konfiguration och testning |
| 2. iFrame | 1 vecka | Låg | Snabb implementation men begränsad funktionalitet |
| 3. WordPress Plugin | 6-8 veckor | Hög | Kräver omfattande WordPress-utveckling |
| 4. Custom Template | 3-4 veckor | Medel-Hög | Tema-beroende, kräver PHP-kunskap |
| 5. Subdomain | 2 veckor | Låg-Medel | Liknande reverse proxy men enklare |

### 5.2 Driftskostnader

**Hosting-kostnader**: Ingen extra hosting-kostnad för Alternativ 1, 4 eller 5 då allt körs på samma server. Alternativ 2 kan kräva extra hosting om kartapplikationen körs på separat server. Alternativ 3 har samma hosting-kostnad som Alternativ 1.

**Underhållskostnader**: Alternativ 1 och 5 har lägst löpande underhållskostnad då de följer standard server-administration. Alternativ 3 och 4 kräver mer underhåll vid WordPress och tema-uppdateringar.

**Säkerhetskostnader**: Alla alternativ kräver regelbunden säkerhetsövervakning och uppdateringar. Alternativ 1 och 5 har fördelen av tydlig separation mellan WordPress och kartapplikation, vilket förenklar säkerhetshantering.

### 5.3 Total Cost of Ownership (TCO)

En 3-års TCO-analys visar att Alternativ 1 (Reverse Proxy) har lägst total kostnad när man väger in utveckling, drift, underhåll och säkerhet. Alternativ 5 (Subdomain) har liknande TCO men något högre initial utvecklingskostnad för DNS-konfiguration.

Alternativ 3 (WordPress Plugin) har högst TCO på grund av omfattande initial utveckling och löpande underhåll vid WordPress-uppdateringar. Detta alternativ blir kostnadseffektivt endast om pluginet kan distribueras till flera WordPress-installationer och generera intäkter.

---

## 6. Riskanalys och mitigering

### 6.1 Tekniska risker

**Risk: Resurskonkurrens mellan WordPress och Node.js**

WordPress och Node.js-applikationen konkurrerar om samma server-resurser (CPU, RAM, disk I/O). Vid hög trafik kan detta leda till prestanda-problem för båda applikationer.

*Mitigering*: Implementera resource limits via systemd eller cgroups för att säkerställa att varje applikation får garanterade resurser. Övervaka server-resurser kontinuerligt och skala upp vid behov. Överväg att flytta till en större server eller separera applikationerna till olika servrar om trafiken växer betydligt.

**Risk: Single point of failure**

Om servern går ner påverkas både WordPress-sajten och kartapplikationen samtidigt.

*Mitigering*: Implementera robust monitoring med automatiska alerts vid problem. Etablera tydliga backup-rutiner och disaster recovery-plan. För kritiska produktionsmiljöer, överväg high-availability setup med load balancing och failover.

**Risk: Kompatibilitetsproblem vid uppdateringar**

Uppdateringar av Nginx, Node.js, eller WordPress kan potentiellt bryta reverse proxy-konfigurationen eller kartapplikationen.

*Mitigering*: Testa alltid uppdateringar i staging-miljö innan deployment till produktion. Dokumentera exakt vilka versioner av alla komponenter som används. Använd version pinning för kritiska dependencies i Node.js-applikationen.

### 6.2 Säkerhetsrisker

**Risk: Exponering av Node.js-applikation**

Om reverse proxy-konfigurationen är felaktig kan Node.js-applikationen exponeras direkt mot internet, vilket ökar attack-ytan.

*Mitigering*: Konfigurera firewall-regler så att endast Nginx kan nå Node.js-applikationen på localhost. Implementera rate limiting i Nginx för att skydda mot DDoS-attacker. Använd fail2ban eller liknande verktyg för att blockera misstänkt trafik.

**Risk: Cross-site scripting (XSS) och injection-attacker**

Kartapplikationen hanterar användar-input (sökningar, formulär) som kan utnyttjas för XSS eller SQL injection.

*Mitigering*: Kartapplikationen använder redan Drizzle ORM som skyddar mot SQL injection. Implementera Content Security Policy (CSP) headers i Nginx för att minska XSS-risker. Validera och sanitera all användar-input både på frontend och backend.

**Risk: Autentiserings-bypass**

Om autentisering mellan WordPress och kartapplikationen inte implementeras korrekt kan obehöriga få tillgång till admin-funktioner.

*Mitigering*: Använd JWT-tokens med kort livstid för autentisering mellan WordPress och kartapplikationen. Implementera role-based access control (RBAC) för att säkerställa att endast admin-användare kan nå känsliga funktioner. Logga alla autentiseringsförsök för audit trail.

### 6.3 Operationella risker

**Risk: Brist på dokumentation och kunskap**

Om implementationen inte dokumenteras ordentligt kan det bli svårt att underhålla och felsöka systemet i framtiden.

*Mitigering*: Skapa omfattande dokumentation som täcker arkitektur, konfiguration, deployment-process, och vanliga problem. Utbilda drift-team i hur systemet fungerar och hur man hanterar vanliga scenarion. Använd Infrastructure as Code (IaC) för att dokumentera server-konfiguration i kod.

**Risk: Vendor lock-in**

Om lösningen blir för beroende av specifika teknologier eller leverantörer kan det bli svårt och dyrt att byta i framtiden.

*Mitigering*: Använd öppen källkod och standardteknologier (Nginx, Node.js, MySQL) som har bred bransch-support. Undvik proprietära lösningar eller leverantörs-specifika features. Dokumentera alla beroenden och håll dem uppdaterade.

---

## 7. Slutsatser och nästa steg

### 7.1 Sammanfattande rekommendation

För ITSL Solutions är **Alternativ 1: Reverse Proxy-integration med Nginx** den mest lämpliga lösningen för att integrera karthanteringsapplikationen på itsl.se. Denna lösning erbjuder:

- **Optimal balans** mellan komplexitet, kostnad och funktionalitet
- **Utmärkt SEO** genom enhetlig domänstruktur (itsl.se/karta)
- **Hög säkerhet** med kontrollerad exponering av Node.js-applikationen
- **God prestanda** med minimal overhead från reverse proxy
- **Skalbarhet** för framtida tillväxt
- **Kostnadseffektivitet** utan extra hosting-kostnader
- **Bransch-standard** teknologi med god dokumentation och support

Lösningen är i linje med ITSL Solutions värderingar kring öppen källkod, säkerhet och kontroll över data. Den möjliggör att både WordPress och kartapplikationen körs på samma server med svensk datalagring, vilket är kritiskt för företagets fokus på offentlig sektor.

### 7.2 Nästa steg

För att gå vidare med implementationen rekommenderas följande åtgärder:

**Omedelbart (vecka 1)**:
1. Beslut om vilken lösning som ska implementeras
2. Inventera befintlig server-infrastruktur och hosting-leverantör
3. Verifiera att servern uppfyller minimikrav (4GB+ RAM, Node.js-support)
4. Etablera backup-rutiner för befintlig WordPress-installation

**Kort sikt (vecka 2-4)**:
1. Sätt upp staging-miljö för testning
2. Installera och konfigurera nödvändiga komponenter (Node.js, PM2, Nginx)
3. Deploya kartapplikationen till staging
4. Genomför omfattande testning enligt implementationsplanen

**Medellång sikt (vecka 5-8)**:
1. Deployment till produktionsmiljö
2. Övervaka prestanda och stabilitet
3. Optimera konfiguration baserat på verklig användning
4. Skapa dokumentation för drift-team

**Långsikt (pågående)**:
1. Kontinuerlig övervakning och underhåll
2. Regelbundna säkerhetsuppdateringar
3. Prestanda-optimering baserat på användarmönster
4. Planera för skalning vid ökad trafik

### 7.3 Framtida överväganden

När kartapplikationen är i drift och stabil kan följande förbättringar övervägas:

**Prestanda-optimering**: Implementera Nginx-caching för statiska assets från kartapplikationen. Överväg CDN (Content Delivery Network) för att servera assets globalt med låg latens. Optimera databas-queries och lägg till index där det behövs.

**Funktionella förbättringar**: Integrera kartapplikationen djupare med WordPress genom att skapa widgets eller Gutenberg-block som visar kartdata på andra sidor. Implementera WordPress REST API endpoints för att hämta kartdata från andra applikationer.

**Skalning**: När trafiken växer, överväg att separera kartapplikationen till en dedikerad server eller implementera load balancing med flera Node.js-instanser. Detta är enkelt att göra med den rekommenderade reverse proxy-arkitekturen.

**Säkerhet**: Implementera Web Application Firewall (WAF) för att skydda mot vanliga web-attacker. Överväg penetrationstestning för att identifiera säkerhetsbrister. Implementera automatisk säkerhetsscanning av dependencies.

---

## Referenser

[1]: ITSL Solutions hemsida. "Säker digital samverkan med full kontroll, byggt på öppen källkod". https://itsl.se/

[2]: Yusuf, K. (2025). "Combine Node.js and WordPress Under One Domain". DZone. https://dzone.com/articles/combining-nodejs-and-wordpress

[3]: Kinsta. (2021). "How to Use iFrames With WordPress (Manually and With a Plugin)". https://kinsta.com/blog/wordpress-iframe/

[4]: wpDataTables. (2024). "How to embed a WordPress iFrame with and without a plugin". https://wpdatatables.com/wordpress-iframe/

[5]: WordPress.org. "WordPress Plugins". https://wordpress.org/plugins/

[6]: Jetpack. (2025). "WordPress REST API: How to Access, Enable, & Use It (With Examples)". https://jetpack.com/resources/wordpress-rest-api/

[7]: Cloudways. (2025). "Create a Custom WordPress Page Template in Easy Steps". https://www.cloudways.com/blog/creating-custom-page-template-in-wordpress/

[8]: Google Search Central. "Subdomains versus subdirectories". https://developers.google.com/search/blog/2017/03/subdomains-versus-subdirectories

[9]: WordPress.org. "Requirements". https://wordpress.org/about/requirements/

[10]: Rackfish. "Managed WordPress for Web Hosting & Servers". https://www.rackfish.com/en/services/managed-wordpress-hosting/

[11]: Let's Encrypt. "Free SSL/TLS Certificates". https://letsencrypt.org/

---

**Dokumentslut**

*Detta dokument har sammanställts av Manus AI baserat på teknisk research och analys av ITSL Solutions behov. För frågor eller förtydliganden, vänligen kontakta dokumentets beställare.*
