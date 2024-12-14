<?php

class Logo_Back {
    private $table_name;
    private $upload_base_dir;
    private $logos_dir;
    private $code_dir;
    private $cards_table;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'saved_logos';
        $this->cards_table = $wpdb->prefix . 'saved_business_cards';
        
        // Set up directories
        $this->upload_base_dir = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/uploads';
        $this->logos_dir = $this->upload_base_dir . '/logos';
        $this->code_dir = $this->upload_base_dir . '/logocode';
        
        // Create necessary directories
        $this->ensure_directories();
        
        // Initialize hooks
        add_action('wp_ajax_save_logo', array($this, 'save_logo'));
        add_action('wp_ajax_nopriv_save_logo', array($this, 'save_logo'));
        add_action('wp_ajax_update_logo', array($this, 'update_logo'));
        add_action('wp_ajax_nopriv_update_logo', array($this, 'update_logo'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_save_scripts'));
        
        // Add new action for getting saved items
        add_action('wp_ajax_get_saved_items', array($this, 'get_saved_items'));
        add_action('wp_ajax_nopriv_get_saved_items', array($this, 'get_saved_items'));
        
        // Create database tables if they don't exist
        $this->create_tables();
    }

    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Create logos table
        $sql_logos = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            logo_id varchar(50) NOT NULL,
            image_path varchar(255) NOT NULL,
            code_path varchar(255) NOT NULL,
            date_created datetime DEFAULT CURRENT_TIMESTAMP,
            last_modified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY logo_id (logo_id)
        ) $charset_collate;";
        
