<?php

function get_config() {
    require_once VGD_PLUGIN_DIR . "config.php";
    $configManager = new ConfigManager(VGD_PLUGIN_DIR . 'config.txt');
    return $configManager->readConfig();
}

function update_config($new_config) {
    require_once VGD_PLUGIN_DIR . "config.php";
    $configManager = new ConfigManager(VGD_PLUGIN_DIR . 'config.txt');

    foreach ($new_config as $key => $value) {
        $configManager->updateConfig($key, $value);
    }
}

function vgd_settings_page() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $config = get_config();
        foreach ($config as $key => $value) {
            $config[$key] = isset($_POST[$key . '_enabled']) ? 'enable' : 'disable';
        }
        update_config($config);
        echo "<div class='updated'><p>Settings saved successfully!</p></div>";
    }

    $config = get_config();
    ?>
    <div class="wrap">
        <h1><?php echo __('Virtual Graphic Designer Settings', 'vgd'); ?></h1>
        <form method="post">
            <table class="form-table">
                <?php foreach ($config as $key => $status): ?>
                    <tr valign="top">
                        <th scope="row">
                            <label for="<?php echo $key; ?>_enabled"><?php echo __( ucfirst($key), 'vgd'); ?></label>
                        </th>
                        <td>
                            <label class="switch">
                                <input type="checkbox" id="<?php echo $key; ?>_enabled" name="<?php echo $key; ?>_enabled" value="1" 
                                <?php checked($status === 'enable'); ?> />
                                <span class="slider"></span>
                            </label>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button(__('Save Changes', 'vgd')); ?>
        </form>
    </div>

    <?php
}

// Add admin menu and settings page
add_action('admin_menu', function () {
    add_menu_page(
        __('Virtual Graphic Designer', 'vgd'),
        __('VGD Settings', 'vgd'),
        'manage_options',
        'vgd-settings',
        'vgd_settings_page'
    );
});
?>
