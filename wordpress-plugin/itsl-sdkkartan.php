<?php
/**
 * Plugin Name: ITSL SDKKartan
 * Plugin URI: https://itsl.se/karta
 * Description: Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattformen. Visar vilka svenska kommuner, regioner, myndigheter och övriga organisationer som är anslutna till plattformen för säker digital kommunikation.
 * Version: 1.0.0
 * Author: ITSL Solutions
 * Author URI: https://itsl.se
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: itsl-sdkkartan
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

// Förhindra direkt åtkomst
if (!defined('ABSPATH')) {
    exit;
}

// Plugin-konstanter
define('ITSL_SDKKARTAN_VERSION', '1.0.0');
define('ITSL_SDKKARTAN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ITSL_SDKKARTAN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ITSL_SDKKARTAN_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Standard-URL för SDKKartan (kan ändras i inställningar)
define('ITSL_SDKKARTAN_DEFAULT_URL', 'https://3000-ijinblqmpje61b8egrajf-807a6cb4.manusvm.computer');

/**
 * Huvudklass för ITSL SDKKartan plugin
 */
class ITSL_SDKKartan {
    
    /**
     * Singleton-instans
     */
    private static $instance = null;
    
    /**
     * Plugin-inställningar
     */
    private $settings;
    
    /**
     * Hämta singleton-instans
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Konstruktor
     */
    private function __construct() {
        $this->settings = get_option('itsl_sdkkartan_settings', array());
        
        // Initiera plugin
        add_action('init', array($this, 'init'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        
        // Registrera shortcodes
        add_shortcode('sdkkartan', array($this, 'shortcode_sdkkartan'));
        add_shortcode('sdkkartan_stats', array($this, 'shortcode_stats'));
        
        // Registrera widget
        add_action('widgets_init', array($this, 'register_widgets'));
        
        // SEO och meta-taggar
        add_action('wp_head', array($this, 'add_meta_tags'));
        
        // Aktivering och avaktivering
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Lägg till inställningslänk på plugin-sidan
        add_filter('plugin_action_links_' . ITSL_SDKKARTAN_PLUGIN_BASENAME, array($this, 'add_settings_link'));
    }
    
    /**
     * Initiera plugin
     */
    public function init() {
        // Ladda textdomän för översättningar
        load_plugin_textdomain('itsl-sdkkartan', false, dirname(ITSL_SDKKARTAN_PLUGIN_BASENAME) . '/languages');
        
        // Registrera custom post type för karta-sida (valfritt)
        $this->register_karta_page();
    }
    
    /**
     * Registrera karta-sida som en virtuell sida
     */
    private function register_karta_page() {
        // Lägg till rewrite rule för /karta
        add_rewrite_rule('^karta/?$', 'index.php?itsl_karta_page=1', 'top');
        add_rewrite_tag('%itsl_karta_page%', '1');
        
        // Hantera virtuell sida
        add_action('template_redirect', array($this, 'handle_karta_page'));
    }
    
    /**
     * Hantera virtuell karta-sida
     */
    public function handle_karta_page() {
        if (get_query_var('itsl_karta_page')) {
            // Inkludera template för karta-sidan
            include ITSL_SDKKARTAN_PLUGIN_DIR . 'templates/karta-page.php';
            exit;
        }
    }
    
    /**
     * Admin-initiering
     */
    public function admin_init() {
        // Registrera inställningar
        register_setting('itsl_sdkkartan_settings_group', 'itsl_sdkkartan_settings', array($this, 'sanitize_settings'));
        
        // Lägg till inställningssektioner
        add_settings_section(
            'itsl_sdkkartan_general',
            __('Allmänna inställningar', 'itsl-sdkkartan'),
            array($this, 'settings_section_general'),
            'itsl-sdkkartan-settings'
        );
        
        add_settings_section(
            'itsl_sdkkartan_display',
            __('Visningsinställningar', 'itsl-sdkkartan'),
            array($this, 'settings_section_display'),
            'itsl-sdkkartan-settings'
        );
        
        // Lägg till inställningsfält
        add_settings_field(
            'karta_url',
            __('SDKKartan URL', 'itsl-sdkkartan'),
            array($this, 'field_karta_url'),
            'itsl-sdkkartan-settings',
            'itsl_sdkkartan_general'
        );
        
        add_settings_field(
            'iframe_height',
            __('Karta höjd', 'itsl-sdkkartan'),
            array($this, 'field_iframe_height'),
            'itsl-sdkkartan-settings',
            'itsl_sdkkartan_display'
        );
        
        add_settings_field(
            'show_header',
            __('Visa rubrik', 'itsl-sdkkartan'),
            array($this, 'field_show_header'),
            'itsl-sdkkartan-settings',
            'itsl_sdkkartan_display'
        );
        
        add_settings_field(
            'custom_css',
            __('Anpassad CSS', 'itsl-sdkkartan'),
            array($this, 'field_custom_css'),
            'itsl-sdkkartan-settings',
            'itsl_sdkkartan_display'
        );
    }
    
    /**
     * Lägg till admin-meny
     */
    public function admin_menu() {
        // Huvudmeny
        add_menu_page(
            __('SDKKartan', 'itsl-sdkkartan'),
            __('SDKKartan', 'itsl-sdkkartan'),
            'manage_options',
            'itsl-sdkkartan',
            array($this, 'admin_page_dashboard'),
            'dashicons-location-alt',
            30
        );
        
        // Undermeny: Dashboard
        add_submenu_page(
            'itsl-sdkkartan',
            __('Dashboard', 'itsl-sdkkartan'),
            __('Dashboard', 'itsl-sdkkartan'),
            'manage_options',
            'itsl-sdkkartan',
            array($this, 'admin_page_dashboard')
        );
        
        // Undermeny: Inställningar
        add_submenu_page(
            'itsl-sdkkartan',
            __('Inställningar', 'itsl-sdkkartan'),
            __('Inställningar', 'itsl-sdkkartan'),
            'manage_options',
            'itsl-sdkkartan-settings',
            array($this, 'admin_page_settings')
        );
        
        // Undermeny: Hjälp
        add_submenu_page(
            'itsl-sdkkartan',
            __('Hjälp & Dokumentation', 'itsl-sdkkartan'),
            __('Hjälp', 'itsl-sdkkartan'),
            'manage_options',
            'itsl-sdkkartan-help',
            array($this, 'admin_page_help')
        );
    }
    
    /**
     * Ladda frontend-scripts och styles
     */
    public function enqueue_scripts() {
        wp_enqueue_style(
            'itsl-sdkkartan-frontend',
            ITSL_SDKKARTAN_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            ITSL_SDKKARTAN_VERSION
        );
        
        wp_enqueue_script(
            'itsl-sdkkartan-frontend',
            ITSL_SDKKARTAN_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            ITSL_SDKKARTAN_VERSION,
            true
        );
        
        // Lägg till anpassad CSS om definierad
        $custom_css = $this->get_setting('custom_css', '');
        if (!empty($custom_css)) {
            wp_add_inline_style('itsl-sdkkartan-frontend', $custom_css);
        }
    }
    
    /**
     * Ladda admin-scripts och styles
     */
    public function admin_enqueue_scripts($hook) {
        // Ladda endast på plugin-sidor
        if (strpos($hook, 'itsl-sdkkartan') === false) {
            return;
        }
        
        wp_enqueue_style(
            'itsl-sdkkartan-admin',
            ITSL_SDKKARTAN_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            ITSL_SDKKARTAN_VERSION
        );
        
        wp_enqueue_script(
            'itsl-sdkkartan-admin',
            ITSL_SDKKARTAN_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            ITSL_SDKKARTAN_VERSION,
            true
        );
    }
    
    /**
     * Shortcode för att visa kartan
     */
    public function shortcode_sdkkartan($atts) {
        $atts = shortcode_atts(array(
            'height' => $this->get_setting('iframe_height', '700px'),
            'width' => '100%',
            'show_header' => $this->get_setting('show_header', 'yes'),
            'title' => __('Anslutna kommuner och organisationer', 'itsl-sdkkartan'),
        ), $atts, 'sdkkartan');
        
        $karta_url = $this->get_setting('karta_url', ITSL_SDKKARTAN_DEFAULT_URL);
        
        ob_start();
        ?>
        <div class="itsl-sdkkartan-container">
            <?php if ($atts['show_header'] === 'yes') : ?>
            <div class="itsl-sdkkartan-header">
                <h2 class="itsl-sdkkartan-title"><?php echo esc_html($atts['title']); ?></h2>
                <p class="itsl-sdkkartan-description">
                    <?php _e('Upptäck vilka svenska kommuner, regioner och organisationer som är anslutna till ITSL HubS SDK-plattform för säker digital kommunikation.', 'itsl-sdkkartan'); ?>
                </p>
            </div>
            <?php endif; ?>
            
            <div class="itsl-sdkkartan-iframe-wrapper" style="height: <?php echo esc_attr($atts['height']); ?>;">
                <iframe 
                    src="<?php echo esc_url($karta_url); ?>" 
                    width="<?php echo esc_attr($atts['width']); ?>" 
                    height="100%" 
                    frameborder="0" 
                    allowfullscreen
                    loading="lazy"
                    title="<?php echo esc_attr($atts['title']); ?>"
                    class="itsl-sdkkartan-iframe"
                ></iframe>
            </div>
            
            <div class="itsl-sdkkartan-footer">
                <p class="itsl-sdkkartan-powered-by">
                    <?php _e('Drivs av', 'itsl-sdkkartan'); ?> 
                    <a href="https://itsl.se" target="_blank" rel="noopener">ITSL Solutions</a>
                </p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Shortcode för att visa statistik
     */
    public function shortcode_stats($atts) {
        $atts = shortcode_atts(array(
            'style' => 'cards', // cards, inline, minimal
        ), $atts, 'sdkkartan_stats');
        
        // Hämta statistik från API (eller cache)
        $stats = $this->get_stats();
        
        ob_start();
        ?>
        <div class="itsl-sdkkartan-stats itsl-sdkkartan-stats-<?php echo esc_attr($atts['style']); ?>">
            <div class="itsl-stat-item">
                <span class="itsl-stat-number"><?php echo esc_html($stats['municipalities']); ?></span>
                <span class="itsl-stat-label"><?php _e('Kommuner', 'itsl-sdkkartan'); ?></span>
            </div>
            <div class="itsl-stat-item">
                <span class="itsl-stat-number"><?php echo esc_html($stats['regions']); ?></span>
                <span class="itsl-stat-label"><?php _e('Regioner', 'itsl-sdkkartan'); ?></span>
            </div>
            <div class="itsl-stat-item">
                <span class="itsl-stat-number"><?php echo esc_html($stats['authorities']); ?></span>
                <span class="itsl-stat-label"><?php _e('Myndigheter', 'itsl-sdkkartan'); ?></span>
            </div>
            <div class="itsl-stat-item">
                <span class="itsl-stat-number"><?php echo esc_html($stats['others']); ?></span>
                <span class="itsl-stat-label"><?php _e('Övriga', 'itsl-sdkkartan'); ?></span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Hämta statistik
     */
    private function get_stats() {
        // Försök hämta från cache
        $stats = get_transient('itsl_sdkkartan_stats');
        
        if ($stats === false) {
            // Standard-värden om API inte är tillgängligt
            $stats = array(
                'municipalities' => '290',
                'regions' => '21',
                'authorities' => '50+',
                'others' => '100+',
            );
            
            // Försök hämta från API
            $karta_url = $this->get_setting('karta_url', ITSL_SDKKARTAN_DEFAULT_URL);
            $api_url = trailingslashit($karta_url) . 'api/stats';
            
            $response = wp_remote_get($api_url, array('timeout' => 5));
            
            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $body = json_decode(wp_remote_retrieve_body($response), true);
                if ($body && isset($body['municipalities'])) {
                    $stats = array(
                        'municipalities' => $body['municipalities'] ?? '290',
                        'regions' => $body['regions'] ?? '21',
                        'authorities' => $body['authorities'] ?? '50+',
                        'others' => $body['others'] ?? '100+',
                    );
                }
            }
            
            // Cacha i 1 timme
            set_transient('itsl_sdkkartan_stats', $stats, HOUR_IN_SECONDS);
        }
        
        return $stats;
    }
    
    /**
     * Registrera widgets
     */
    public function register_widgets() {
        register_widget('ITSL_SDKKartan_Widget');
    }
    
    /**
     * Lägg till meta-taggar för SEO
     */
    public function add_meta_tags() {
        if (get_query_var('itsl_karta_page') || is_page('karta')) {
            ?>
            <!-- ITSL SDKKartan SEO -->
            <meta name="description" content="<?php _e('Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattform för säker digital kommunikation.', 'itsl-sdkkartan'); ?>">
            <meta property="og:title" content="<?php _e('Karta över anslutna kommuner | ITSL HubS', 'itsl-sdkkartan'); ?>">
            <meta property="og:description" content="<?php _e('Upptäck vilka svenska kommuner, regioner och organisationer som är anslutna till ITSL HubS SDK-plattform.', 'itsl-sdkkartan'); ?>">
            <meta property="og:type" content="website">
            <meta property="og:url" content="<?php echo esc_url(home_url('/karta/')); ?>">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="<?php _e('Karta över anslutna kommuner | ITSL HubS', 'itsl-sdkkartan'); ?>">
            <meta name="twitter:description" content="<?php _e('Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattform.', 'itsl-sdkkartan'); ?>">
            
            <!-- Schema.org Structured Data -->
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "ITSL HubS SDKKartan",
                "description": "<?php _e('Interaktiv karta över anslutna kommuner och organisationer till ITSL HubS SDK-plattform för säker digital kommunikation.', 'itsl-sdkkartan'); ?>",
                "url": "<?php echo esc_url(home_url('/karta/')); ?>",
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
            </script>
            <?php
        }
    }
    
    /**
     * Plugin-aktivering
     */
    public function activate() {
        // Sätt standardinställningar
        $default_settings = array(
            'karta_url' => ITSL_SDKKARTAN_DEFAULT_URL,
            'iframe_height' => '700px',
            'show_header' => 'yes',
            'custom_css' => '',
        );
        
        if (!get_option('itsl_sdkkartan_settings')) {
            add_option('itsl_sdkkartan_settings', $default_settings);
        }
        
        // Skapa karta-sida om den inte finns
        $this->create_karta_page();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Skapa karta-sida
     */
    private function create_karta_page() {
        // Kontrollera om sidan redan finns
        $existing_page = get_page_by_path('karta');
        
        if (!$existing_page) {
            $page_data = array(
                'post_title' => __('Karta', 'itsl-sdkkartan'),
                'post_content' => '[sdkkartan]',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_name' => 'karta',
            );
            
            wp_insert_post($page_data);
        }
    }
    
    /**
     * Plugin-avaktivering
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Rensa cache
        delete_transient('itsl_sdkkartan_stats');
    }
    
    /**
     * Lägg till inställningslänk på plugin-sidan
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=itsl-sdkkartan-settings') . '">' . __('Inställningar', 'itsl-sdkkartan') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Hämta inställning
     */
    public function get_setting($key, $default = '') {
        return isset($this->settings[$key]) ? $this->settings[$key] : $default;
    }
    
    /**
     * Sanitera inställningar
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['karta_url'])) {
            $sanitized['karta_url'] = esc_url_raw($input['karta_url']);
        }
        
        if (isset($input['iframe_height'])) {
            $sanitized['iframe_height'] = sanitize_text_field($input['iframe_height']);
        }
        
        if (isset($input['show_header'])) {
            $sanitized['show_header'] = $input['show_header'] === 'yes' ? 'yes' : 'no';
        }
        
        if (isset($input['custom_css'])) {
            $sanitized['custom_css'] = wp_strip_all_tags($input['custom_css']);
        }
        
        return $sanitized;
    }
    
    // =========================================
    // ADMIN-SIDOR
    // =========================================
    
    /**
     * Admin Dashboard-sida
     */
    public function admin_page_dashboard() {
        include ITSL_SDKKARTAN_PLUGIN_DIR . 'templates/admin-dashboard.php';
    }
    
    /**
     * Admin Inställningar-sida
     */
    public function admin_page_settings() {
        include ITSL_SDKKARTAN_PLUGIN_DIR . 'templates/admin-settings.php';
    }
    
    /**
     * Admin Hjälp-sida
     */
    public function admin_page_help() {
        include ITSL_SDKKARTAN_PLUGIN_DIR . 'templates/admin-help.php';
    }
    
    // =========================================
    // INSTÄLLNINGSFÄLT
    // =========================================
    
    public function settings_section_general() {
        echo '<p>' . __('Konfigurera grundläggande inställningar för SDKKartan.', 'itsl-sdkkartan') . '</p>';
    }
    
    public function settings_section_display() {
        echo '<p>' . __('Anpassa hur kartan visas på din webbplats.', 'itsl-sdkkartan') . '</p>';
    }
    
    public function field_karta_url() {
        $value = $this->get_setting('karta_url', ITSL_SDKKARTAN_DEFAULT_URL);
        ?>
        <input type="url" name="itsl_sdkkartan_settings[karta_url]" value="<?php echo esc_attr($value); ?>" class="regular-text" />
        <p class="description"><?php _e('URL till SDKKartan-applikationen. Ändra endast om du har en egen installation.', 'itsl-sdkkartan'); ?></p>
        <?php
    }
    
    public function field_iframe_height() {
        $value = $this->get_setting('iframe_height', '700px');
        ?>
        <input type="text" name="itsl_sdkkartan_settings[iframe_height]" value="<?php echo esc_attr($value); ?>" class="small-text" />
        <p class="description"><?php _e('Höjd på kartan (t.ex. 700px, 80vh).', 'itsl-sdkkartan'); ?></p>
        <?php
    }
    
    public function field_show_header() {
        $value = $this->get_setting('show_header', 'yes');
        ?>
        <label>
            <input type="checkbox" name="itsl_sdkkartan_settings[show_header]" value="yes" <?php checked($value, 'yes'); ?> />
            <?php _e('Visa rubrik och beskrivning ovanför kartan', 'itsl-sdkkartan'); ?>
        </label>
        <?php
    }
    
    public function field_custom_css() {
        $value = $this->get_setting('custom_css', '');
        ?>
        <textarea name="itsl_sdkkartan_settings[custom_css]" rows="5" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
        <p class="description"><?php _e('Lägg till anpassad CSS för att styla kartan.', 'itsl-sdkkartan'); ?></p>
        <?php
    }
}

/**
 * Widget för SDKKartan
 */
class ITSL_SDKKartan_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'itsl_sdkkartan_widget',
            __('ITSL SDKKartan', 'itsl-sdkkartan'),
            array(
                'description' => __('Visar statistik och länk till SDKKartan.', 'itsl-sdkkartan'),
            )
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $show_stats = isset($instance['show_stats']) ? $instance['show_stats'] : true;
        $show_link = isset($instance['show_link']) ? $instance['show_link'] : true;
        
        echo '<div class="itsl-sdkkartan-widget">';
        
        if ($show_stats) {
            echo do_shortcode('[sdkkartan_stats style="minimal"]');
        }
        
        if ($show_link) {
            echo '<p class="itsl-widget-link"><a href="' . esc_url(home_url('/karta/')) . '" class="button">' . __('Visa karta', 'itsl-sdkkartan') . '</a></p>';
        }
        
        echo '</div>';
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : __('Anslutna till HubS', 'itsl-sdkkartan');
        $show_stats = isset($instance['show_stats']) ? (bool) $instance['show_stats'] : true;
        $show_link = isset($instance['show_link']) ? (bool) $instance['show_link'] : true;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php _e('Titel:', 'itsl-sdkkartan'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_stats); ?> id="<?php echo esc_attr($this->get_field_id('show_stats')); ?>" name="<?php echo esc_attr($this->get_field_name('show_stats')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_stats')); ?>"><?php _e('Visa statistik', 'itsl-sdkkartan'); ?></label>
        </p>
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_link); ?> id="<?php echo esc_attr($this->get_field_id('show_link')); ?>" name="<?php echo esc_attr($this->get_field_name('show_link')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_link')); ?>"><?php _e('Visa länk till karta', 'itsl-sdkkartan'); ?></label>
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '';
        $instance['show_stats'] = isset($new_instance['show_stats']) ? true : false;
        $instance['show_link'] = isset($new_instance['show_link']) ? true : false;
        return $instance;
    }
}

// Initiera plugin
ITSL_SDKKartan::get_instance();