        // Create business cards table
        $sql_cards = "CREATE TABLE IF NOT EXISTS {$this->cards_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            card_id varchar(50) NOT NULL,
            image_path varchar(255) NOT NULL,
            code_path varchar(255) NOT NULL,
            card_data longtext NOT NULL,
            date_created datetime DEFAULT CURRENT_TIMESTAMP,
            last_modified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY card_id (card_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_logos);
        dbDelta($sql_cards);
    }

    public function get_saved_items() {
        try {
            global $wpdb;
            
            $type = isset($_GET['type']) ? $_GET['type'] : 'all';
            $items = array();

            // Get logos
            if ($type === 'all' || $type === 'logos') {
                $logos = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY date_created DESC");
                foreach ($logos as $logo) {
                    $items['logos'][] = array(
                        'id' => $logo->logo_id,
                        'imageUrl' => plugins_url("//Virtual-Graphics-Studio/" . $logo->image_path, dirname(__FILE__, 4)),
                        'codeUrl' => plugins_url("//Virtual-Graphics-Studio/" . $logo->code_path, dirname(__FILE__, 4)),
                        'dateCreated' => $logo->date_created,
                        'lastModified' => $logo->last_modified
                    );
                }
            }

            // Get business cards
            if ($type === 'all' || $type === 'cards') {
                $cards = $wpdb->get_results("SELECT * FROM {$this->cards_table} ORDER BY date_created DESC");
                foreach ($cards as $card) {
                    $items['cards'][] = array(
                        'id' => $card->card_id,
                        'imageUrl' => plugins_url("//Virtual-Graphics-Studio/" . $card->image_path, dirname(__FILE__, 4)),
                        'codeUrl' => plugins_url("//Virtual-Graphics-Studio/" . $card->code_path, dirname(__FILE__, 4)),
                        'dateCreated' => $card->date_created,
                        'lastModified' => $card->last_modified,
                        'data' => json_decode($card->card_data)
                    );
                }
            }

            wp_send_json_success($items);

        } catch (Exception $e) {
            error_log('Error in get_saved_items: ' . $e->getMessage());
            wp_send_json_error('Error fetching saved items: ' . $e->getMessage());
        }
    }

    public function enqueue_save_scripts() {
        wp_enqueue_script('logo-saver', plugins_url('/assets/js/edithor_js/logo-saver.js', dirname(__FILE__, 3)), array('jquery'), null, true);
        
        // Get all saved items
        $saved_items = array(
            'logos' => $this->get_saved_logos(),
            'cards' => $this->get_saved_cards()
        );
        
        // Pass data to JavaScript
        wp_localize_script('logo-saver', 'logoSaverData', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'savedItems' => $saved_items
        ));
    }

    // Get saved business cards
    private function get_saved_cards() {
        global $wpdb;
        $cards = $wpdb->get_results("SELECT * FROM {$this->cards_table} ORDER BY date_created DESC");
        
        $formatted_cards = array();
        foreach ($cards as $card) {
            $formatted_cards[] = array(
                'id' => $card->card_id,
                'imageUrl' => plugins_url("//Virtual-Graphics-Studio/" . $card->image_path, dirname(__FILE__, 4)),
                'codeUrl' => plugins_url("//Virtual-Graphics-Studio/" . $card->code_path, dirname(__FILE__, 4)),
                'dateCreated' => $card->date_created,
                'lastModified' => $card->last_modified,
                'data' => json_decode($card->card_data)
            );
        }
        
        return $formatted_cards;
    }

    private function ensure_directories() {
        $dirs = array(
            $this->upload_base_dir,
            $this->logos_dir,
            $this->code_dir
        );

        foreach ($dirs as $dir) {
            if (!file_exists($dir)) {
                if (!wp_mkdir_p($dir)) {
                    error_log("Failed to create directory: $dir");
                    // Try to create with different permissions
                    mkdir($dir, 0755, true);
                }
            }

            // Ensure directory is writable
            if (!is_writable($dir)) {
                chmod($dir, 0755);
            }
        }

        // Create .htaccess to protect JSON files
        $htaccess_file = $this->code_dir . '/.htaccess';
        if (!file_exists($htaccess_file)) {
            file_put_contents($htaccess_file, "Deny from all");
        }
    }

    private function save_files($logo_id, $image_data, $fabric_code) {
        // Ensure directories exist
        $this->ensure_directories();

        // Save image file
        $image_parts = explode(";base64,", $image_data);
        $image_base64 = isset($image_parts[1]) ? $image_parts[1] : $image_data;
        $image_filename = $logo_id . '.png';
        $image_path = $this->logos_dir . '/' . $image_filename;
        
        if (!file_put_contents($image_path, base64_decode($image_base64))) {
            throw new Exception('Failed to save image file');
        }

        // Save code file
        $code_filename = $logo_id . '.json';
        $code_path = $this->code_dir . '/' . $code_filename;
        if (!file_put_contents($code_path, $fabric_code)) {
            throw new Exception('Failed to save code file');
        }

        return array(
            'image_path' => 'uploads/logos/' . $image_filename,
            'code_path' => 'uploads/logocode/' . $code_filename
        );
    }

    public function save_logo() {
        try {
            global $wpdb;

            if (!isset($_POST['fabric_code']) || !isset($_POST['image_data'])) {
                wp_send_json_error('Missing required data');
                return;
            }

            // Generate unique ID
            $logo_id = isset($_POST['logo_id']) ? $_POST['logo_id'] : 'logo_' . uniqid();
            $fabric_code = wp_unslash($_POST['fabric_code']);
            $image_data = $_POST['image_data'];

            // Check if logo exists
            $existing_logo = $this->get_logo($logo_id);
            if ($existing_logo) {
                return $this->update_logo();
            }

            // Save files
            $paths = $this->save_files($logo_id, $image_data, $fabric_code);

            // Save to database
            $result = $wpdb->insert(
                $this->table_name,
                array(
                    'logo_id' => $logo_id,
                    'image_path' => $paths['image_path'],
                    'code_path' => $paths['code_path'],
                    'date_created' => current_time('mysql')
                ),
                array('%s', '%s', '%s', '%s')
            );

            if ($result === false) {
                throw new Exception('Database error: ' . $wpdb->last_error);
            }

            wp_send_json_success(array(
                'message' => 'Logo saved successfully',
                'logo_id' => $logo_id,
                'image_url' => plugins_url($paths['image_path'], dirname(__FILE__, 4))
            ));

        } catch (Exception $e) {
            wp_send_json_error('Error saving logo: ' . $e->getMessage());
        }
    }

    public function update_logo() {
        try {
            global $wpdb;

            if (!isset($_POST['logo_id']) || !isset($_POST['fabric_code']) || !isset($_POST['image_data'])) {
                wp_send_json_error('Missing required data');
                return;
            }

            $logo_id = $_POST['logo_id'];
            $fabric_code = wp_unslash($_POST['fabric_code']);
            $image_data = $_POST['image_data'];

            // Check if logo exists
            $existing_logo = $this->get_logo($logo_id);
            if (!$existing_logo) {
                wp_send_json_error('Logo not found');
                return;
            }

            // Save files
            $paths = $this->save_files($logo_id, $image_data, $fabric_code);

            // Update database
            $result = $wpdb->update(
                $this->table_name,
                array(
                    'image_path' => $paths['image_path'],
                    'code_path' => $paths['code_path'],
                    'last_modified' => current_time('mysql')
                ),
                array('logo_id' => $logo_id),
                array('%s', '%s', '%s'),
                array('%s')
            );

            if ($result === false) {
                throw new Exception('Database error: ' . $wpdb->last_error);
            }

            wp_send_json_success(array(
                'message' => 'Logo updated successfully',
                'logo_id' => $logo_id,
                'image_url' => plugins_url($paths['image_path'], dirname(__FILE__, 4))
            ));

        } catch (Exception $e) {
            error_log('Error in update_logo: ' . $e->getMessage());
            wp_send_json_error('Error updating logo: ' . $e->getMessage());
        }
    }

    // Get all saved logos
    public function get_saved_logos() {
        global $wpdb;
        $logos = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY date_created DESC");
        
        foreach ($logos as $logo) {
            $logo->image_url = plugins_url($logo->image_path, dirname(__FILE__, 4));
            $logo->code_url = plugins_url($logo->code_path, dirname(__FILE__, 4));
        }
        
        return $logos;
    }

    // Get a specific logo
    public function get_logo($logo_id) {
        global $wpdb;
        $logo = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE logo_id = %s",
                $logo_id
            )
        );
        
        if ($logo) {
            $logo->image_url = plugins_url($logo->image_path, dirname(__FILE__, 4));
            $logo->code_url = plugins_url($logo->code_path, dirname(__FILE__, 4));
        }
        
        return $logo;
    }

    // Delete a logo
    public function delete_logo($logo_id) {
        global $wpdb;
        
        $logo = $this->get_logo($logo_id);
        if ($logo) {
            // Delete files
            $image_path = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/' . $logo->image_path;
            $code_path = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/' . $logo->code_path;
            
            if (file_exists($image_path)) unlink($image_path);
            if (file_exists($code_path)) unlink($code_path);
            
            return $wpdb->delete(
                $this->table_name,
                array('logo_id' => $logo_id),
                array('%s')
            );
        }
        return false;
    }

    public function delete_card($card_id) {
        global $wpdb;
        
        $card = $this->get_card($card_id);
        if ($card) {
            // Delete files
            $image_path = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/' . $card->image_path;
            $code_path = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/' . $card->code_path;
            
            if (file_exists($image_path)) unlink($image_path);
            if (file_exists($code_path)) unlink($code_path);
            
            return $wpdb->delete(
                $this->cards_table,
                array('card_id' => $card_id),
                array('%s')
            );
        }
        return false;
    }
}
// Initialize the class
new Logo_Back();

