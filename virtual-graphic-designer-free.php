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
// if (!defined('ABSPATH')) {
//     exit;
// }

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
        'brand/base/class-item-base.php',
        'brand/logo/class-logo.php',
        'brand/business-card/class-business-card.php',
        'brand/back.php'
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

    // Get the configuration from config.txt
    $config = get_config();

        // Home page
    if (isset($config['home']) && $config['home'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('Home', 'vgd'),
            __('Home', 'vgd'),
            'manage_options',
            'virtual-graphic-designer',
            'vgd_dashboard_page'
        );
    }

    // Check the configuration to see if the tabs are enabled
    if (isset($config['logo']) && $config['logo'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('Brand (Logo & Business Card)', 'vgd'),
            __('Brand', 'vgd'),
            'manage_options',
            'vgd-brand',
            'vgd_render_brand_tab'
        );
    }

    if (isset($config['youtube']) && $config['youtube'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('YouTube (Thumbnail & Banner)', 'vgd'),
            __('YouTube', 'vgd'),
            'manage_options',
            'vgd-youtube',
            'vgd_render_youtube_tab'
        );
    }

    if (isset($config['banner']) && $config['banner'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('Banner (Event & Business)', 'vgd'),
            __('Banner', 'vgd'),
            'manage_options',
            'vgd-banner',
            'vgd_render_banner_tab'
        );
    }

    if (isset($config['post']) && $config['post'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('Social Media Posts', 'vgd'),
            __('Social Media', 'vgd'),
            'manage_options',
            'vgd-posts',
            'vgd_render_posts_tab'
        );
    }

    if (isset($config['chat']) && $config['chat'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('AI Chat', 'vgd'),
            __('AI Chat', 'vgd'),
            'manage_options',
            'vgd-ai-chat',
            'vgd_render_ai_chat_tab'
        );
    }

    // Settings page
    if (isset($config['setting']) && $config['setting'] === 'enable') {
        add_submenu_page(
            'virtual-graphic-designer',
            __('Settings', 'vgd'),
            __('Settings', 'vgd'),
            'manage_options',
            'vgd-settings',
            'vgd_settings_page'
        );
    }
}
add_action('admin_menu', 'vgd_add_menu');

// Dashboard Page
function vgd_dashboard_page() {
    $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';

    // Navigation
    navbar_function();

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
    echo '</div>';
}

// Enqueue styles dynamically for plugin pages
function vgd_enqueue_styles($hook_suffix) {
    wp_enqueue_style('vgd-main-style', VGD_PLUGIN_URL . 'assets/css/style.css');
    wp_enqueue_style('vgd-settings-style', VGD_PLUGIN_URL . 'assets/css/setting.css');
    wp_enqueue_style('vgd-dashboard-style', VGD_PLUGIN_URL . 'assets/css/home.css');
    wp_enqueue_style('vgd-nav-style', VGD_PLUGIN_URL . 'assets/css/nav.css');
    wp_enqueue_style('vgd-brannd-style', VGD_PLUGIN_URL . 'assets/css/brannd.css');
    wp_enqueue_script('vgd-logo-saver', VGD_PLUGIN_URL . 'assets/js/edithor_js/logo-saver.js', array('jquery'), null, true);

    wp_enqueue_script('tailwindcss', 'https://cdn.tailwindcss.com');
}
add_action('admin_enqueue_scripts', 'vgd_enqueue_styles');

// Navbar function for navigation
function navbar_function() {
    $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';
    echo '<div class="vgd-body">';
    echo '<nav class="nav-tab-wrapper vgd-nav-bar">';
    echo '<a href="?page=virtual-graphic-designer&tab=dashboard" class="nav-tab ' . ($current_tab === 'dashboard' ? 'nav-tab-active' : '') . '">' . __('Home', 'vgd') . '</a>';

    // Get the configuration from config.txt
    $config = get_config();

    // Display only if enabled in settings
    if (isset($config['logo']) && $config['logo'] === 'enable') {
        echo '<a href="?page=virtual-graphic-designer&tab=brand" class="nav-tab ' . ($current_tab === 'brand' ? 'nav-tab-active' : '') . '">' . __('Brand (Logo & Business Card)', 'vgd') . '</a>';
    }

    if (isset($config['youtube']) && $config['youtube'] === 'enable') {
        echo '<a href="?page=virtual-graphic-designer&tab=youtube" class="nav-tab ' . ($current_tab === 'youtube' ? 'nav-tab-active' : '') . '">' . __('YouTube (Thumbnail & Banner)', 'vgd') . '</a>';
    }

    if (isset($config['banner']) && $config['banner'] === 'enable') {
        echo '<a href="?page=virtual-graphic-designer&tab=banner" class="nav-tab ' . ($current_tab === 'banner' ? 'nav-tab-active' : '') . '">' . __('Banner (Event & Business)', 'vgd') . '</a>';
    }

    if (isset($config['post']) && $config['post'] === 'enable') {
        echo '<a href="?page=virtual-graphic-designer&tab=posts" class="nav-tab ' . ($current_tab === 'posts' ? 'nav-tab-active' : '') . '">' . __('Social Media Posts', 'vgd') . '</a>';
    }

    if (isset($config['chat']) && $config['chat'] === 'enable') {
        echo '<a href="?page=virtual-graphic-designer&tab=ai-chat" class="nav-tab ' . ($current_tab === 'ai-chat' ? 'nav-tab-active' : '') . '">' . __('AI Chat', 'vgd') . '</a>';
    }

    echo '</nav>';
}
?>
