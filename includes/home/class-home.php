<?php
// Exit if accessed directly
// if (!defined('ABSPATH')) {
//     exit;
// }

// Main Dashboard Tab Rendering Function

// Ensure WordPress environment is loaded
if (!defined('ABSPATH')) {
    exit;
}

// Render Dashboard Tab

function vgd_render_dashboard_tab() {
    echo '<h1 class="text-3xl font-bold text-center mb-4">' . __('Welcome to Virtual Graphic Designer', 'vgd') . '</h1>';
    echo '<p class="text-lg text-gray-600 text-center mb-6">' . __('Select a tool to get started:', 'vgd') . '</p>';
    echo my_auto_sliding_gallery();

    echo addAll();
}

// Gallery Functionality

}

// Gallery Function

if (!function_exists('my_auto_sliding_gallery')) {
    function my_auto_sliding_gallery() {
        $images_dir = VGD_PLUGIN_URL . 'assets/pictures/';
        $images = ['image1.png', 'image2.png', 'image3.png'];
        ob_start();
        ?>

        <div class="tw-relative tw-mb-6 tw-overflow-hidden tw-w-full h-[300px]">
            <div id="gallery-inner" class="tw-flex tw-transition-transform tw-duration-700 tw-ease-in-out">
                <?php foreach ($images as $image): ?>
                    <div class="tw-flex-none tw-h-auto tw-w-full tw-relative">
                        <img src="<?php echo esc_url($images_dir . $image); ?>" alt="Gallery Image" class="tw-w-full tw-h-full tw-object-cover tw-rounded-lg">
                    </div>
                <?php endforeach; ?>
            </div>
            <button id="prevBtn" class="tw-absolute tw-top-1/2 tw-left-4 tw-transform -tw-translate-y-1/2 tw-bg-transparent tw-text-white tw-rounded-full tw-p-2 tw-shadow-lg">&lt;</button>
            <button id="nextBtn" class="tw-absolute tw-top-1/2 tw-right-4 tw-transform -tw-translate-y-1/2 tw-bg-transparent tw-text-white tw-rounded-full tw-p-2 tw-shadow-lg">&gt;</button>

        <div class="swiper-container w-full h-72 overflow-hidden rounded-lg shadow-lg">
            <div class="swiper-wrapper">
                <?php foreach ($images as $image): ?>
                    <div class="swiper-slide flex justify-center items-center bg-gray-100">
                        <img src="<?php echo esc_url($images_dir . $image); ?>" alt="Gallery Image" class="h-full w-auto object-cover">
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="swiper-button-next text-gray-700"></div>
            <div class="swiper-button-prev text-gray-700"></div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const galleryInner = document.getElementById('gallery-inner');
                const slides = galleryInner.children;
                const prevBtn = document.getElementById('prevBtn');
                const nextBtn = document.getElementById('nextBtn');
                
                let currentIndex = 0;

                // Update slide position based on the current index
                const updateSlidePosition = () => {
                    galleryInner.style.transform = `translateX(-${(currentIndex) * 75}%)`; // Show current image and next part
                };

                prevBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
                    updateSlidePosition();
                });

                nextBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlidePosition();
                });

                // Auto slide every 3 seconds
                setInterval(() => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlidePosition();
                }, 3000);
            });
        </script>
        <style>
            /* Adjust gallery wrapper size */
            .tw-relative {
                width: 100%; /* Full width of the container */
                overflow: hidden;
                position: relative;
            }

            /* Adjust the gallery inner container */
            #gallery-inner {
                display: flex;
                transition: transform 0.7s ease-in-out;
                width: 100%; /* Full width */
            }

            /* Adjust the images */
            #gallery-inner > div {
                flex: 0 0 100%; /* Each slide will occupy full container width */
                position: relative;
            }

            /* Adjust the image to fit within the container */
            #gallery-inner img {
                width: 100%;
                height: 300px; /* Ensure height matches */
                object-fit: cover; /* Ensure images are not distorted */
            }

            /* Styling for the next/previous buttons */
            .tw-bg-transparent {
                background: transparent; /* Remove background color */
            }

            .tw-rounded-full {
                border-radius: 50%; /* Make buttons circular */
            }

            .tw-shadow-lg {
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            /* Adjust for showing next images on the right side */
            #gallery-inner {
                display: flex;
                position: relative;
            }

            /* Show 25% of the next image on the right */
            #gallery-inner > div:last-child {
                margin-left: -25%; /* Move next image slightly off-screen */
            }
        </style>
        <?php
        return ob_get_clean();
    }

    // Register Shortcode
    add_shortcode('auto_sliding_gallery', 'my_auto_sliding_gallery');
}



// Wrapper Function to Call All Other Tabs
function addAll() {
    ob_start();

    $tabs = [];

    if (function_exists('vgd_render_brand_tab')) {
        $tabs[] = vgd_render_brand_tab();
    }

    if (function_exists('vgd_render_youtube_tab')) {
        $tabs[] = vgd_render_youtube_tab();
    }

    if (function_exists('vgd_render_banner_tab')) {
        $tabs[] = vgd_render_banner_tab();
    }

    // if (function_exists('vgd_render_posts_tab')) {
    //     $tabs[] = vgd_render_posts_tab();
    // }

    // if (function_exists('vgd_render_ai_chat_tab')) {
    //     $tabs[] = vgd_render_ai_chat_tab();
    // }

    // Render each tab with a gap
    foreach ($tabs as $tab_html) {
        echo '<div class="tw-mb-6">';
        echo $tab_html;
        echo '</div>';
    }

    return ob_get_clean();
}

// Enqueue Assets (Tailwind CSS, Swiper CSS, and JS)
function vgd_enqueue_assets() {
    wp_enqueue_style('swiper-css', 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css');
    wp_enqueue_script('swiper-js', 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js', [], null, true);

}
add_action('admin_enqueue_scripts', 'vgd_enqueue_assets');

