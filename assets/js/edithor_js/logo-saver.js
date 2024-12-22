class LogoSaver {
    constructor() {
        this.hasUnsavedChanges = false;
        this.editor = null;
        this.ajaxUrl = '/wordpress/wp-admin/admin-ajax.php';
        this.currentItemId = null;
        this.type = new URLSearchParams(window.location.search).get('l') || 'logo';
        this.initializeCanvas();
        this.initializeEventListeners();
        this.validateData = this.validateData.bind(this);
        this.createLoadingOverlay();
    }

    initializeCanvas() {
        const checkEditor = setInterval(() => {
            if (window.editor && window.editor.canvas) {
                this.editor = window.editor;
                clearInterval(checkEditor);
                this.setupCanvasEvents();
                console.log('Canvas initialized for LogoSaver');
            }
        }, 100);
    }

    setupCanvasEvents() {
        this.editor.canvas.on('object:modified', () => {
            this.hasUnsavedChanges = true;
        });

        this.editor.canvas.on('object:added', () => {
            this.hasUnsavedChanges = true;
        });

        this.editor.canvas.on('object:removed', () => {
            this.hasUnsavedChanges = true;
        });
    }

    initializeEventListeners() {
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    async saveLogo() {
        try {
            this.showLoading('Saving Logo...');
            
            if (!this.editor || !this.editor.canvas) {
                throw new Error('Editor canvas not initialized');
            }

            const fabricCode = JSON.stringify(this.editor.canvas.toJSON());
            const imageData = this.editor.canvas.toDataURL('image/png');
            const formData = new FormData();
            
            if (this.currentItemId) {
                formData.append('action', 'update_logo');
                formData.append('logo_id', this.currentItemId);
            } else {
                formData.append('action', 'save_logo');
            }

            formData.append('fabric_code', fabricCode);
            formData.append('image_data', imageData);
            formData.append('type', 'logo');

            const response = await this.saveItem(formData);
            if (response.success) {
                this.hasUnsavedChanges = false;
                this.currentItemId = response.data.logo_id;
                this.showNotification(
                    this.currentItemId ? 'Logo updated successfully!' : 'Logo saved successfully!'
                );
                const newUrl = `${window.location.pathname}?l=logo&id=${response.data.logo_id}`;
                window.history.pushState({}, '', newUrl);
            }
        } catch (error) {
            console.error('Error saving logo:', error);
            this.showNotification('Failed to save logo. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async saveBusinessCard() {
        try {
            this.showLoading('Saving Business Card...');
            
            if (!this.editor || !this.editor.canvas) {
                throw new Error('Editor canvas not initialized');
            }

            const fabricCode = JSON.stringify(this.editor.canvas.toJSON());
            const imageData = this.editor.canvas.toDataURL('image/png');
            
            const cardData = {
                timestamp: Date.now(),
                type: 'business_card',
                designChoices: {
                    colorScheme: {
                        primary: '#333333',
                        secondary: '#666666',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                        text: '#000000'
                    }
                }
            };

            const formData = new FormData();
            
            if (this.currentItemId) {
                formData.append('action', 'update_business_card');
                formData.append('card_id', this.currentItemId);
            } else {
                formData.append('action', 'save_business_card');
            }

            formData.append('fabric_code', fabricCode);
            formData.append('image_data', imageData);
            formData.append('card_data', JSON.stringify(cardData));

            const response = await this.saveItem(formData);
            if (response.success) {
                this.hasUnsavedChanges = false;
                this.currentItemId = response.data.card_id;
                this.showNotification(
                    this.currentItemId ? 'Business card updated successfully!' : 'Business card saved successfully!'
                );
                const newUrl = `${window.location.pathname}?l=bc&id=${response.data.card_id}`;
                window.history.pushState({}, '', newUrl);
            }
        } catch (error) {
            console.error('Error saving business card:', error);
            this.showNotification('Failed to save business card. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async saveItem(formData) {
        try {
            console.log('Making AJAX request to:', this.ajaxUrl); // Debug log
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data); // Debug log
            return data;
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    async loadLogo(logoId) {
        try {
            const formData = new FormData();
            formData.append('action', 'get_logo');
            formData.append('logo_id', logoId);

            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });

            const data = await response.json();

            if (data.success && data.data.code_path) {
                // Load the Fabric.js JSON code
                const codeResponse = await fetch(data.data.code_url);
                const fabricCode = await codeResponse.json();

                this.editor.canvas.loadFromJSON(fabricCode, () => {
                    this.editor.canvas.renderAll();
                    this.currentLogoId = logoId;
                    this.hasUnsavedChanges = false;
                    console.log('Logo loaded successfully:', logoId);
                });
            }
        } catch (error) {
            console.error('Error loading logo:', error);
            alert('Failed to load logo. Please try again.');
        }
    }

    validateData(fabricCode, imageData) {
        if (!fabricCode || typeof fabricCode !== 'string') {
            throw new Error('Invalid fabric code');
        }

        if (!imageData || !imageData.startsWith('data:image/')) {
            throw new Error('Invalid image data');
        }

        try {
            JSON.parse(fabricCode);
        } catch (e) {
            throw new Error('Invalid fabric code format');
        }

        return true;
    }

    createLoadingOverlay() {
        if (!document.getElementById('saveLoadingOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'saveLoadingOverlay';
            overlay.className = 'save-loading-overlay';
            
            const spinner = document.createElement('div');
            spinner.className = 'save-spinner';
            
            const loadingText = document.createElement('div');
            loadingText.className = 'save-loading-text';
            loadingText.textContent = 'Saving...';
            
            overlay.appendChild(spinner);
            overlay.appendChild(loadingText);
            document.body.appendChild(overlay);
            
            // Add styles
            if (!document.getElementById('saveLoaderStyles')) {
                const style = document.createElement('style');
                style.id = 'saveLoaderStyles';
                style.textContent = `
                    .save-loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.8);
                        display: none;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                        z-index: 9999;
                    }
                    .save-spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    .save-loading-text {
                        margin-top: 20px;
                        font-size: 18px;
                        color: #333;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    showLoading(message = 'Saving...') {
        const overlay = document.getElementById('saveLoadingOverlay');
        const loadingText = overlay.querySelector('.save-loading-text');
        loadingText.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('saveLoadingOverlay');
        overlay.style.display = 'none';
    }

    showNotification(message, type = 'success') {
        let notification = document.getElementById('saveNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'saveNotification';
            document.body.appendChild(notification);
            
            if (!document.getElementById('notificationStyles')) {
                const style = document.createElement('style');
                style.id = 'notificationStyles';
                style.textContent = `
                    #saveNotification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 15px 25px;
                        border-radius: 5px;
                        color: white;
                        font-weight: bold;
                        z-index: 10000;
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;
                    }
                    #saveNotification.success {
                        background-color: #2ecc71;
                    }
                    #saveNotification.error {
                        background-color: #e74c3c;
                    }
                    #saveNotification.show {
                        opacity: 1;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        notification.textContent = message;
        notification.className = type;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing LogoSaver...');
    window.logoSaver = new LogoSaver();
}); 