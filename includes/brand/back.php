<?php

class Item_Manager {
    private $logo;
    private $business_card;

    public function __construct() {
        $this->logo = new Logo();
        $this->business_card = new Business_Card();
        
        add_action('wp_ajax_get_saved_items', array($this, 'get_saved_items'));
        add_action('wp_ajax_nopriv_get_saved_items', array($this, 'get_saved_items'));
        add_action('wp_ajax_get_item_data', array($this, 'get_item_data'));
        add_action('wp_ajax_nopriv_get_item_data', array($this, 'get_item_data'));
    }

    public function get_saved_items() {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                $response = array(
                    'success' => false,
                    'error' => 'Invalid request method',
                    'data' => null
                );
                wp_send_json($response, 400);
                return;
            }

            $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'all';
            error_log('Requested type: ' . $type);

            $items = array('cards' => [], 'logos' => []);

            if ($type === 'all' || $type === 'cards') {
                $cards = $this->business_card->get_all_items();
                $items['cards'] = array_map(function($card) {
                    return array(
                        'id' => $card['id'],
                        'imageUrl' => $card['imageUrl'],
                        'codeUrl' => $card['codeUrl'],
                        'data' => $card['data'],
                        'dateCreated' => $card['dateCreated'],
                        'lastModified' => $card['lastModified']
                    );
                }, $cards);
            }

            if ($type === 'all' || $type === 'logos') {
                $logos = $this->logo->get_all_items();
                $items['logos'] = array_map(function($logo) {
                    return array(
                        'id' => $logo['id'],
                        'imageUrl' => $logo['imageUrl'],
                        'codeUrl' => $logo['codeUrl'],
                        'dateCreated' => $logo['dateCreated'],
                        'lastModified' => $logo['lastModified']
                    );
                }, $logos);
            }

            error_log('Sending response: ' . json_encode($items));
            
            $response = array(
                'success' => true,
                'data' => $items,
                'message' => 'Items retrieved successfully'
            );
            wp_send_json($response);

        } catch (Exception $e) {
            error_log('Error in get_saved_items: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            
            $response = array(
                'success' => false,
                'error' => 'Error fetching saved items: ' . $e->getMessage(),
                'data' => null
            );
            wp_send_json($response, 500);
        }
    }

    public function get_item_data() {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                wp_send_json_error('Invalid request method', 400);
                return;
            }

            $item_id = isset($_POST['item_id']) ? sanitize_text_field($_POST['item_id']) : '';
            $item_type = isset($_POST['item_type']) ? sanitize_text_field($_POST['item_type']) : '';

            if (empty($item_id) || empty($item_type)) {
                wp_send_json_error('Missing required parameters', 400);
                return;
            }

            $item = null;
            if ($item_type === 'logo') {
                $item = $this->logo->get_item($item_id);
            } else if ($item_type === 'bc') {
                $item = $this->business_card->get_item($item_id);
            }

            if (!$item) {
                wp_send_json_error('Item not found', 404);
                return;
            }

            $response_data = array(
                'id' => $item_type === 'logo' ? $item->logo_id : $item->card_id,
                'type' => $item_type,
                'imageUrl' => plugins_url($item->image_path, dirname(__FILE__, 3)),
                'codeUrl' => plugins_url($item->code_path, dirname(__FILE__, 3)),
                'data' => $item_type === 'bc' ? json_decode($item->card_data) : null,
                'dateCreated' => $item->date_created,
                'lastModified' => $item->last_modified
            );

            wp_send_json_success($response_data);
        } catch (Exception $e) {
            error_log('Error in get_item_data: ' . $e->getMessage());
            wp_send_json_error('Server error', 500);
        }
    }
}

// Initialize the manager
new Item_Manager();
