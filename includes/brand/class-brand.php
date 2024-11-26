<?php
/**
 * Generate dynamic cards for logo templates.
 *
 * @param string $template_folder Path to the logo template folder.
 * @param int|null $number_of_cards Number of cards to display (default is all).
 */
function vgd_generate_logo_template_cards($template_folder, $number_of_cards = null) {
    $template_files = glob($template_folder . '*.php'); // Get all PHP files in the folder

    echo '<div class="vgd-card-grid">'; // Wrapper for grid layout

    // "+ Add" Card for logos
    echo '<div class="vgd-card vgd-add-card">';
    echo '<a href="?page=vgd-logo-question" class="vgd-add-card-link">';
    echo '<div class="vgd-card-content">';
    echo '<h4>' . __('+ Add Logo', 'vgd') . '</h4>';
    echo '<p>' . __('Click to start creating a new logo.', 'vgd') . '</p>';
    echo '</div>';
    echo '</a>';
    echo '</div>';

    // Logo Template cards
    if (!empty($template_files)) {
        // Limit the number of templates if $number_of_cards is set
        if ($number_of_cards !== null) {
            $template_files = array_slice($template_files, 0, $number_of_cards);
        }

        foreach ($template_files as $template_file) {
            $template_name = basename($template_file, '.php'); // Extract file name without extension

            echo '<div class="vgd-card">';
            echo '<a href="?page=vgd-logo-template&template=' . urlencode($template_name) . '" class="vgd-template-card">';
            echo '<div class="vgd-card-content">';
            echo '<h4>' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p>' . __('Click to use this template.', 'vgd') . '</p>';
            echo '</div>';
            echo '</a>';
            echo '</div>';
        }
    } else {
        echo '<p>' . __('No logo templates available.', 'vgd') . '</p>';
    }

    echo '</div>'; // Close grid layout
}

/**
 * Generate dynamic cards for business card templates.
 *
 * @param string $template_folder Path to the business card template folder.
 * @param int|null $number_of_cards Number of cards to display (default is all).
 */
function vgd_generate_business_card_template_cards($template_folder, $number_of_cards = null) {
    $template_files = glob($template_folder . '*.php'); // Get all PHP files in the folder

    echo '<div class="vgd-card-grid">'; // Wrapper for grid layout

    // "+ Add" Card for business cards
    echo '<div class="vgd-card vgd-add-card">';
    echo '<a href="?page=vgd-business-question" class="vgd-add-card-link">';
    echo '<div class="vgd-card-content">';
    echo '<h4>' . __('+ Add Business Card', 'vgd') . '</h4>';
    echo '<p>' . __('Click to start creating a new business card.', 'vgd') . '</p>';
    echo '</div>';
    echo '</a>';
    echo '</div>';

    // Business Card Template cards
    if (!empty($template_files)) {
        // Limit the number of templates if $number_of_cards is set
        if ($number_of_cards !== null) {
            $template_files = array_slice($template_files, 0, $number_of_cards);
        }

        foreach ($template_files as $template_file) {
            $template_name = basename($template_file, '.php'); // Extract file name without extension

            echo '<div class="vgd-card">';
            echo '<a href="?page=vgd-business-template&template=' . urlencode($template_name) . '" class="vgd-template-card">';
            echo '<div class="vgd-card-content">';
            echo '<h4>' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p>' . __('Click to use this template.', 'vgd') . '</p>';
            echo '</div>';
            echo '</a>';
            echo '</div>';
        }
    } else {
        echo '<p>' . __('No business card templates available.', 'vgd') . '</p>';
    }

    echo '</div>'; // Close grid layout
}

/**
 * Render the Brand tab with separate sections for logos and business cards.
 */
function vgd_render_brand_tab() {
    // Heading and description
    echo '<h2>' . __('Brand (Logo & Business Card)', 'vgd') . '</h2>';

    // Logo templates section
    echo '<div class="vgd-template-section">';
    echo '<h3>' . __('Logo Templates', 'vgd') . '</h3>';
    $logo_template_folder = VGD_PLUGIN_DIR . 'templates/logos/';
    vgd_generate_logo_template_cards($logo_template_folder);
    echo '</div>';

    // Business card templates section
    echo '<div class="vgd-template-section">';
    echo '<h3>' . __('Business Card Templates', 'vgd') . '</h3>';
    $business_template_folder = VGD_PLUGIN_DIR . 'templates/business-cards/';
    vgd_generate_business_card_template_cards($business_template_folder);
    echo '</div>';
}
