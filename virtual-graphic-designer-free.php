<?php
/**
 * Plugin Name: Virtual Graphic Designer
 * Plugin URI: unknown
 * Description: A free tool to create logos, banners, YouTube thumbnails, social media posts, and communicate with an AI assistant.
 * Version: 1.0
 * Author: Y and C
 * Author URI: unknown
 * License: GPL2
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('VGD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('VGD_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoload necessary files
function vgd_autoload_classes() {
    $classes = [
        'home/class-home.php',
        'brand/class-brand.php',
        'youtube/class-youtube.php',
        'banner/class-banner.php',
        'post/class-posts.php',
        'chat/class-ai-chat.php',
        'class-setting.php',
    ];

    foreach ($classes as $class) {
        $file_path = VGD_PLUGIN_DIR . 'includes/' . $class;
        if (file_exists($file_path)) {
            require_once $file_path;
        }
    }
}
add_action('plugins_loaded', 'vgd_autoload_classes');
// Add Admin Menu with additional tools
function vgd_add_menu() {
    add_menu_page(
        __('Virtual Graphic Designer', 'vgd'), // Page title
        __('VGD', 'vgd'), // Menu title
        'manage_options', // Capability
        'virtual-graphic-designer', // Menu slug
        'vgd_dashboard_page', // Callback function
        'dashicons-format-image', // Icon
        10 // Position
    );

    // Submenu Pages for different tools
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('Home', 'vgd'), // Page title
        __('Home', 'vgd'), // Menu title
        'manage_options', // Capability
        'virtual-graphic-designer', // Slug
        'vgd_dashboard_page' // Callback function
    );
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('Brand (Logo & Business Card)', 'vgd'), // Page title
        __('Brand', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-brand', // Slug
        'vgd_render_brand_tab' // Callback function
    );
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('YouTube (Thumbnail & Banner)', 'vgd'), // Page title
        __('YouTube', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-youtube', // Slug
        'vgd_render_youtube_tab' // Callback function
    );
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('Banner (Event & Business)', 'vgd'), // Page title
        __('Banner', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-banner', // Slug
        'vgd_render_banner_tab' // Callback function
    );
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('Social Media Posts', 'vgd'), // Page title
        __('Social Media', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-posts', // Slug
        'vgd_render_posts_tab' // Callback function
    );
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('AI Chat', 'vgd'), // Page title
        __('AI Chat', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-ai-chat', // Slug
        'vgd_render_ai_chat_tab' // Callback function
    );

    // Settings page
    add_submenu_page(
        'virtual-graphic-designer', // Parent slug
        __('Settings', 'vgd'), // Page title
        __('Settings', 'vgd'), // Menu title
        'manage_options', // Capability
        'vgd-settings', // Slug
        'vgd_settings_page' // Callback function
    );
}
add_action('admin_menu', 'vgd_add_menu');

// Dashboard Page
function vgd_dashboard_page() {
    $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';

    // Navigation
    echo '<nav class="nav-tab-wrapper vgd-nav-bar">';
    echo '<a href="?page=virtual-graphic-designer&tab=dashboard" class="nav-tab ' . ($current_tab === 'dashboard' ? 'nav-tab-active' : '') . '">' . __('Home', 'vgd') . '</a>';
    echo '<a href="?page=virtual-graphic-designer&tab=brand" class="nav-tab ' . ($current_tab === 'brand' ? 'nav-tab-active' : '') . '">' . __('Brand (Logo & Business Card)', 'vgd') . '</a>';
    echo '<a href="?page=virtual-graphic-designer&tab=youtube" class="nav-tab ' . ($current_tab === 'youtube' ? 'nav-tab-active' : '') . '">' . __('YouTube (Thumbnail & Banner)', 'vgd') . '</a>';
    echo '<a href="?page=virtual-graphic-designer&tab=banner" class="nav-tab ' . ($current_tab === 'banner' ? 'nav-tab-active' : '') . '">' . __('Banner (Event & Business)', 'vgd') . '</a>';
    echo '<a href="?page=virtual-graphic-designer&tab=posts" class="nav-tab ' . ($current_tab === 'posts' ? 'nav-tab-active' : '') . '">' . __('Social Media Posts', 'vgd') . '</a>';
    echo '<a href="?page=virtual-graphic-designer&tab=ai-chat" class="nav-tab ' . ($current_tab === 'ai-chat' ? 'nav-tab-active' : '') . '">' . __('AI Chat', 'vgd') . '</a>';
    echo '</nav>';

    // Content based on tab
    echo '<div class="vgd-content">';
    switch ($current_tab) {
        case 'brand':
            vgd_render_brand_tab();
            break;
        case 'youtube':
            vgd_render_youtube_tab();
            break;
        case 'banner':
            vgd_render_banner_tab();
            break;
        case 'posts':
            vgd_render_posts_tab();
            break;
        case 'ai-chat':
            vgd_render_ai_chat_tab();
            break;
        default:
            vgd_render_dashboard_tab();
            break;
    }
    echo '</div>';
}






// Enqueue styles for hover effects and improved nav bar
function vgd_enqueue_styles() {
    wp_enqueue_style('vgd-style', VGD_PLUGIN_URL . 'assets/css/style.css');
}
add_action('admin_enqueue_scripts', 'vgd_enqueue_styles');