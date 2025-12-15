/**
 * ITSL SDKKartan - Frontend JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Lägg till loading-animation för iframes
        $('.itsl-sdkkartan-iframe-wrapper').each(function() {
            var $wrapper = $(this);
            var $iframe = $wrapper.find('.itsl-sdkkartan-iframe');
            
            // Lägg till loading-klass
            $wrapper.addClass('loading');
            
            // Ta bort loading när iframe har laddats
            $iframe.on('load', function() {
                $wrapper.removeClass('loading');
            });
            
            // Timeout för att ta bort loading om det tar för lång tid
            setTimeout(function() {
                $wrapper.removeClass('loading');
            }, 10000);
        });
        
        // Responsiv iframe-höjd
        function adjustIframeHeight() {
            $('.itsl-sdkkartan-iframe-wrapper').each(function() {
                var $wrapper = $(this);
                var windowHeight = $(window).height();
                var minHeight = 400;
                
                // Om wrapper har vh-baserad höjd, beräkna pixlar
                var currentHeight = $wrapper.css('height');
                if (currentHeight.indexOf('vh') > -1) {
                    var vhValue = parseFloat(currentHeight);
                    var calculatedHeight = (windowHeight * vhValue) / 100;
                    
                    if (calculatedHeight < minHeight) {
                        $wrapper.css('height', minHeight + 'px');
                    }
                }
            });
        }
        
        // Kör vid sidladdning och fönsterändring
        adjustIframeHeight();
        $(window).on('resize', adjustIframeHeight);
        
        // Fullskärmsläge (om stöds)
        $('.itsl-sdkkartan-fullscreen-btn').on('click', function(e) {
            e.preventDefault();
            
            var $iframe = $(this).closest('.itsl-sdkkartan-container').find('.itsl-sdkkartan-iframe')[0];
            
            if ($iframe) {
                if ($iframe.requestFullscreen) {
                    $iframe.requestFullscreen();
                } else if ($iframe.webkitRequestFullscreen) {
                    $iframe.webkitRequestFullscreen();
                } else if ($iframe.msRequestFullscreen) {
                    $iframe.msRequestFullscreen();
                }
            }
        });
        
        // Lazy loading för iframes utanför viewport
        if ('IntersectionObserver' in window) {
            var lazyIframes = document.querySelectorAll('.itsl-sdkkartan-iframe[data-src]');
            
            var iframeObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var iframe = entry.target;
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                        iframeObserver.unobserve(iframe);
                    }
                });
            }, {
                rootMargin: '100px 0px'
            });
            
            lazyIframes.forEach(function(iframe) {
                iframeObserver.observe(iframe);
            });
        }
        
        // Animera statistik-siffror
        function animateStats() {
            $('.itsl-stat-number').each(function() {
                var $this = $(this);
                var finalValue = $this.text();
                
                // Hoppa över om redan animerad eller innehåller +
                if ($this.data('animated') || finalValue.indexOf('+') > -1) {
                    return;
                }
                
                var numericValue = parseInt(finalValue, 10);
                
                if (!isNaN(numericValue) && numericValue > 0) {
                    $this.data('animated', true);
                    
                    $({ count: 0 }).animate({ count: numericValue }, {
                        duration: 1500,
                        easing: 'swing',
                        step: function() {
                            $this.text(Math.floor(this.count));
                        },
                        complete: function() {
                            $this.text(numericValue);
                        }
                    });
                }
            });
        }
        
        // Kör animation när element kommer i viewport
        if ('IntersectionObserver' in window) {
            var statsObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        animateStats();
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });
            
            var statsContainers = document.querySelectorAll('.itsl-sdkkartan-stats');
            statsContainers.forEach(function(container) {
                statsObserver.observe(container);
            });
        } else {
            // Fallback för äldre webbläsare
            animateStats();
        }
        
    });
    
})(jQuery);
