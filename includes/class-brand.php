<?php

class VGD_Brand {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_brand_submenu']);
    }

    public function add_brand_submenu() {
        add_submenu_page(
            'virtual-graphic-designer',
            'Brand Designer',
            'Brand',
            'manage_options',
            'vgd-brand',
            [$this, 'render_brand_page']
        );
    }

    public function render_brand_page() {
        echo '<h2>Brand Designer</h2>';
        echo '<p>Create Logos and Business Cards here.</p>';
        echo '<form method="post" action="">';
        echo '<input type="text" name="brand_name" placeholder="Enter your Brand Name" />';
        echo '<button type="submit">Generate Design</button>';
        echo '</form>';
    }
}

new VGD_Brand();
