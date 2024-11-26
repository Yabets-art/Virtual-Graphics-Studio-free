<?php


function vgd_render_dashboard_tab() {
    echo '<h1>' . __('Welcome to Virtual Graphic Designer', 'vgd') . '</h1>';
    echo '<p>' . __('Select a tool to get started:', 'vgd') . '</p>';
    echo my_auto_sliding_gallery();
    echo do_shortcode('[auto_sliding_gallery]');


}

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('my_auto_sliding_gallery')) {
    function my_auto_sliding_gallery() {
        $images_dir = VGD_PLUGIN_URL . 'assets/pictures/';
        $images = ['image1.png', 'image2.png', 'image3.png'];
        ob_start();
        ?>
        <div class="swiper-container">
            <div class="swiper-wrapper">
                <?php foreach ($images as $image): ?>
                    <div class="swiper-slide">
                        <img src="<?php echo esc_url($images_dir . $image); ?>" alt="Gallery Image">
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    // Register the shortcode
    add_shortcode('auto_sliding_gallery', 'my_auto_sliding_gallery');
}
