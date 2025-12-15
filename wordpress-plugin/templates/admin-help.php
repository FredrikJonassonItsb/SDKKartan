<?php
/**
 * Admin Help Template
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap itsl-sdkkartan-admin">
    <h1>
        <span class="dashicons dashicons-book"></span>
        <?php _e('SDKKartan Hjälp & Dokumentation', 'itsl-sdkkartan'); ?>
    </h1>
    
    <div class="itsl-help-content">
        <div class="itsl-help-section">
            <h2><?php _e('Kom igång', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('ITSL SDKKartan är ett WordPress-plugin som visar en interaktiv karta över alla kommuner och organisationer som är anslutna till ITSL HubS SDK-plattformen.', 'itsl-sdkkartan'); ?></p>
            
            <h3><?php _e('Snabbstart', 'itsl-sdkkartan'); ?></h3>
            <ol>
                <li><?php _e('Pluginet skapar automatiskt en sida på <code>/karta</code> vid aktivering.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Lägg till "Karta" i din huvudmeny via Utseende → Menyer.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Besök din webbplats och klicka på Karta för att se resultatet.', 'itsl-sdkkartan'); ?></li>
            </ol>
        </div>
        
        <div class="itsl-help-section">
            <h2><?php _e('Shortcodes', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('Använd shortcodes för att visa kartan på valfri sida eller inlägg.', 'itsl-sdkkartan'); ?></p>
            
            <table class="widefat">
                <thead>
                    <tr>
                        <th><?php _e('Shortcode', 'itsl-sdkkartan'); ?></th>
                        <th><?php _e('Beskrivning', 'itsl-sdkkartan'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>[sdkkartan]</code></td>
                        <td><?php _e('Visar hela kartan med standardinställningar.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan height="500px"]</code></td>
                        <td><?php _e('Visar kartan med anpassad höjd.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan show_header="no"]</code></td>
                        <td><?php _e('Visar kartan utan rubrik och beskrivning.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan title="Min rubrik"]</code></td>
                        <td><?php _e('Visar kartan med anpassad rubrik.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan_stats]</code></td>
                        <td><?php _e('Visar endast statistik (antal kommuner, regioner, etc.).', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan_stats style="cards"]</code></td>
                        <td><?php _e('Visar statistik i kortformat.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                    <tr>
                        <td><code>[sdkkartan_stats style="inline"]</code></td>
                        <td><?php _e('Visar statistik på en rad.', 'itsl-sdkkartan'); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="itsl-help-section">
            <h2><?php _e('Widget', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('Pluginet inkluderar en widget som kan visas i sidofält och andra widget-områden.', 'itsl-sdkkartan'); ?></p>
            <ol>
                <li><?php _e('Gå till Utseende → Widgets.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Hitta "ITSL SDKKartan" i listan över tillgängliga widgets.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Dra widgeten till önskat widget-område.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Konfigurera titel och visningsalternativ.', 'itsl-sdkkartan'); ?></li>
            </ol>
        </div>
        
        <div class="itsl-help-section">
            <h2><?php _e('Inställningar', 'itsl-sdkkartan'); ?></h2>
            
            <h3><?php _e('SDKKartan URL', 'itsl-sdkkartan'); ?></h3>
            <p><?php _e('URL till SDKKartan-applikationen. Standardvärdet pekar på den officiella ITSL-installationen. Ändra endast om du har en egen installation av SDKKartan.', 'itsl-sdkkartan'); ?></p>
            
            <h3><?php _e('Karta höjd', 'itsl-sdkkartan'); ?></h3>
            <p><?php _e('Standardhöjd för kartan. Kan anges i pixlar (t.ex. 700px) eller viewport-enheter (t.ex. 80vh).', 'itsl-sdkkartan'); ?></p>
            
            <h3><?php _e('Visa rubrik', 'itsl-sdkkartan'); ?></h3>
            <p><?php _e('Om aktiverat visas en rubrik och beskrivning ovanför kartan.', 'itsl-sdkkartan'); ?></p>
            
            <h3><?php _e('Anpassad CSS', 'itsl-sdkkartan'); ?></h3>
            <p><?php _e('Lägg till egen CSS för att anpassa kartans utseende. Exempel:', 'itsl-sdkkartan'); ?></p>
            <pre><code>.itsl-sdkkartan-container {
    border: 2px solid #0073aa;
    border-radius: 8px;
    overflow: hidden;
}

.itsl-sdkkartan-title {
    color: #0073aa;
    font-size: 28px;
}</code></pre>
        </div>
        
        <div class="itsl-help-section">
            <h2><?php _e('Felsökning', 'itsl-sdkkartan'); ?></h2>
            
            <h3><?php _e('Kartan visas inte', 'itsl-sdkkartan'); ?></h3>
            <ul>
                <li><?php _e('Kontrollera att SDKKartan URL är korrekt i inställningarna.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Verifiera att kartan är åtkomlig genom att besöka URL:en direkt i webbläsaren.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Kontrollera att det inte finns JavaScript-fel i webbläsarens konsol.', 'itsl-sdkkartan'); ?></li>
            </ul>
            
            <h3><?php _e('Karta-sidan saknas', 'itsl-sdkkartan'); ?></h3>
            <ul>
                <li><?php _e('Avaktivera och återaktivera pluginet för att skapa sidan automatiskt.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Alternativt, skapa en ny sida manuellt och lägg till shortcode [sdkkartan].', 'itsl-sdkkartan'); ?></li>
            </ul>
            
            <h3><?php _e('Statistik visas inte korrekt', 'itsl-sdkkartan'); ?></h3>
            <ul>
                <li><?php _e('Statistik cachas i 1 timme. Vänta eller rensa WordPress-cache.', 'itsl-sdkkartan'); ?></li>
                <li><?php _e('Kontrollera att SDKKartan API är åtkomligt.', 'itsl-sdkkartan'); ?></li>
            </ul>
        </div>
        
        <div class="itsl-help-section">
            <h2><?php _e('Support', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('Behöver du ytterligare hjälp? Kontakta oss:', 'itsl-sdkkartan'); ?></p>
            <ul>
                <li><strong><?php _e('E-post:', 'itsl-sdkkartan'); ?></strong> <a href="mailto:support@itsl.se">support@itsl.se</a></li>
                <li><strong><?php _e('Telefon:', 'itsl-sdkkartan'); ?></strong> +46 (0) 70 330 11 89</li>
                <li><strong><?php _e('Webbplats:', 'itsl-sdkkartan'); ?></strong> <a href="https://itsl.se" target="_blank">itsl.se</a></li>
            </ul>
        </div>
    </div>
    
    <div class="itsl-admin-footer">
        <p>
            <a href="<?php echo admin_url('admin.php?page=itsl-sdkkartan'); ?>">
                &larr; <?php _e('Tillbaka till Dashboard', 'itsl-sdkkartan'); ?>
            </a>
        </p>
    </div>
</div>
