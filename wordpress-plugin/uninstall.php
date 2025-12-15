<?php
/**
 * ITSL SDKKartan Uninstall
 *
 * Körs när pluginet avinstalleras (raderas) från WordPress.
 * Rensar upp alla plugin-data från databasen.
 */

// Om uninstall inte anropas från WordPress, avsluta
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Ta bort plugin-inställningar
delete_option('itsl_sdkkartan_settings');

// Ta bort transients
delete_transient('itsl_sdkkartan_stats');

// Valfritt: Ta bort karta-sidan som skapades vid aktivering
// Avkommentera om du vill ta bort sidan automatiskt
/*
$karta_page = get_page_by_path('karta');
if ($karta_page) {
    wp_delete_post($karta_page->ID, true);
}
*/

// Rensa rewrite rules
flush_rewrite_rules();
