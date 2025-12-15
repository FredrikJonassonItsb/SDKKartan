<?php
/**
 * Admin Dashboard Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$plugin = ITSL_SDKKartan::get_instance();
$karta_url = $plugin->get_setting('karta_url', ITSL_SDKKARTAN_DEFAULT_URL);
?>

<div class="wrap itsl-sdkkartan-admin">
    <h1>
        <span class="dashicons dashicons-location-alt"></span>
        <?php _e('ITSL SDKKartan', 'itsl-sdkkartan'); ?>
    </h1>
    
    <div class="itsl-admin-header">
        <p class="itsl-admin-description">
            <?php _e('Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattformen.', 'itsl-sdkkartan'); ?>
        </p>
    </div>
    
    <div class="itsl-admin-grid">
        <!-- Snabbåtgärder -->
        <div class="itsl-admin-card">
            <h2><?php _e('Snabbåtgärder', 'itsl-sdkkartan'); ?></h2>
            <div class="itsl-admin-actions">
                <a href="<?php echo esc_url(home_url('/karta/')); ?>" class="button button-primary" target="_blank">
                    <span class="dashicons dashicons-visibility"></span>
                    <?php _e('Visa kartan', 'itsl-sdkkartan'); ?>
                </a>
                <a href="<?php echo esc_url($karta_url . '/admin'); ?>" class="button" target="_blank">
                    <span class="dashicons dashicons-admin-generic"></span>
                    <?php _e('Karta Admin', 'itsl-sdkkartan'); ?>
                </a>
                <a href="<?php echo admin_url('admin.php?page=itsl-sdkkartan-settings'); ?>" class="button">
                    <span class="dashicons dashicons-admin-settings"></span>
                    <?php _e('Inställningar', 'itsl-sdkkartan'); ?>
                </a>
            </div>
        </div>
        
        <!-- Shortcodes -->
        <div class="itsl-admin-card">
            <h2><?php _e('Shortcodes', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('Använd dessa shortcodes för att visa kartan på valfri sida:', 'itsl-sdkkartan'); ?></p>
            
            <div class="itsl-shortcode-box">
                <h4><?php _e('Visa hela kartan', 'itsl-sdkkartan'); ?></h4>
                <code>[sdkkartan]</code>
                <button class="button button-small itsl-copy-btn" data-copy="[sdkkartan]">
                    <span class="dashicons dashicons-clipboard"></span>
                </button>
            </div>
            
            <div class="itsl-shortcode-box">
                <h4><?php _e('Kartan med anpassad höjd', 'itsl-sdkkartan'); ?></h4>
                <code>[sdkkartan height="500px"]</code>
                <button class="button button-small itsl-copy-btn" data-copy='[sdkkartan height="500px"]'>
                    <span class="dashicons dashicons-clipboard"></span>
                </button>
            </div>
            
            <div class="itsl-shortcode-box">
                <h4><?php _e('Endast statistik', 'itsl-sdkkartan'); ?></h4>
                <code>[sdkkartan_stats]</code>
                <button class="button button-small itsl-copy-btn" data-copy="[sdkkartan_stats]">
                    <span class="dashicons dashicons-clipboard"></span>
                </button>
            </div>
            
            <div class="itsl-shortcode-box">
                <h4><?php _e('Kartan utan rubrik', 'itsl-sdkkartan'); ?></h4>
                <code>[sdkkartan show_header="no"]</code>
                <button class="button button-small itsl-copy-btn" data-copy='[sdkkartan show_header="no"]'>
                    <span class="dashicons dashicons-clipboard"></span>
                </button>
            </div>
        </div>
        
        <!-- Förhandsvisning -->
        <div class="itsl-admin-card itsl-admin-card-wide">
            <h2><?php _e('Förhandsvisning', 'itsl-sdkkartan'); ?></h2>
            <div class="itsl-preview-container">
                <iframe 
                    src="<?php echo esc_url($karta_url); ?>" 
                    width="100%" 
                    height="400" 
                    frameborder="0"
                    class="itsl-preview-iframe"
                ></iframe>
            </div>
        </div>
        
        <!-- Status -->
        <div class="itsl-admin-card">
            <h2><?php _e('Status', 'itsl-sdkkartan'); ?></h2>
            <table class="itsl-status-table">
                <tr>
                    <td><?php _e('Plugin-version', 'itsl-sdkkartan'); ?></td>
                    <td><strong><?php echo ITSL_SDKKARTAN_VERSION; ?></strong></td>
                </tr>
                <tr>
                    <td><?php _e('Karta URL', 'itsl-sdkkartan'); ?></td>
                    <td><code><?php echo esc_html($karta_url); ?></code></td>
                </tr>
                <tr>
                    <td><?php _e('Karta-sida', 'itsl-sdkkartan'); ?></td>
                    <td>
                        <?php
                        $karta_page = get_page_by_path('karta');
                        if ($karta_page) {
                            echo '<span class="itsl-status-ok">✓ ' . __('Skapad', 'itsl-sdkkartan') . '</span>';
                        } else {
                            echo '<span class="itsl-status-warning">⚠ ' . __('Saknas', 'itsl-sdkkartan') . '</span>';
                        }
                        ?>
                    </td>
                </tr>
                <tr>
                    <td><?php _e('WordPress-version', 'itsl-sdkkartan'); ?></td>
                    <td><?php echo get_bloginfo('version'); ?></td>
                </tr>
                <tr>
                    <td><?php _e('PHP-version', 'itsl-sdkkartan'); ?></td>
                    <td><?php echo phpversion(); ?></td>
                </tr>
            </table>
        </div>
        
        <!-- Support -->
        <div class="itsl-admin-card">
            <h2><?php _e('Support', 'itsl-sdkkartan'); ?></h2>
            <p><?php _e('Behöver du hjälp med SDKKartan?', 'itsl-sdkkartan'); ?></p>
            <ul>
                <li>
                    <a href="<?php echo admin_url('admin.php?page=itsl-sdkkartan-help'); ?>">
                        <span class="dashicons dashicons-book"></span>
                        <?php _e('Dokumentation', 'itsl-sdkkartan'); ?>
                    </a>
                </li>
                <li>
                    <a href="mailto:support@itsl.se">
                        <span class="dashicons dashicons-email"></span>
                        <?php _e('Kontakta support', 'itsl-sdkkartan'); ?>
                    </a>
                </li>
                <li>
                    <a href="https://itsl.se" target="_blank">
                        <span class="dashicons dashicons-external"></span>
                        <?php _e('Besök itsl.se', 'itsl-sdkkartan'); ?>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    
    <div class="itsl-admin-footer">
        <p>
            <?php _e('ITSL SDKKartan', 'itsl-sdkkartan'); ?> v<?php echo ITSL_SDKKARTAN_VERSION; ?> | 
            <?php _e('Utvecklad av', 'itsl-sdkkartan'); ?> <a href="https://itsl.se" target="_blank">ITSL Solutions</a>
        </p>
    </div>
</div>
