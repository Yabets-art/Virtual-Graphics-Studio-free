<?php
/**
 * Generate dynamic cards for YouTube thumbnail templates.
 *
 * @param string $template_folder Path to the thumbnail template folder.
 * @param int|null $number_of_cards Number of cards to display (default is all).
 */
function vgd_generate_thumbnail_template_cards($template_folder, $number_of_cards = null) {
    $template_files = glob($template_folder . '*.php'); // Get all PHP files in the folder

    echo '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">'; // Wrapper for grid layout

    // "+ Add" Card for thumbnails
    echo '<div class="border border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition">';
    echo '<a href="?page=vgd-thumbnail-question" class="text-blue-500 hover:text-blue-700">';
    echo '<div>';
    echo '<h4 class="text-lg font-semibold">' . __('+ Add Thumbnail', 'vgd') . '</h4>';
    echo '<p class="text-sm text-gray-600">' . __('Click to start creating a new thumbnail.', 'vgd') . '</p>';
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

            echo '<div class="border rounded-lg shadow-lg p-6 hover:shadow-xl transition">';
            echo '<div class="flex flex-col items-center">';
            echo '<h4 class="text-lg font-semibold">' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p class="text-sm text-gray-600">' . __('Click to use or edit this template.', 'vgd') . '</p>';
            echo '<div class="mt-4 flex space-x-2">';
            
            // "Use" button
            echo '<a href="?page=vgd-thumbnail-template&template=' . urlencode($template_name) . '" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">';
            echo __('Use', 'vgd');
            echo '</a>';

            // "Edit" button
            echo '<a href="?page=thumbnail-editor&template=' . urlencode($template_name) . '" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">';
            echo __('Edit', 'vgd');
            echo '</a>';

            echo '</div>'; // End of buttons
            echo '</div>';
            echo '</div>';
        }
    } else {
        echo '<p class="text-center text-gray-500">' . __('No thumbnail templates available.', 'vgd') . '</p>';
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

    echo '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">'; // Wrapper for grid layout

    // "+ Add" Card for banners
    echo '<div class="border border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition">';
    echo '<a href="?page=vgd-banner-question" class="text-blue-500 hover:text-blue-700">';
    echo '<div>';
    echo '<h4 class="text-lg font-semibold">' . __('+ Add Banner', 'vgd') . '</h4>';
    echo '<p class="text-sm text-gray-600">' . __('Click to start creating a new banner.', 'vgd') . '</p>';
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

            echo '<div class="border rounded-lg shadow-lg p-6 hover:shadow-xl transition">';
            echo '<div class="flex flex-col items-center">';
            echo '<h4 class="text-lg font-semibold">' . esc_html(ucwords(str_replace('-', ' ', $template_name))) . '</h4>';
            echo '<p class="text-sm text-gray-600">' . __('Click to use or edit this template.', 'vgd') . '</p>';
            echo '<div class="mt-4 flex space-x-2">';
            
            // "Use" button
            echo '<a href="?page=vgd-banner-template&template=' . urlencode($template_name) . '" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">';
            echo __('Use', 'vgd');
            echo '</a>';

            // "Edit" button
            echo '<a href="?page=banner-editor&template=' . urlencode($template_name) . '" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">';
            echo __('Edit', 'vgd');
            echo '</a>';

            echo '</div>'; // End of buttons
            echo '</div>';
            echo '</div>';
        }
    } else {
        echo '<p class="text-center text-gray-500">' . __('No banner templates available.', 'vgd') . '</p>';
    }

    echo '</div>'; // Close grid layout
}

/**
 * Render the YouTube tab with separate sections for thumbnails and banners.
 */
function vgd_render_youtube_tab() {
    // Heading and description
    echo '<h2 class="text-2xl font-bold mb-4">' . __('YouTube (Thumbnail & Banner)', 'vgd') . '</h2>';
    echo '<p class="text-gray-600 mb-6">' . __('Here you can create thumbnails and banners for YouTube.', 'vgd') . '</p>';

    // Thumbnail templates section
    echo '<div class="mb-8">';
    echo '<h3 class="text-xl font-semibold mb-2">' . __('Thumbnail Templates', 'vgd') . '</h3>';
    $thumbnail_template_folder = VGD_PLUGIN_DIR . 'templates/thumbnails/';
    vgd_generate_thumbnail_template_cards($thumbnail_template_folder);
    echo '</div>';

    // Banner templates section
    echo '<div class="mb-8">';
    echo '<h3 class="text-xl font-semibold mb-2">' . __('Banner Templates', 'vgd') . '</h3>';
    $banner_template_folder = VGD_PLUGIN_DIR . 'templates/banners/';
    vgd_generate_banner_template_cards($banner_template_folder);
    echo '</div>';
}
