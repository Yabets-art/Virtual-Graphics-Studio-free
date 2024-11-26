<?php

// Fetch the configuration from the ConfigManager
function get_config() {
    require_once VGD_PLUGIN_DIR . "config.php";
    $configManager = new ConfigManager(VGD_PLUGIN_DIR . 'config.txt');
    return $configManager->readConfig();
}

// Save the updated configuration back to the ConfigManager
function update_config($new_config) {
    require_once VGD_PLUGIN_DIR . "config.php";
    $configManager = new ConfigManager(VGD_PLUGIN_DIR . 'config.txt');

    // Loop through the new configuration and update each key
    foreach ($new_config as $key => $value) {
        $configManager->updateConfig($key, $value);
    }
}


// Render the settings page
function vgd_settings_page() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update configuration when the form is submitted
        $config = get_config();
        foreach ($config as $key => $value) {
            $config[$key] = isset($_POST[$key . '_enabled']) ? 'enable' : 'disable';
        }
        update_config($config);

        // Display a success message
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

    <!-- Add styles for the switch -->
    <style>
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #2196F3;
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }
    </style>
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
