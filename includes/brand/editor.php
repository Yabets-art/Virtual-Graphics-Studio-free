<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add menu item for the editor
function brand_editor_menu() {
    add_menu_page(
        'Brand Editor',
        'Editor',
        'manage_options',
        'brand-editor',
        'brand_editor_page',
        'dashicons-edit',
        20
    );
}
add_action('admin_menu', 'brand_editor_menu');

// Render the editor page
function brand_editor_page() {
    ?>
    <div id="editor-app">
        <h1>Brand Editor</h1>
        <div class="editor-container">
            <div id="editor-sidebar">
                <button id="templates-btn">Templates</button>
                <button id="elements-btn">Elements</button>
                <button id="text-btn">Text</button>
                <button id="uploads-btn">Uploads</button>
            </div>
            <div id="editor-workspace">
                <!-- The working area where the user interacts with content -->
                <canvas id="editor-canvas"></canvas>
            </div>
        </div>
    </div>
    <?php
    // Enqueue scripts and styles
    brand_editor_enqueue_assets();
}

function brand_editor_enqueue_assets() {
    wp_enqueue_style('editor-css', plugin_dir_url(__FILE__) . '../assets/css/editor.css');
    wp_enqueue_script('editor-js', plugin_dir_url(__FILE__) . '../assets/js/editor.js', ['jquery'], null, true);
}
