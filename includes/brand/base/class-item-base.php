<?php

abstract class Item_Base {
    protected $upload_base_dir;
    protected $items_dir;
    protected $code_dir;
    protected $table_name;

    public function __construct($table_name) {
        global $wpdb;
        $this->table_name = $wpdb->prefix . $table_name;
        
        $this->upload_base_dir = WP_PLUGIN_DIR . '/Virtual-Graphics-Studio/uploads';
        $this->items_dir = $this->upload_base_dir . '/logos';
        $this->code_dir = $this->upload_base_dir . '/logocode';
        
        $this->ensure_directories();
    }

    abstract protected function create_table();
    abstract public function get_all_items();
    abstract public function get_item($id);
    abstract public function delete_item($id);
    abstract public function update_item($id, $data);

    protected function ensure_directories() {
        $dirs = array($this->upload_base_dir, $this->items_dir, $this->code_dir);
        foreach ($dirs as $dir) {
            if (!file_exists($dir)) {
                wp_mkdir_p($dir);
            }
        }
    }

    protected function save_files($item_id, $image_data, $fabric_code) {
        $image_parts = explode(";base64,", $image_data);
        $image_base64 = isset($image_parts[1]) ? $image_parts[1] : $image_data;
        
        $image_filename = $item_id . '.png';
        $code_filename = $item_id . '.json';
        
        $image_path = $this->items_dir . '/' . $image_filename;
        $code_path = $this->code_dir . '/' . $code_filename;
        
        if (!file_put_contents($image_path, base64_decode($image_base64))) {
            throw new Exception('Failed to save image file');
        }

        if (!file_put_contents($code_path, $fabric_code)) {
            throw new Exception('Failed to save code file');
        }

        return array(
            'image_path' => 'uploads/logos/' . $image_filename,
            'code_path' => 'uploads/logocode/' . $code_filename
        );
    }

    protected function validate_file_data($image_data, $fabric_code) {
        if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $image_data)) {
            throw new Exception('Invalid image format');
        }

        $fabric_data = json_decode($fabric_code);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid fabric code format');
        }

        return true;
    }
} 