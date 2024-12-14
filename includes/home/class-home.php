<?php

// Ensure WordPress environment is loaded
if (!defined('ABSPATH')) {
    exit;
}

// Render Dashboard Tab
function vgd_render_dashboard_tab() {
    echo '<h1 class="text-3xl font-bold text-center mb-4">' . __('Welcome to Virtual Graphic Designer', 'vgd') . '</h1>';
    echo '<p class="text-lg text-gray-600 text-center mb-6">' . __('Select a tool to get started:', 'vgd') . '</p>';
    echo my_auto_sliding_gallery();
}

// Gallery Function
if (!function_exists('my_auto_sliding_gallery')) {
    function my_auto_sliding_gallery() {
        $images_dir = VGD_PLUGIN_URL . 'assets/pictures/';
        $images = ['image1.png', 'image2.png', 'image3.png'];
        ob_start();
        ?>
        <div class="swiper-container w-full h-72 overflow-hidden rounded-lg shadow-lg">
            <div class="swiper-wrapper">
                <?php foreach ($images as $image): ?>
                    <div class="swiper-slide flex justify-center items-center bg-gray-100">
                        <img src="<?php echo esc_url($images_dir . $image); ?>" alt="Gallery Image" class="h-full w-auto object-cover">
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="swiper-button-next text-gray-700"></div>
            <div class="swiper-button-prev text-gray-700"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    // Register Shortcode
    add_shortcode('auto_sliding_gallery', 'my_auto_sliding_gallery');
}

// Enqueue Assets (Tailwind CSS, Swiper CSS, and JS)
function vgd_enqueue_assets() {
    wp_enqueue_style('swiper-css', 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css');
    wp_enqueue_script('swiper-js', 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js', [], null, true);

}
add_action('admin_enqueue_scripts', 'vgd_enqueue_assets');
