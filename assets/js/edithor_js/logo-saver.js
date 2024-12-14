class LogoSaver {
    constructor() {
        this.hasUnsavedChanges = false;
        this.editor = null;
        this.ajaxUrl = '/wordpress/wp-admin/admin-ajax.php'; 
        this.currentLogoId = null;// WordPress AJAX URL
        this.initializeCanvas();
        this.initializeEventListeners();
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
            if (!this.editor || !this.editor.canvas) {
                throw new Error('Editor canvas not initialized');
            }

            // Get canvas data
            const fabricCode = JSON.stringify(this.editor.canvas.toJSON());
            const imageData = this.editor.canvas.toDataURL('image/png');

            // Create form data
            const formData = new FormData();
            
            // If we have a currentLogoId, this is an update
            if (this.currentLogoId) {
                formData.append('action', 'update_logo');
                formData.append('logo_id', this.currentLogoId);
            } else {
                formData.append('action', 'save_logo');
            }

            formData.append('fabric_code', fabricCode);
            formData.append('image_data', imageData);

            console.log('Saving logo...', this.currentLogoId ? 'Update' : 'New');

            // Send to backend
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.hasUnsavedChanges = false;
                this.currentLogoId = data.data.logo_id;
                alert(data.data.message);
                console.log('Saved logo ID:', data.data.logo_id);
            } else {
                throw new Error(data.data || 'Error saving logo');
            }

        } catch (error) {
            console.error('Error saving logo:', error);
            alert('Failed to save logo. Please try again.');
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


}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing LogoSaver...');
    window.logoSaver = new LogoSaver();
}); 