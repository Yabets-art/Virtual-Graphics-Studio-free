<?php
class Logo extends Item_Base {
    public function __construct() {
        parent::__construct('saved_logos');
        $this->create_table();
        
        add_action('wp_ajax_save_logo', array($this, 'save_logo'));
        add_action('wp_ajax_nopriv_save_logo', array($this, 'save_logo'));
        add_action('wp_ajax_update_logo', array($this, 'update_logo'));
        add_action('wp_ajax_nopriv_update_logo', array($this, 'update_logo'));
        add_action('wp_ajax_delete_logo', array($this, 'delete_logo'));
        add_action('wp_ajax_nopriv_delete_logo', array($this, 'delete_logo'));
    }

    protected function create_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            logo_id VARCHAR(50) PRIMARY KEY,
            image_path VARCHAR(255) NOT NULL,
            code_path VARCHAR(255) NOT NULL,
            date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public function get_all_items() {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY date_created DESC");
        
        return array_map(function($item) {
            return array(
                'id' => $item->logo_id,
                'imageUrl' => plugins_url($item->image_path, dirname(__FILE__, 4)),
                'codeUrl' => plugins_url($item->code_path, dirname(__FILE__, 4)),
                'dateCreated' => $item->date_created,
                'lastModified' => $item->last_modified
            );
        }, $items ?: []);
    }

    public function get_item($id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE logo_id = %s",
            $id
        ));
    }

    public function delete_item($id) {
        global $wpdb;
        return $wpdb->delete($this->table_name, array('logo_id' => $id), array('%s'));
    }

    public function update_item($id, $data) {
        global $wpdb;
        return $wpdb->update(
            $this->table_name,
            array(
                'image_path' => $data['image_path'],
                'code_path' => $data['code_path'],
                'last_modified' => current_time('mysql')
            ),
            array('logo_id' => $id),
            array('%s', '%s', '%s'),
            array('%s')
        );
    }

    public function save_logo() {
        try {
            if (!isset($_POST['fabric_code']) || !isset($_POST['image_data'])) {
                wp_send_json_error('Missing required data');
                return;
            }

            $logo_id = 'logo_' . uniqid();
            $fabric_code = wp_unslash($_POST['fabric_code']);
            $image_data = $_POST['image_data'];

            $paths = $this->save_files($logo_id, $image_data, $fabric_code);

            global $wpdb;
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

    // Add other logo-specific methods here
}
