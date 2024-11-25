<?php

class VGD_YouTube {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_youtube_submenu']);
    }

    public function add_youtube_submenu() {
        add_submenu_page(
            'virtual-graphic-designer',
            'YouTube Designer',
            'YouTube',
            'manage_options',
            'vgd-youtube',
            [$this, 'render_youtube_page']
        );
    }

    public function render_youtube_page() {
        echo '<h2>YouTube Designer</h2>';
        echo '<p>Create YouTube Thumbnails and Banners here.</p>';
    }
}

new VGD_YouTube();
