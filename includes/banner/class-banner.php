
<?php
function vgd_render_banner_tab() {
    echo '<div class="max-w-[1800px] mx-auto px-4 py-6">';
    echo '<div class="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">';
    echo '<h2 class="text-2xl font-bold text-gray-800">Banner (Event & Business) Creator</h2>';
    echo '</div>';
    echo '<div id="maincontainer" class="template-section">';
    echo '<div id="templateContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">';

    // "Create New Card" button
    echo '<div class="bg-white w-[200px] rounded-lg shadow-md overflow-hidden border border-dashed border-gray-300 hover:border-blue-500 transition duration-300 cursor-pointer group h-[260px]" id="createNewCardbanner">';
    echo '<div class="flex flex-col items-center justify-center h-full p-6 bg-gray-50">';
    echo '<i class="fas fa-plus-circle text-4xl text-blue-500 mb-4 group-hover:scale-110 transition-transform"></i>';
    echo '<h4 class="text-lg font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Create New Card</h4>';
    echo '<span class="text-sm text-gray-500 mt-2">Start Fresh</span>';
    echo '</div>';
    echo '</div>';

    echo '</div>'; // Close templateContainer
    echo '</div>'; // Close maincontainer
    echo '</div>'; // Close max-w container

    // Popup modal
    echo '<div id="popupModalbanner" class="fixed inset-0 bg-gray-900 bg-opacity-60 hidden flex items-center justify-center z-50">';
    echo '<div class="bg-white rounded-lg w-[90%] max-w-4xl p-8 relative shadow-lg">';

    // Close button
    echo '<button id="closePopupbanner" class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none" aria-label="Close modal">&times;</button>';

    // Modal content
    echo '<div class="flex flex-col md:flex-row gap-8">';

    // Left: Canvas preview
    echo '<div class="flex-1">';
    echo '<h3 class="text-xl font-semibold text-gray-800 mb-4">Preview (Moveable)</h3>';
    echo '<canvas id="previewCanvasbanner" width="350" height="400" class="border border-gray-300 w-full h-auto"></canvas>';
    echo '</div>';

    // Right: Options
    echo '<div class="flex-1">';
    echo '<h3 class="text-xl font-semibold text-gray-800 mb-4">Options</h3>';

    // Mode Selector
    echo '<div class="mb-6">';
    echo '<label class="block text-gray-700 font-medium mb-2">Mode</label>';
    echo '<select id="modeSelectorbanner" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">';
    echo '<option value="web_header">Web Header (1920x600 pixels)</option>';
    echo '<option value="social_facebook">Facebook Event Cover (1200x628 pixels)</option>';
    echo '<option value="social_instagram_story">Instagram Story (1080x1920 pixels)</option>';
    echo '<option value="poster_small">Small Poster (11x17 inches)</option>';
    echo '<option value="rollup_standard">Roll-up Banner (33x80 inches)</option>';
    echo '<option value="stage_backdrop">Stage Backdrop (10x20 feet)</option>';
    echo '</select>';
    echo '</div>';
    // Color Picker
    echo '<div class="mb-6">';
    echo '<label class="block text-gray-700 font-medium mb-2">Color</label>';
    echo '<input type="color" id="colorPickerbanner" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">';
    echo '</div>';

    // Gradient Picker
    echo '<div class="mb-6">';
    echo '<label class="block text-gray-700 font-medium mb-2">Gradient</label>';
    echo '<label class="block text-gray-600 mb-1">Left:</label>';
    echo '<input type="color" id="gradientStartbanner" class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-400">';
    echo '<label class="block text-gray-600 mb-1">Right:</label>';
    echo '<input type="color" id="gradientEndbanner" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">';
    echo '</div>';

    // Save/Create Button
    echo '<div class="text-center mt-8">';
    echo '<button id="saveButtonbanner" class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200">Create</button>';
    echo '</div>';

    echo '</div>'; // Close right side
    echo '</div>'; // Close flex row

    echo '</div>'; // Close modal content
    echo '</div>'; // Close popupModal

    // Enqueue necessary scripts and styles
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    wp_enqueue_script('fabric-js', 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js', array(), null, true);
    wp_enqueue_script('banner', plugins_url('assets/js/PhpToJs/bannerEventandBinuess.js', dirname(__FILE__, 2)), array('fabric-js'), null, true);
}
?>
