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

// Include necessary files
require_once VGD_PLUGIN_DIR . 'includes/class-brand.php';
require_once VGD_PLUGIN_DIR . 'includes/class-youtube.php';
require_once VGD_PLUGIN_DIR . 'includes/class-banner.php';
require_once VGD_PLUGIN_DIR . 'includes/class-posts.php';
require_once VGD_PLUGIN_DIR . 'includes/class-ai-chat.php';
require_once VGD_PLUGIN_DIR . 'includes/class-setting.php';

// Add Admin Menu
function vgd_add_menu() {
    add_menu_page(
        'Virtual Graphic Designer',
        'VGD',
        'manage_options',
        'virtual-graphic-designer',
        'vgd_dashboard_page',
        'dashicons-format-image',
        10
    );
}
add_action('admin_menu', 'vgd_add_menu');

// Dashboard Page
function vgd_dashboard_page() {
    echo '<div class="wrap"><h1>Welcome to Virtual Graphic Designer</h1>';
    echo '<p>Select a tool to get started:</p>';
    echo '<ul>
            <li><a href="?page=virtual-graphic-designer&tab=brand">Brand (Logo & Business Card)</a></li>
            <li><a href="?page=virtual-graphic-designer&tab=youtube">YouTube (Thumbnail & Banner)</a></li>
            <li><a href="?page=virtual-graphic-designer&tab=banner">Banner (Event & Business)</a></li>
            <li><a href="?page=virtual-graphic-designer&tab=posts">Social Media Posts</a></li>
            <li><a href="?page=virtual-graphic-designer&tab=ai-chat">AI Chat</a></li>
          </ul></div>';
}
