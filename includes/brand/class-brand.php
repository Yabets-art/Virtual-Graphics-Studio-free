<?php 

function vgd_render_brand_tab() {
    echo '<div class="max-w-[1800px] mx-auto px-3 py-4">';
    
    // Main header with tabs
    echo '<div class="flex items-center justify-between mb-4 border-b border-gray-200">';
    echo '<h2 class="text-lg font-semibold text-gray-800">Brand Creator</h2>';
    echo '<div class="flex gap-4">';
    echo '<button id="logosTab" class="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 tab-button">Logos</button>';
    echo '<button id="businessCardsTab" class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 tab-button">Business Cards</button>';
    echo '</div>';
    echo '</div>';
    
    // Content sections
    echo '<div id="logoSection" class="template-section">';
    echo '<div id="templateContainer" class="w-full"></div>';
    echo '</div>';
    
    // Add Business Cards Section (initially hidden)
    echo '<div id="businessCardSection" class="template-section hidden">';
    echo '<div id="businessCardContainer" class="w-full"></div>';
    echo '</div>';
    
    echo '</div>';
    
    // Enqueue necessary scripts and styles

    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    
    wp_enqueue_script('fabric-js', 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js', array(), null, true);
    wp_enqueue_script('logo-templates', plugins_url('/assets/js/edithor_js/var/LogoTemplet.js', dirname(__FILE__, 2)), array(), null, true);
    wp_enqueue_script('template-display', plugins_url('/assets/js/PhpToJs/TemplateDisplay.js', dirname(__FILE__, 2)), array('fabric-js', 'logo-templates'), null, true);
    wp_enqueue_script('business-card-display', plugins_url('/assets/js/PhpToJs/BusinessCardDisplay.js', dirname(__FILE__, 2)), array('fabric-js'), null, true);
    wp_enqueue_script('business-templates', plugins_url('/assets/js/edithor_js/var/BusinessTemplet.js', dirname(__FILE__, 2)), array(), null, true);
    
    // Add tab switching script
    echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            const logosTab = document.getElementById("logosTab");
            const businessCardsTab = document.getElementById("businessCardsTab");
            const logoSection = document.getElementById("logoSection");
            const businessCardSection = document.getElementById("businessCardSection");
            
            function switchTab(activeTab, activeSection, inactiveTab, inactiveSection) {
                // Update tab styles
                activeTab.classList.remove("text-gray-500", "hover:text-gray-700");
                activeTab.classList.add("text-blue-600", "border-b-2", "border-blue-600");
                inactiveTab.classList.remove("text-blue-600", "border-b-2", "border-blue-600");
                inactiveTab.classList.add("text-gray-500", "hover:text-gray-700");
                
                // Show/hide sections
                activeSection.classList.remove("hidden");
                inactiveSection.classList.add("hidden");
            }
            
            logosTab.addEventListener("click", () => {
                switchTab(logosTab, logoSection, businessCardsTab, businessCardSection);
            });
            
            businessCardsTab.addEventListener("click", () => {
                switchTab(businessCardsTab, businessCardSection, logosTab, logoSection);
                // Initialize business card display if not already initialized
                if (!businessCardSection.hasAttribute("data-initialized")) {
                    businessCardSection.setAttribute("data-initialized", "true");
                }
            });
        });
    </script>';
}