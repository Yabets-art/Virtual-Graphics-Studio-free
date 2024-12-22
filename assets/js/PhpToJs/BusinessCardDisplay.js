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
        this.ajaxUrl = window.location.origin + '/wordpress/wp-admin/admin-ajax.php';
        this.initialize();
    }

    async initialize() {
        await this.fetchSavedCards();
        this.createStructure();
    }

    async fetchSavedCards() {
        try {
            const formData = new FormData();
            formData.append('action', 'get_saved_items');
            formData.append('type', 'cards');
            
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched cards data:', data); // Debug log

            if (data.success && data.data && data.data.cards) {
                this.savedBusinessCards = data.data.cards;
                console.log('Saved cards:', this.savedBusinessCards);
            } else {
                console.warn('No cards found or invalid response format');
                this.savedBusinessCards = [];
            }
        } catch (error) {
            console.error('Error fetching saved business cards:', error);
            this.savedBusinessCards = [];
        }
    }

    renderSavedCards() {
        const container = document.createElement('div');
        container.className = 'bg-gray-100/50 rounded-lg p-4';

        // Add controls section (similar to logo display)
        const controls = document.createElement('div');
        controls.className = 'flex items-center justify-between mb-4';
        controls.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="relative">
                    <select id="sortSelect" class="appearance-none bg-white border border-gray-200 rounded-md py-2 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name</option>
                    </select>
                    <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                <div class="relative">
                    <input type="text" id="searchInput" placeholder="Search cards..." 
                        class="bg-white border border-gray-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
            <div class="flex gap-2">
                <span class="text-sm text-gray-500">${this.savedCards?.length || 0} cards</span>
            </div>
        `;

        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4';

        // Create New Card
        gridContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-dashed border-gray-300 hover:border-blue-400 transition-all duration-200 cursor-pointer group h-[280px]" id="createNewCard">
                <div class="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50">
                    <i class="fas fa-plus-circle text-3xl text-blue-500 mb-3 group-hover:scale-110 transition-transform"></i>
                    <h4 class="text-base font-medium text-gray-600 group-hover:text-blue-500 transition-colors">Create New Card</h4>
                    <span class="text-sm text-gray-400 mt-2">Start Fresh</span>
                </div>
            </div>
        `;

        // Add saved cards
        if (this.savedCards && this.savedCards.length > 0) {
            const savedCardsHTML = this.savedCards.map(card => `
                <div class="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md h-[280px] relative card-item" 
                     data-id="${card.id}"
                     data-date="${new Date(card.dateCreated).toISOString()}">
                    <!-- ID Badge -->
                    <div class="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10 transition-opacity duration-200 group-hover:opacity-0">
                        ID: ${card.id}
                    </div>

                    <!-- Main Image Container -->
                    <div class="h-full w-full relative overflow-hidden">
                        <!-- Preview Canvas Container -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="canvas-container w-full h-full">
                                <canvas class="saved-card-canvas"></canvas>
                            </div>
                        </div>

                        <!-- Bottom Actions -->
                        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div class="flex gap-2">
                                <button class="flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-blue-600 py-2 px-4 rounded-md text-sm transition-colors duration-200 edit-card">
                                    <i class="fas fa-edit"></i>
                                    <span>Edit</span>
                                </button>
                                <button class="flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-red-600 py-2 px-4 rounded-md text-sm transition-colors duration-200 delete-card">
                                    <i class="fas fa-trash"></i>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            gridContainer.innerHTML += savedCardsHTML;
        }

        container.appendChild(controls);
        container.appendChild(gridContainer);

        // Initialize canvases for saved cards
        setTimeout(() => {
            this.savedCards?.forEach(card => {
                const cardElement = container.querySelector(`[data-id="${card.id}"] canvas`);
                if (cardElement) {
                    const fabricCanvas = new fabric.Canvas(cardElement, {
                        width: 300,
                        height: 180,
                        backgroundColor: '#ffffff'
                    });
                    this.renderCardPreview(fabricCanvas, card);
                }
            });
        }, 100);

        // Add event listeners
        const createNewButton = container.querySelector('#createNewCard');
        createNewButton?.addEventListener('click', () => {
            this.showStep1Dialog();
        });

        // Sort and filter functionality
        const sortSelect = container.querySelector('#sortSelect');
        const searchInput = container.querySelector('#searchInput');

        sortSelect?.addEventListener('change', () => this.sortCards(sortSelect.value));
        searchInput?.addEventListener('input', (e) => this.filterCards(e.target.value));

        // Edit and Delete handlers
        container.querySelectorAll('.edit-card').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardId = e.target.closest('.card-item').dataset.id;
                const card = this.savedCards.find(c => c.id === cardId);
                if (card) {
                    this.editCard(card);
                }
            });
        });

        container.querySelectorAll('.delete-card').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this card?')) {
                    const cardId = e.target.closest('.card-item').dataset.id;
                    this.deleteCard(cardId);
                }
            });
        });

        return container;
    }

    // Sort cards function
    sortCards(sortBy) {
        const cards = Array.from(document.querySelectorAll('.card-item'));
        const createNewCard = document.querySelector('#createNewCard');
        const container = createNewCard.parentElement;

        cards.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'oldest':
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'name':
                    return a.dataset.id.localeCompare(b.dataset.id);
                default:
                    return 0;
            }
        });

        // Clear and rebuild container
        container.innerHTML = '';
        container.appendChild(createNewCard);
        cards.forEach(card => container.appendChild(card));
    }

    // Filter cards function
    filterCards(searchTerm) {
        const cards = document.querySelectorAll('.card-item');
        const searchLower = searchTerm.toLowerCase();

        cards.forEach(card => {
            const id = card.dataset.id.toLowerCase();
            const matches = id.includes(searchLower);
            card.style.display = matches ? '' : 'none';
        });
    }

    // Render card preview function
    renderCardPreview(canvas, card) {
        // Clear existing content
        canvas.clear();

        // Set background color
        canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

        // Add card content (this will depend on your card structure)
        if (card.content) {
            fabric.util.enlivenObjects(card.content.objects, (objects) => {
                objects.forEach(obj => {
                    canvas.add(obj);
                });
                canvas.renderAll();
            });
        }
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
                        <h2 class="text-xl font-semibold text-gray-900">Step 2: Contact Information</h2>
                    </div>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <input type="tel" id="phoneNumber" placeholder="Phone Number" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <input type="email" id="email" placeholder="Email Address" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="url" id="website" placeholder="Website (optional)" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <input type="text" id="location" placeholder="Location" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <div class="mt-4">
                            <label class="block w-full cursor-pointer">
                                <div class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
                                    <div class="photo-preview hidden absolute inset-0">
                                        <img src="" alt="Profile preview" class="w-full h-full object-contain">
                                    </div>
                                    <div class="upload-prompt flex flex-col items-center justify-center pt-5 pb-6">
                                        <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                                        <p class="text-sm text-gray-500">Upload Profile Photo (optional)</p>
                                    </div>
                                    <input type="file" id="photo" accept="image/*" class="hidden">
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-between gap-4">
                        <button class="btn-back flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                            Back
                        </button>
                        <button class="btn-continue flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
                            Continue to Design
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupStep2Listeners(dialog);
        this.showDialog(dialog);
    }

    showStep3Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 overflow-y-auto';
        dialog.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div class="flex min-h-full items-center justify-center p-4">
                <div class="relative transform overflow-hidden rounded-lg bg-white w-full max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200">
                        <button class="dialog-back p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <i class="fas fa-arrow-left text-gray-600"></i>
                        </button>
                        <h2 class="text-xl font-semibold text-gray-900">Step 3: Choose Your Design</h2>
                        <button class="dialog-close p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <i class="fas fa-times text-gray-600"></i>
                        </button>
                    </div>

                    <!-- Templates Grid -->
                    <div class="p-6">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
                            ${window.businessTemplates.map((template, index) => `
                                <div class="template-card cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200" 
                                     data-template-index="${index}">
                                    <div class="card-preview-container relative bg-white p-4" style="aspect-ratio: 1.67/1;">
                                        <canvas class="template-preview-canvas absolute inset-0 w-full h-full"></canvas>
                                    </div>
                                    <div class="p-3 bg-white border-t border-gray-100">
                                        <h4 class="font-medium text-gray-900">${template.name}</h4>
                                        <p class="text-sm text-gray-500">${template.category}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex justify-end gap-3 p-4 border-t border-gray-200">
                        <button class="btn-back px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            Back
                        </button>
                        <button class="btn-continue px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
                            Create Business Card
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupStep3Listeners(dialog);
        this.showDialog(dialog);

        // Initialize template previews after dialog is shown
        setTimeout(() => {
            this.initializeTemplatePreviews(dialog);
        }, 100);
    }

    initializeTemplatePreviews(dialog) {
        const templateCards = dialog.querySelectorAll('.template-card');
        
        templateCards.forEach((card, index) => {
            const canvas = card.querySelector('.template-preview-canvas');
            const container = card.querySelector('.card-preview-container');
            const template = window.businessTemplates[index];
            
            if (canvas && template && container) {
                // Set canvas dimensions
                const containerWidth = container.offsetWidth;
                const containerHeight = containerWidth / 1.67; // Maintain aspect ratio
                
                const fabricCanvas = new fabric.Canvas(canvas, {
                    width: containerWidth,
                    height: containerHeight,
                    backgroundColor: '#ffffff',
                    selection: false
                });

                // Render template preview
                if (template.data) {
                    try {
                        const templateData = typeof template.data === 'string' ? 
                            JSON.parse(template.data) : template.data;

                        fabric.util.enlivenObjects(templateData.objects, (objects) => {
                            // Calculate bounds of all objects
                            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                            objects.forEach(obj => {
                                const bounds = obj.getBoundingRect();
                                minX = Math.min(minX, bounds.left);
                                minY = Math.min(minY, bounds.top);
                                maxX = Math.max(maxX, bounds.left + bounds.width);
                                maxY = Math.max(maxY, bounds.top + bounds.height);
                            });

                            const groupWidth = maxX - minX;
                            const groupHeight = maxY - minY;

                            // Calculate scale to fit container
                            const scaleX = (containerWidth * 0.8) / groupWidth;
                            const scaleY = (containerHeight * 0.8) / groupHeight;
                            const scale = Math.min(scaleX, scaleY);

                            // Add and position objects
                            objects.forEach(obj => {
                                // Customize text if needed
                                if (obj.type === 'text' || obj.type === 'i-text') {
                                    this.customizeTextObject(obj, this.wizardData);
                                }

                                // Scale and position object
                                const currentScale = obj.scaleX || 1;
                                obj.set({
                                    scaleX: currentScale * scale,
                                    scaleY: currentScale * scale,
                                    left: (obj.left - minX) * scale + (containerWidth - groupWidth * scale) / 2,
                                    top: (obj.top - minY) * scale + (containerHeight - groupHeight * scale) / 2
                                });

                                fabricCanvas.add(obj);
                            });

                            fabricCanvas.renderAll();
                        });

                    } catch (error) {
                        console.error('Error rendering template:', error);
                        // Add fallback preview
                        const text = new fabric.Text('Preview not available', {
                            left: containerWidth / 2,
                            top: containerHeight / 2,
                            originX: 'center',
                            originY: 'center',
                            fontSize: 14,
                            fill: '#999999'
                        });
                        fabricCanvas.add(text);
                        fabricCanvas.renderAll();
                    }
                } else {
                    // Add placeholder for templates without data
                    const text = new fabric.Text('No preview', {
                        left: containerWidth / 2,
                        top: containerHeight / 2,
                        originX: 'center',
                        originY: 'center',
                        fontSize: 14,
                        fill: '#999999'
                    });
                    fabricCanvas.add(text);
                    fabricCanvas.renderAll();
                }
            }
        });
    }

    customizeTextObject(textObj, wizardData) {
        // Replace placeholder text with user data
        const replacements = {
            '{{firstName}}': wizardData.personalInfo.firstName || 'John',
            '{{lastName}}': wizardData.personalInfo.lastName || 'Doe',
            '{{title}}': wizardData.personalInfo.title || 'Position',
            '{{company}}': wizardData.personalInfo.company || 'Company Name',
            '{{phone}}': wizardData.contactInfo.phoneNumber || '(555) 555-5555',
            '{{email}}': wizardData.contactInfo.email || 'email@example.com',
            '{{website}}': wizardData.contactInfo.website || 'www.example.com',
            '{{location}}': wizardData.contactInfo.location || 'City, Country'
        };

        let newText = textObj.text;
        for (const [placeholder, value] of Object.entries(replacements)) {
            newText = newText.replace(new RegExp(placeholder, 'g'), value);
        }
        textObj.set('text', newText);

        // Ensure text is visible
        if (!textObj.fill || textObj.fill === 'none') {
            textObj.set('fill', '#000000');
        }
    }

    setupStep1Listeners(dialog) {
        const continueBtn = dialog.querySelector('.btn-continue');
        const closeBtn = dialog.querySelector('.dialog-close');
        const inputs = dialog.querySelectorAll('input[required]');

        inputs.forEach(input => {
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
        const photoPreview = dialog.querySelector('.photo-preview');
        const uploadPrompt = dialog.querySelector('.upload-prompt');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
                continueBtn.disabled = !allFilled;
                continueBtn.classList.toggle('opacity-50', !allFilled);
            });
        });

        photoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    // Store the image data
                    this.wizardData.contactInfo.photo = e.target.result;
                    
                    // Update preview
                    const previewImg = photoPreview.querySelector('img');
                    previewImg.src = e.target.result;
                    
                    // Show preview, hide prompt
                    photoPreview.classList.remove('hidden');
                    uploadPrompt.classList.add('hidden');
                };
                
                reader.readAsDataURL(e.target.files[0]);
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
        const templateCards = dialog.querySelectorAll('.template-card');

        // Template selection
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove selection from all cards
                templateCards.forEach(c => {
                    c.classList.remove('border-blue-500');
                    c.classList.add('border-transparent');
                });
                
                // Add selection to clicked card
                card.classList.remove('border-transparent');
                card.classList.add('border-blue-500');
                
                // Update selected template
                const templateIndex = parseInt(card.dataset.templateIndex);
                this.wizardData.designChoices.selectedTemplate = window.businessTemplates[templateIndex];
                
                // Enable continue button
                continueBtn.disabled = false;
                continueBtn.classList.remove('opacity-50');
            });
        });

        // Back button
        backBtn.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep2Dialog();
        });

        // Close button
        closeBtn.addEventListener('click', () => this.closeDialog(dialog));

        // Continue button
        continueBtn.addEventListener('click', () => {
            if (this.wizardData.designChoices.selectedTemplate) {
                this.saveToIndexDBAndRedirect(this.wizardData.designChoices.selectedTemplate);
            }
        });

        // Dialog back button (arrow)
        dialog.querySelector('.dialog-back').addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep2Dialog();
        });
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
                        window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=bc';
                    } else {
                        window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=bc';
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
                window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=bc';
            } else {
                window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=bc';
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