<?php


function vgd_render_dashboard_tab() {
    echo '<h1>' . __('Welcome to Virtual Graphic Designer', 'vgd') . '</h1>';
    echo '<p>' . __('Select a tool to get started:', 'vgd') . '</p>';
    echo my_auto_sliding_gallery();
    echo do_shortcode('[auto_sliding_gallery]');

}
function my_auto_sliding_gallery() {
    // Fetch images dynamically (example: from a media library query or custom field)
    $images_dir = get_template_directory_uri() . '/assets/pictures/';
    $images = array(
        'image1.png',
        'image2.png',
        'image3.png',
    );

    ob_start();
    ?>
    <div class="swiper-container">
        <div class="swiper-wrapper">
            <?php foreach ($images as $image): ?>
                <div class="swiper-slide">
                    <img src="<?php echo esc_url($image); ?>" alt="Gallery Image">
                </div>
            <?php endforeach; ?>
        </div>
        <!-- Optional navigation -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('auto_sliding_gallery', 'my_auto_sliding_gallery');
