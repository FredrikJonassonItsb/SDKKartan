<?php
/**
 * Admin Settings Template
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap itsl-sdkkartan-admin">
    <h1>
        <span class="dashicons dashicons-admin-settings"></span>
        <?php _e('SDKKartan Inställningar', 'itsl-sdkkartan'); ?>
    </h1>
    
    <form method="post" action="options.php">
        <?php
        settings_fields('itsl_sdkkartan_settings_group');
        do_settings_sections('itsl-sdkkartan-settings');
        submit_button(__('Spara inställningar', 'itsl-sdkkartan'));
        ?>
    </form>
    
    <div class="itsl-admin-footer">
        <p>
            <a href="<?php echo admin_url('admin.php?page=itsl-sdkkartan'); ?>">
                &larr; <?php _e('Tillbaka till Dashboard', 'itsl-sdkkartan'); ?>
            </a>
        </p>
    </div>
</div>
