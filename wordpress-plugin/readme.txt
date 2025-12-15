=== ITSL SDKKartan ===
Contributors: itslsolutions
Tags: map, karta, kommun, sdk, hubs, itsl, offentlig sektor
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattformen.

== Description ==

ITSL SDKKartan visar en interaktiv karta över alla svenska kommuner, regioner, myndigheter och övriga organisationer som är anslutna till ITSL HubS SDK-plattform för säker digital kommunikation.

= Funktioner =

* **Interaktiv karta** - Visar anslutna kommuner och organisationer på en karta över Sverige
* **Statistik** - Visar antal anslutna kommuner, regioner, myndigheter och övriga organisationer
* **Shortcodes** - Bädda in kartan eller statistik på valfri sida
* **Widget** - Visa statistik och länk till kartan i sidofält
* **Responsiv design** - Fungerar på desktop, tablet och mobil
* **SEO-optimerad** - Inkluderar structured data och meta-taggar
* **Anpassningsbar** - Konfigurera höjd, rubrik och anpassad CSS

= Shortcodes =

* `[sdkkartan]` - Visar hela kartan
* `[sdkkartan height="500px"]` - Kartan med anpassad höjd
* `[sdkkartan show_header="no"]` - Kartan utan rubrik
* `[sdkkartan_stats]` - Endast statistik
* `[sdkkartan_stats style="cards"]` - Statistik i kortformat

= Om ITSL Solutions =

ITSL Solutions är ett svenskt företag som utvecklar säkra digitala lösningar för offentlig sektor. HubS-plattformen möjliggör säker digital kommunikation mellan kommuner, myndigheter och andra organisationer.

Läs mer på [itsl.se](https://itsl.se)

== Installation ==

1. Ladda upp plugin-mappen `itsl-sdkkartan` till `/wp-content/plugins/`
2. Aktivera pluginet via 'Plugins'-menyn i WordPress
3. En karta-sida skapas automatiskt på `/karta`
4. Lägg till "Karta" i din huvudmeny via Utseende → Menyer
5. (Valfritt) Konfigurera inställningar via SDKKartan → Inställningar

== Frequently Asked Questions ==

= Hur visar jag kartan på min webbplats? =

Pluginet skapar automatiskt en sida på `/karta` vid aktivering. Du kan också använda shortcode `[sdkkartan]` på valfri sida.

= Kan jag anpassa kartans utseende? =

Ja, du kan ändra höjd, dölja rubrik och lägga till anpassad CSS via SDKKartan → Inställningar.

= Fungerar pluginet med min WordPress-tema? =

Ja, pluginet är designat för att fungera med alla WordPress-teman. Om du upplever stilkonflikter kan du använda anpassad CSS för att justera.

= Var kommer kartdata ifrån? =

Kartdata hämtas från ITSL Solutions officiella SDKKartan-applikation som uppdateras kontinuerligt med aktuell information om anslutna organisationer.

= Behöver jag en API-nyckel? =

Nej, pluginet fungerar direkt utan någon API-nyckel eller registrering.

== Screenshots ==

1. Kartan inbäddad på en WordPress-sida
2. Admin Dashboard med snabbåtgärder och shortcodes
3. Inställningssidan för konfiguration
4. Statistik-widget i sidofält
5. Responsiv vy på mobil

== Changelog ==

= 1.0.0 =
* Initial release
* Interaktiv karta med Google Maps
* Shortcodes för karta och statistik
* Widget för sidofält
* Admin Dashboard och inställningar
* SEO-optimering med structured data
* Responsiv design
* Stöd för anpassad CSS

== Upgrade Notice ==

= 1.0.0 =
Initial release av ITSL SDKKartan.
