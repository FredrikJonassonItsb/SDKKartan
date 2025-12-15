/**
 * ITSL SDKKartan - Admin JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Kopiera shortcode till urklipp
        $('.itsl-copy-btn').on('click', function(e) {
            e.preventDefault();
            
            var textToCopy = $(this).data('copy');
            var $button = $(this);
            var originalHtml = $button.html();
            
            // Försök använda Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(function() {
                    showCopySuccess($button, originalHtml);
                }).catch(function() {
                    fallbackCopy(textToCopy, $button, originalHtml);
                });
            } else {
                fallbackCopy(textToCopy, $button, originalHtml);
            }
        });
        
        // Fallback för äldre webbläsare
        function fallbackCopy(text, $button, originalHtml) {
            var $temp = $('<textarea>');
            $('body').append($temp);
            $temp.val(text).select();
            
            try {
                document.execCommand('copy');
                showCopySuccess($button, originalHtml);
            } catch (err) {
                console.error('Kunde inte kopiera:', err);
            }
            
            $temp.remove();
        }
        
        // Visa framgångsmeddelande
        function showCopySuccess($button, originalHtml) {
            $button.html('<span class="dashicons dashicons-yes"></span>');
            $button.addClass('button-primary');
            
            setTimeout(function() {
                $button.html(originalHtml);
                $button.removeClass('button-primary');
            }, 1500);
        }
        
        // Förhandsvisning av iframe-höjd
        $('input[name="itsl_sdkkartan_settings[iframe_height]"]').on('change', function() {
            var height = $(this).val();
            $('.itsl-preview-iframe').css('height', height);
        });
        
        // Bekräfta innan URL ändras
        $('input[name="itsl_sdkkartan_settings[karta_url]"]').on('change', function() {
            var newUrl = $(this).val();
            var defaultUrl = 'https://3000-ijinblqmpje61b8egrajf-807a6cb4.manusvm.computer';
            
            if (newUrl !== defaultUrl && newUrl !== '') {
                var confirmed = confirm(
                    'Du håller på att ändra SDKKartan URL till en anpassad adress.\n\n' +
                    'Är du säker på att den nya URL:en är korrekt?\n\n' +
                    'Ny URL: ' + newUrl
                );
                
                if (!confirmed) {
                    $(this).val(defaultUrl);
                }
            }
        });
        
        // Ladda-animation för förhandsvisning
        $('.itsl-preview-iframe').on('load', function() {
            $(this).parent().removeClass('loading');
        });
        
        // Lägg till loading-klass initialt
        $('.itsl-preview-container').addClass('loading');
        
    });
    
})(jQuery);
