<?php

class Business_Card extends Item_Base {
    public function __construct() {
        parent::__construct('saved_business_cards');
        $this->create_table();
        
        add_action('wp_ajax_save_business_card', array($this, 'save_business_card'));
        add_action('wp_ajax_nopriv_save_business_card', array($this, 'save_business_card'));
        add_action('wp_ajax_update_business_card', array($this, 'update_business_card'));
        add_action('wp_ajax_nopriv_update_business_card', array($this, 'update_business_card'));
        add_action('wp_ajax_delete_business_card', array($this, 'delete_business_card'));
        add_action('wp_ajax_nopriv_delete_business_card', array($this, 'delete_business_card'));
    }

    protected function create_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            card_id VARCHAR(50) PRIMARY KEY,
            image_path VARCHAR(255) NOT NULL,
            code_path VARCHAR(255) NOT NULL,
            card_data TEXT,
            date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public function get_all_items() {
        try {
            global $wpdb;
            $items = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY date_created DESC");
            
            if ($wpdb->last_error) {
                throw new Exception($wpdb->last_error);
            }

            return array_map(function($item) {
                return array(
                    'id' => $item->card_id,
                    'imageUrl' => plugins_url($item->image_path, dirname(__FILE__, 4)),
                    'codeUrl' => plugins_url($item->code_path, dirname(__FILE__, 4)),
                    'data' => json_decode($item->card_data),
                    'dateCreated' => $item->date_created,
                    'lastModified' => $item->last_modified
                );
            }, $items ?: []);
        } catch (Exception $e) {
            error_log('Error in get_all_items: ' . $e->getMessage());
            return [];
        }
    }

    public function get_item($id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE card_id = %s",
            $id
        ));
    }

    public function delete_item($id) {
        global $wpdb;
        return $wpdb->delete($this->table_name, array('card_id' => $id), array('%s'));
    }

    public function update_item($id, $data) {
        global $wpdb;
        return $wpdb->update(
            $this->table_name,
            array(
                'image_path' => $data['image_path'],
                'code_path' => $data['code_path'],
                'card_data' => $data['card_data'],
                'last_modified' => current_time('mysql')
            ),
            array('card_id' => $id),
            array('%s', '%s', '%s', '%s'),
            array('%s')
        );
    }

    public function save_business_card() {
        try {
            if (!isset($_POST['fabric_code']) || !isset($_POST['image_data'])) {
                wp_send_json_error('Missing required data');
                return;
            }

            $card_id = 'card_' . uniqid();
            $fabric_code = wp_unslash($_POST['fabric_code']);
            $image_data = $_POST['image_data'];
            $card_data = isset($_POST['card_data']) ? wp_unslash($_POST['card_data']) : '{}';

            $paths = $this->save_files($card_id, $image_data, $fabric_code);

            global $wpdb;
            $result = $wpdb->insert(
                $this->table_name,
                array(
                    'card_id' => $card_id,
                    'image_path' => $paths['image_path'],
                    'code_path' => $paths['code_path'],
                    'card_data' => $card_data,
                    'date_created' => current_time('mysql')
                ),
                array('%s', '%s', '%s', '%s', '%s')
            );

            if ($result === false) {
                throw new Exception('Database error: ' . $wpdb->last_error);
            }

            wp_send_json_success(array(
                'message' => 'Business card saved successfully',
                'card_id' => $card_id,
                'image_url' => plugins_url($paths['image_path'], dirname(__FILE__, 4))
            ));

        } catch (Exception $e) {
            wp_send_json_error('Error saving business card: ' . $e->getMessage());
        }
    }

    // Add other business card-specific methods here
} 