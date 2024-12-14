class BusinessCardDisplay {
    constructor() {
        this.wizardData = {
            personalInfo: {
                firstName: '',
                lastName: '',
                title: '',
                company: ''
            },
            contactInfo: {
                phoneNumber: '',
                email: '',
                website: '',
                location: '',
                photo: null
            },
            designChoices: {
                selectedTemplate: null,
                colorScheme: {
                    primary: '#333333',
                    secondary: '#666666',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                    text: '#000000'
                }
            }
        };
        this.savedBusinessCards = [];
        this.initialize();
    }

    async initialize() {
        await this.fetchSavedCards();
        this.createStructure();
    }

    async fetchSavedCards() {
        try {
            const response = await fetch(`${window.location.origin}/wordpress/wp-admin/admin-ajax.php?action=get_saved_items&type=cards`);
            const data = await response.json();
            if (data.success && data.data.cards) {
                this.savedBusinessCards = data.data.cards;
            }
        } catch (error) {
            console.error('Error fetching saved business cards:', error);
        }
    }

    renderSavedCards() {
        if (!this.savedBusinessCards.length) return null;

        const container = document.createElement('div');
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6';

        const savedCardsHTML = this.savedBusinessCards.map(card => `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" data-id="${card.id}">
                <div class="aspect-video bg-gray-50 p-4 flex items-center justify-center border-b border-gray-100">
                    <img src="${card.imageUrl}" alt="Business Card Preview" class="max-w-full max-h-full object-contain">
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-semibold text-gray-800">${card.data.personalInfo.firstName} ${card.data.personalInfo.lastName}</h3>
                    <p class="text-sm text-gray-600">${card.data.personalInfo.title}</p>
                    <p class="text-sm text-gray-600 mb-4">${card.data.personalInfo.company}</p>
                    <div class="text-xs text-gray-500 mt-auto">
                        <p>Created: ${new Date(card.dateCreated).toLocaleDateString()}</p>
                        <p>Modified: ${new Date(card.lastModified).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-2 p-4 border-t border-gray-100">
                    <button class="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-md transition-colors duration-200 edit-card" data-id="${card.id}">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-md transition-colors duration-200 delete-card" data-id="${card.id}">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = savedCardsHTML;

        // Add event listeners
        container.querySelectorAll('.edit-card').forEach(button => {
            button.addEventListener('click', (e) => {
                const cardId = e.target.dataset.id;
                const card = this.savedBusinessCards.find(c => c.id === cardId);
                if (card) {
                    this.loadCardForEditing(card);
                }
            });
        });

        container.querySelectorAll('.delete-card').forEach(button => {
            button.addEventListener('click', async (e) => {
                const cardId = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this business card?')) {
                    await this.deleteCard(cardId);
                }
            });
        });

        return container;
    }

    async loadCardForEditing(card) {
        try {
            // Save to IndexDB for editor
            const request = indexedDB.open('templateDB', 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['templates'], 'readwrite');
                const store = transaction.objectStore('templates');

                const template = {
                    current: 'currentTemplate',
                    type: 'businessCard',
                    data: card.data,
                    colorScheme: card.data.designChoices.colorScheme,
                    timestamp: Date.now()
                };

                store.put(template);

                // Redirect to editor
                if (window.location.href.includes('wp-admin')) {
                    window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
                } else {
                    window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
                }
            };
        } catch (error) {
            console.error('Error loading business card:', error);
            alert('Failed to load business card. Please try again.');
        }
    }

    async deleteCard(cardId) {
        try {
            const formData = new FormData();
            formData.append('action', 'delete_business_card');
            formData.append('card_id', cardId);

            const response = await fetch(`${window.location.origin}/wordpress/wp-admin/admin-ajax.php`, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.savedBusinessCards = this.savedBusinessCards.filter(card => card.id !== cardId);
                this.createStructure(); // Re-render the entire structure
                alert('Business card deleted successfully');
            } else {
                throw new Error(data.data || 'Error deleting business card');
            }
        } catch (error) {
            console.error('Error deleting business card:', error);
            alert('Failed to delete business card. Please try again.');
        }
    }

    createStructure() {
        const mainContainer = document.createElement('div');
        mainContainer.className = 'vgd-brand-container';

        // Create Business Card Section
        const businessCardSection = document.createElement('div');
        businessCardSection.className = 'business-card-section';

        // Create "Create New" card
        const createNewCard = this.createNewBusinessCard();
        businessCardSection.appendChild(createNewCard);

        // Create saved cards section
        const savedCardsContainer = this.renderSavedCards();
        if (savedCardsContainer) {
            businessCardSection.appendChild(savedCardsContainer);
        }

        mainContainer.appendChild(businessCardSection);

        // Add to page
        const targetContainer = document.querySelector('#businessCardContainer');
        if (targetContainer) {
            targetContainer.appendChild(mainContainer);
        }
    }

    createNewBusinessCard() {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 m-6';
        card.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4">
                <div class="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <i class="fas fa-id-card text-2xl"></i>
                </div>
                <div class="text-center">
                    <h4 class="text-lg font-semibold text-gray-800">Create New Business Card</h4>
                    <span class="text-sm text-gray-600">Start Fresh</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showStep1Dialog();
        });

        return card;
    }

    showStep1Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 overflow-y-auto';
        dialog.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div class="flex min-h-full items-center justify-center p-4">
                <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div class="absolute right-0 top-0 pr-4 pt-4">
                        <button class="dialog-close rounded-md bg-white text-gray-400 hover:text-gray-500">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="mb-4">
                        <h2 class="text-xl font-semibold text-gray-900">Step 1: Personal Information</h2>
                        <div class="flex justify-center space-x-2 mt-4">
                            <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">1</span>
                            <span class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">2</span>
                            <span class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">3</span>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" id="firstName" placeholder="First Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <input type="text" id="lastName" placeholder="Last Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" id="title" placeholder="Job Title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <input type="text" id="company" placeholder="Company Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                    </div>
                    <div class="mt-5 sm:mt-6">
                        <button class="btn-continue w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300" disabled>
                            Continue to Contact Info
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupStep1Listeners(dialog);
        this.showDialog(dialog);
    }

    showStep2Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'wizard-dialog business-card step2';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <button class="dialog-close"><i class="fas fa-times"></i></button>
                <div class="dialog-header">
                    <h2>Step 2: Contact Information</h2>
                    <div class="step-indicator">
                        <span class="step completed">1</span>
                        <span class="step active">2</span>
                        <span class="step">3</span>
                    </div>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <input type="tel" id="phoneNumber" placeholder="Phone Number" required>
                        <input type="email" id="email" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="url" id="website" placeholder="Website (optional)">
                        <input type="text" id="location" placeholder="Location" required>
                    </div>
                    <div class="form-group photo-upload">
                        <label for="photo">
                            <i class="fas fa-camera"></i>
                            <span>Upload Profile Photo (optional)</span>
                        </label>
                        <input type="file" id="photo" accept="image/*">
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="btn-back">Back</button>
                    <button class="btn-continue" disabled>Continue to Design</button>
                </div>
            </div>
        `;

        this.setupStep2Listeners(dialog);
        this.showDialog(dialog);
    }

    showStep3Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'wizard-dialog business-card-wizard step3';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
            <button class="btn-back">Back</button>
                <button class="dialog-close"><i class="fas fa-times"></i></button>
                <div class="dialog-header">

                    <h2>Step 3: Choose Your Design</h2>
                    <div class="step-indicator">
                        <span class="step completed">1</span>
                        <span class="step completed">2</span>
                        <span class="step active">3</span>
                    </div>
                </div>
                <div class="dialog-body">
                    <div class="business-card-templates-grid">
                        ${window.businessTemplates.map((template, index) => `
                            <div class="business-card-preview-card" data-template-index="${index}">
                                <div class="business-card-canvas-wrapper">
                                    <canvas class="business-card-canvas"></canvas>
                                </div>
                                <div class="business-card-preview-info">
                                    <h4>${template.name}</h4>
                                    <span class="business-card-category">${template.category}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="dialog-buttons">
                    
                    <button class="btn-continue" disabled>Create Business Card</button>
                </div>
            </div>
        `;

        this.setupStep3Listeners(dialog);
        this.showDialog(dialog);

        // Initialize canvases after dialog is shown
        requestAnimationFrame(() => {
            this.initializePreviewCanvases(dialog);
        });
    }

    initializePreviewCanvases(dialog) {
        // Initialize main preview canvas with larger dimensions
        const mainPreviewCanvas = new fabric.Canvas('mainBusinessCardCanvas', {
            width: 600,
            height: 300,
            backgroundColor: '#ffffff'
        });

        // Initialize template preview canvases
        const templateCards = dialog.querySelectorAll('.business-card-preview-card');
        templateCards.forEach((card, index) => {
            const canvas = new fabric.Canvas(card.querySelector('.business-card-canvas'), {
                width: 600,
                height: 200,
                backgroundColor: '#ffffff'
            });

            const template = window.businessTemplates[index];
            if (template && template.data) {
                this.renderTemplatePreview(canvas, template, true);
            }

            card.addEventListener('click', () => {
                templateCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.wizardData.designChoices.selectedTemplate = template;
                
                // Enable the continue button and add click handler
                const continueBtn = dialog.querySelector('.btn-continue');
                continueBtn.disabled = false;
                continueBtn.onclick = () => this.saveToIndexDBAndRedirect(template);
            });
        });
    }

    renderTemplatePreview(canvas, template, isThumbnail) {
        canvas.clear();
        
        const scale = isThumbnail ? 0.3 : 0.5;
        const templateData = typeof template.data === 'string' ? 
            JSON.parse(template.data) : template.data;

        const customizedTemplate = JSON.parse(JSON.stringify(templateData));
        customizedTemplate.objects = customizedTemplate.objects.map(obj => {
            if (obj.type === 'i-text' || obj.type === 'text') {
                // Set default text properties
                obj.originX = 'center';
                obj.originY = 'center';
                obj.textAlign = 'center';
                obj.left = canvas.width / 2;
                
                // Check text content for keywords
                if (obj.text.includes('{{firstName}}')) {
                    obj.text = this.wizardData?.personalInfo?.firstName || 'First Name';
                    obj.fontSize = isThumbnail ? 16 : 24;
                }
                else if (obj.text.includes('{{lastName}}')) {
                    obj.text = this.wizardData?.personalInfo?.lastName || 'Last Name';
                    obj.fontSize = isThumbnail ? 16 : 24;
                }
                else if (obj.text.includes('{{title}}')) {
                    obj.text = this.wizardData?.personalInfo?.title || 'Job Title';
                    obj.fontSize = isThumbnail ? 12 : 18;
                }
                else if (obj.text.includes('{{company}}')) {
                    obj.text = this.wizardData?.personalInfo?.company || 'Company Name';
                    obj.fontSize = isThumbnail ? 12 : 18;
                }
                else if (obj.text.includes('{{phone}}')) {
                    obj.text = this.wizardData?.contactInfo?.phoneNumber || 'Phone Number';
                    obj.fontSize = isThumbnail ? 10 : 14;
                }
                else if (obj.text.includes('{{email}}')) {
                    obj.text = this.wizardData?.contactInfo?.email || 'Email Address';
                    obj.fontSize = isThumbnail ? 10 : 14;
                }
                else if (obj.text.includes('{{website}}')) {
                    obj.text = this.wizardData?.contactInfo?.website || 'Website';
                    obj.fontSize = isThumbnail ? 10 : 14;
                }
                else if (obj.text.includes('{{location}}')) {
                    obj.text = this.wizardData?.contactInfo?.location || 'Location';
                    obj.fontSize = isThumbnail ? 10 : 14;
                }
                else if (obj.text.includes('{{photo}}')) {
                    // Handle photo placeholder
                    if (this.wizardData?.contactInfo?.photo) {
                        fabric.Image.fromURL(this.wizardData.contactInfo.photo, (img) => {
                            img.scaleToHeight(obj.height * scale);
                            img.scaleToWidth(obj.width * scale);
                            img.set({
                                left: obj.left * scale,
                                top: obj.top * scale,
                                originX: 'center',
                                originY: 'center'
                            });
                            canvas.add(img);
                            canvas.renderAll();
                        });
                        return null; // Skip adding text object if it's a photo placeholder
                    }
                }

                // Maintain original styling if specified
                obj.fill = obj.fill || '#000000';
                obj.fontFamily = obj.fontFamily || 'Arial';
                obj.lineHeight = obj.lineHeight || 1.2;
                
                // Scale position and size
                obj.top = obj.top * scale;
                obj.left = obj.left * scale;
                obj.fontSize = (obj.fontSize || 16) * scale;
            }
            return obj;
        }).filter(Boolean); // Remove null entries (photo placeholders)

        // Create and add objects to canvas
        fabric.util.enlivenObjects(customizedTemplate.objects, (objects) => {
            objects.forEach(obj => canvas.add(obj));
            canvas.renderAll();
        });
    }

    setupStep1Listeners(dialog) {
        const continueBtn = dialog.querySelector('.btn-continue');
        const closeBtn = dialog.querySelector('.dialog-close');
        const inputs = dialog.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.classList.add('transition-all', 'duration-200');
            input.addEventListener('input', () => {
                const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
                continueBtn.disabled = !allFilled;
                continueBtn.classList.toggle('opacity-50', !allFilled);
            });
        });

        continueBtn.addEventListener('click', () => {
            this.wizardData.personalInfo = {
                firstName: dialog.querySelector('#firstName').value,
                lastName: dialog.querySelector('#lastName').value,
                title: dialog.querySelector('#title').value,
                company: dialog.querySelector('#company').value
            };
            this.closeDialog(dialog);
            this.showStep2Dialog();
        });

        closeBtn.addEventListener('click', () => this.closeDialog(dialog));
    }

    setupStep2Listeners(dialog) {
        const continueBtn = dialog.querySelector('.btn-continue');
        const backBtn = dialog.querySelector('.btn-back');
        const closeBtn = dialog.querySelector('.dialog-close');
        const inputs = dialog.querySelectorAll('input[required]');
        const photoInput = dialog.querySelector('#photo');
        const photoUploadLabel = dialog.querySelector('.photo-upload label');
        photoUploadLabel.className = 'flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none';

        inputs.forEach(input => {
            input.classList.add('transition-all', 'duration-200');
            input.addEventListener('input', () => {
                const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
                continueBtn.disabled = !allFilled;
                continueBtn.classList.toggle('opacity-50', !allFilled);
            });
        });

        photoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.wizardData.contactInfo.photo = e.target.files[0];
                dialog.querySelector('.photo-upload label span').textContent = 'Photo Selected';
            }
        });

        continueBtn.addEventListener('click', () => {
            this.wizardData.contactInfo = {
                ...this.wizardData.contactInfo,
                phoneNumber: dialog.querySelector('#phoneNumber').value,
                email: dialog.querySelector('#email').value,
                website: dialog.querySelector('#website').value,
                location: dialog.querySelector('#location').value
            };
            this.closeDialog(dialog);
            this.showStep3Dialog();
        });

        backBtn.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep1Dialog();
        });

        closeBtn.addEventListener('click', () => this.closeDialog(dialog));
    }

    setupStep3Listeners(dialog) {
        const continueBtn = dialog.querySelector('.btn-continue');
        const backBtn = dialog.querySelector('.btn-back');
        const closeBtn = dialog.querySelector('.dialog-close');
        const templateGrid = dialog.querySelector('.business-card-templates-grid');
        templateGrid.className = 'grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4';

        // Add template selection and color scheme selection logic here

        continueBtn.addEventListener('click', () => {
            // this.saveToIndexDBAndRedirect();
        });

        backBtn.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep2Dialog();
        });

        closeBtn.addEventListener('click', () => this.closeDialog(dialog));
    }

    showDialog(dialog) {
        document.body.appendChild(dialog);
        requestAnimationFrame(() => dialog.classList.add('show'));
    }

    closeDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 300);
    }
    
    saveToIndexDBAndRedirect(template) {
        const request = indexedDB.open('templateDB', 1);

        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('templates')) {
                db.createObjectStore('templates', { keyPath: 'current' });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            // Check if record exists
            const checkRequest = store.get('currentTemplate');

            checkRequest.onsuccess = (event) => {
                const existingData = event.target.result;
                const newData = {
                    ...template,
                    current: 'currentTemplate',
                    colorScheme: this.wizardData.designChoices.colorScheme,
                    timestamp: Date.now()
                };

                // Use add for new records, put for existing ones
                const storeRequest = existingData ? 
                    store.put(newData) : 
                    store.add(newData);

                storeRequest.onerror = (error) => {
                    console.error('Error saving to IndexedDB:', error);
                    // Fallback to localStorage
                    this.saveToLocalStorageAndRedirect(template);
                };

                storeRequest.onsuccess = () => {
                    console.log(`Template ${existingData ? 'updated' : 'added'} successfully`);
                    if (window.location.href.includes('wp-admin')) {
                        window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
                    } else {
                        window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
                    }
                };
            };

            checkRequest.onerror = (error) => {
                console.error('Error checking existing record:', error);
                // Fallback to localStorage
                this.saveToLocalStorageAndRedirect(template);
            };
        };
    }

    saveToLocalStorageAndRedirect(template) {
        try {
            localStorage.setItem('currentTemplate', JSON.stringify(template));
            if (window.location.href.includes('wp-admin')) {
                window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
            } else {
                window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html';
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error saving template. Please try again.');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new BusinessCardDisplay();
}); 