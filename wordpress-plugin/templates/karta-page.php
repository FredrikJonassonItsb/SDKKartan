<?php
/**
 * Karta Page Template
 * 
 * Denna template används för den virtuella /karta-sidan
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$plugin = ITSL_SDKKartan::get_instance();
$karta_url = $plugin->get_setting('karta_url', ITSL_SDKKARTAN_DEFAULT_URL);
$iframe_height = $plugin->get_setting('iframe_height', '700px');
$show_header = $plugin->get_setting('show_header', 'yes');
?>

<div class="itsl-sdkkartan-page">
    <div class="itsl-sdkkartan-container">
        <?php if ($show_header === 'yes') : ?>
        <header class="itsl-sdkkartan-page-header">
            <h1 class="itsl-sdkkartan-page-title">
                <?php _e('Anslutna kommuner och organisationer', 'itsl-sdkkartan'); ?>
            </h1>
            <p class="itsl-sdkkartan-page-description">
                <?php _e('Upptäck vilka svenska kommuner, regioner och organisationer som är anslutna till ITSL HubS SDK-plattform för säker digital kommunikation.', 'itsl-sdkkartan'); ?>
            </p>
        </header>
        <?php endif; ?>
        
        <div class="itsl-sdkkartan-iframe-wrapper" style="height: <?php echo esc_attr($iframe_height); ?>;">
            <iframe 
                src="<?php echo esc_url($karta_url); ?>" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen
                loading="lazy"
                title="<?php _e('SDKKartan - Anslutna kommuner och organisationer', 'itsl-sdkkartan'); ?>"
                class="itsl-sdkkartan-iframe"
            ></iframe>
        </div>
        
        <footer class="itsl-sdkkartan-page-footer">
            <p class="itsl-sdkkartan-powered-by">
                <?php _e('Drivs av', 'itsl-sdkkartan'); ?> 
                <a href="https://itsl.se" target="_blank" rel="noopener">ITSL Solutions</a> | 
                <a href="https://itsl.se/hubs" target="_blank" rel="noopener"><?php _e('Läs mer om HubS', 'itsl-sdkkartan'); ?></a>
            </p>
        </footer>
    </div>
</div>

<?php
get_footer();
