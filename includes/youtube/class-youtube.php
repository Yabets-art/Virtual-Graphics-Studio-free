<?php
/**
 * Generate dynamic cards for YouTube thumbnail templates.
 *
 * @param string $template_folder Path to the thumbnail template folder.
 * @param int|null $number_of_cards Number of cards to display (default is all).
 */
function vgd_generate_thumbnail_template_cards($template_folder, $number_of_cards = null) {
    $template_files = glob($template_folder . '*.php'); // Get all PHP files in the folder

    echo '<div class="vgd-card-grid">'; // Wrapper for grid layout

    // "+ Add" Card for thumbnails
    echo '<div class="vgd-card vgd-add-card">';
    echo '<a href="?page=vgd-thumbnail-question" class="vgd-add-card-link">';
    echo '<div class="vgd-card-content">';
    echo '<h4>' . __('+ Add Thumbnail', 'vgd') . '</h4>';
    echo '<p>' . __('Click to start creating a new thumbnail.', 'vgd') . '</p>';
    echo '</div>';
    echo '</a>';
    echo '</div>';

    // Thumbnail Template cards
    if (!empty($template_files)) {
        // Limit the number of templates if $number_of_cards is set
        if ($number_of_cards !== null) {
            $template_files = array_slice($template_files, 0, $number_of_cards);
        }

        foreach ($template_files as $template_file) {
            $template_name = basename($template_file, '.php'); // Extract file name without extension

            echo '<div class="vgd-card">';
            echo '<div class="vgd-card-content">';
            echo '<h4>' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p>' . __('Click to use or edit this template.', 'vgd') . '</p>';
            
            // "Use" button
            echo '<a href="?page=vgd-thumbnail-template&template=' . urlencode($template_name) . '" class="vgd-button vgd-use-button">';
            echo __('Use', 'vgd');
            echo '</a>';

            // "Edit" button
            echo '<a href="?page=thumbnail-editor&template=' . urlencode($template_name) . '" class="vgd-button vgd-edit-button">';
            echo __('Edit', 'vgd');
            echo '</a>';

            echo '</div>';
            echo '</div>';
        }
    } else {
        echo '<p>' . __('No thumbnail templates available.', 'vgd') . '</p>';
    }

    echo '</div>'; // Close grid layout
}

/**
 * Generate dynamic cards for YouTube banner templates.
 *
 * @param string $template_folder Path to the banner template folder.
 * @param int|null $number_of_cards Number of cards to display (default is all).
 */
function vgd_generate_banner_template_cards($template_folder, $number_of_cards = null) {
    $template_files = glob($template_folder . '*.php'); // Get all PHP files in the folder

    echo '<div class="vgd-card-grid">'; // Wrapper for grid layout

    // "+ Add" Card for banners
    echo '<div class="vgd-card vgd-add-card">';
    echo '<a href="?page=vgd-banner-question" class="vgd-add-card-link">';
    echo '<div class="vgd-card-content">';
    echo '<h4>' . __('+ Add Banner', 'vgd') . '</h4>';
    echo '<p>' . __('Click to start creating a new banner.', 'vgd') . '</p>';
    echo '</div>';
    echo '</a>';
    echo '</div>';

    // Banner Template cards
    if (!empty($template_files)) {
        // Limit the number of templates if $number_of_cards is set
        if ($number_of_cards !== null) {
            $template_files = array_slice($template_files, 0, $number_of_cards);
        }

        foreach ($template_files as $template_file) {
            $template_name = basename($template_file, '.php'); // Extract file name without extension

            echo '<div class="vgd-card">';
            echo '<div class="vgd-card-content">';
            echo '<h4>' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p>' . __('Click to use or edit this template.', 'vgd') . '</p>';
            
            // "Use" button
            echo '<a href="?page=vgd-banner-template&template=' . urlencode($template_name) . '" class="vgd-button vgd-use-button">';
            echo __('Use', 'vgd');
            echo '</a>';

            // "Edit" button
            echo '<a href="?page=banner-editor&template=' . urlencode($template_name) . '" class="vgd-button vgd-edit-button">';
            echo __('Edit', 'vgd');
            echo '</a>';

            echo '</div>';
            echo '</div>';
        }
    } else {
        echo '<p>' . __('No banner templates available.', 'vgd') . '</p>';
    }

    echo '</div>'; // Close grid layout
}

/**
 * Render the YouTube tab with separate sections for thumbnails and banners.
 */
function vgd_render_youtube_tab() {
    // Heading and description
    echo '<h2>' . __('YouTube (Thumbnail & Banner)', 'vgd') . '</h2>';
    echo '<p>' . __('Here you can create thumbnails and banners for YouTube.', 'vgd') . '</p>';

    // Thumbnail templates section
    echo '<div class="vgd-template-section">';
    echo '<h3>' . __('Thumbnail Templates', 'vgd') . '</h3>';
    $thumbnail_template_folder = VGD_PLUGIN_DIR . 'templates/thumbnails/';
    vgd_generate_thumbnail_template_cards($thumbnail_template_folder);
    echo '</div>';

    // Banner templates section
    echo '<div class="vgd-template-section">';
    echo '<h3>' . __('Banner Templates', 'vgd') . '</h3>';
    $banner_template_folder = VGD_PLUGIN_DIR . 'templates/banners/';
    vgd_generate_banner_template_cards($banner_template_folder);
    echo '</div>';
}
