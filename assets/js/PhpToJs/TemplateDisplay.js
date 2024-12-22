class TemplateDisplay {
    constructor() {
        this.templates = window.templates || [];
        this.previewCanvases = new Map();
        this.wizardData = {
            companyName: '',
            slogan: '',
            industry: '',
            selectedTemplate: null,
            colorScheme: null
        };
        this.savedLogos = [];
        this.previewCanvas = null;
        this.addCanvasStyles();
        this.initialize();
    }

    addCanvasStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .canvas-container {
                width: 100% !important;
                height: 100% !important;
                position: relative !important;
            }
            .canvas-container canvas {
                width: 100% !important;
                height: 100% !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
            }
            .template-preview-card {
                height: 100%;
            }
            .template-preview-card .aspect-square {
                position: relative;
                padding-top: 100%;
            }
            .template-preview-card .canvas-container {
                position: absolute !important;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
        `;
        document.head.appendChild(style);
    }

    async initialize() {
        await this.fetchSavedLogos();
        this.createTemplateGrid();
    }

    async fetchSavedLogos() {
        try {
            const response = await fetch(`${window.location.origin}/wordpress/wp-admin/admin-ajax.php?action=get_saved_items&type=logos`);
            const data = await response.json();
            if (data.success && data.data.logos) {
                this.savedLogos = data.data.logos;
            }
        } catch (error) {
            console.error('Error fetching saved logos:', error);
        }
    }

    renderSavedCards() {
        const savedCards = [] // this.window.savedCards || [];

        const container =  document.createElement('div');
                         
        container.className = 'business-cards-container';

        // Saved Cards
        const savedCardsHTML = savedCards.map(card => `
            <div class="business-card-item" data-id="${card.timestamp}">
                <div class="card-preview">
                    <canvas class="saved-card-canvas"></canvas>
                </div>
                <div class="card-actions">
                    <button class="edit-card"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-card"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');

        container.innerHTML =  savedCardsHTML;

        // Initialize canvases for saved cards
        savedCards.forEach(card => {
            const canvas = container.querySelector(`[data-id="${card.timestamp}"] canvas`);
            if (canvas) {
                const fabricCanvas = new fabric.Canvas(canvas, {
                    width: 300,
                    height: 180,
                    backgroundColor: '#ffffff'
                });
                this.renderTemplatePreview(fabricCanvas, card, true);
            }
        });

        container.querySelectorAll('.edit-card').forEach(button => {
            button.addEventListener('click', (e) => {
                const cardId = e.target.closest('.business-card-item').dataset.id;
                const card = savedCards.find(c => c.timestamp == cardId);
                if (card) {
                    this.saveToIndexDBAndRedirect(card);
                }
            });
        });

        container.querySelectorAll('.delete-card').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this card?')) {
                    const cardId = e.target.closest('.business-card-item').dataset.id;
                    this.deleteCard(cardId);
                }
            });
        });

        return container;
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

    createTemplateGrid() {
        const container = document.createElement('div');
        container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4';
        
        // Create New Logo card first
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-dashed border-gray-300 hover:border-blue-400 transition-all duration-200 cursor-pointer group h-[280px]" id="createNewLogo">
                <div class="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50">
                    <i class="fas fa-plus-circle text-3xl text-blue-500 mb-3 group-hover:scale-110 transition-transform"></i>
                    <h4 class="text-base font-medium text-gray-600 group-hover:text-blue-500 transition-colors">Create New Logo</h4>
                    <span class="text-sm text-gray-400 mt-2">Start Fresh</span>
                </div>
            </div>
        `;

        // Add saved logos
        if (this.savedLogos.length > 0) {
            const savedLogosHTML = this.savedLogos.map(logo => `
                <div class="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md h-[280px] relative logo-card" 
                     data-id="${logo.id}"
                     data-date="${new Date(logo.dateCreated).toISOString()}">
                    <!-- ID Badge -->
                    <div class="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10 transition-opacity duration-200 group-hover:opacity-0">
                        ID: ${logo.id}
                    </div>

                    <!-- Main Image Container -->
                    <div class="h-full w-full relative overflow-hidden">
                        <!-- Image with zoom effect -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <img src="${logo.imageUrl}" 
                                 alt="Logo Preview" 
                                 class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110">
                        </div>

                        <!-- Bottom Actions -->
                        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div class="flex gap-2">
                                <button class="flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-blue-600 py-2 px-4 rounded-md text-sm transition-colors duration-200" 
                                        onclick="window.logoSaver.loadLogo('${logo.id}')">
                                    <i class="fas fa-edit"></i>
                                    <span>Edit</span>
                                </button>
                                <button class="flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-red-600 py-2 px-4 rounded-md text-sm transition-colors duration-200" 
                                        onclick="window.logoSaver.deleteLogo('${logo.id}')">
                                    <i class="fas fa-trash"></i>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML += savedLogosHTML;
        }

        // Add sort and filter controls
        const controls = document.createElement('div');
        controls.className = 'flex items-center justify-between mb-4';
        controls.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="relative">
                    <select id="sortSelect" class="appearance-none bg-white border border-gray-200 rounded-md py-2 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">ID</option>
                    </select>
                    <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                <div class="relative">
                    <input type="text" id="searchInput" placeholder="Search by ID..." 
                        class="bg-white border border-gray-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
            <div class="flex gap-2">
                <span class="text-sm text-gray-500">${this.savedLogos.length} logos</span>
            </div>
        `;

        // Clear and append to template section
        const templateSection = document.querySelector('.template-section');
        templateSection.innerHTML = '';
        
        // Create wrapper with padding and shadow
        const wrapper = document.createElement('div');
        wrapper.className = 'bg-gray-100/50 rounded-lg p-4';
        wrapper.appendChild(controls);
        wrapper.appendChild(container);
        templateSection.appendChild(wrapper);
        
        // Add click handler for Create New Logo
        const createNewButton = wrapper.querySelector('#createNewLogo');
        createNewButton.addEventListener('click', () => {
            this.showStep1Dialog();
        });

        // Add sort and filter event listeners
        const sortSelect = wrapper.querySelector('#sortSelect');
        const searchInput = wrapper.querySelector('#searchInput');

        sortSelect.addEventListener('change', () => this.sortLogos(sortSelect.value));
        searchInput.addEventListener('input', (e) => this.filterLogos(e.target.value));
        
        this.container = container;
    }

    renderSavedLogos() {
        if (!this.savedLogos.length) return null;

        const container = document.createElement('div');
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6';

        const savedLogosHTML = this.savedLogos.map(logo => `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" data-id="${logo.id}">
                <div class="aspect-square bg-gray-50 p-4 flex items-center justify-center border-b border-gray-100">
                    <img src="${logo.imageUrl}" alt="Logo Preview" class="max-w-full max-h-full object-contain">
                </div>
                <div class="p-4">
                    <div class="text-xs text-gray-500">
                        <p>Created: ${new Date(logo.dateCreated).toLocaleDateString()}</p>
                        <p>Modified: ${new Date(logo.lastModified).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-2 p-4 border-t border-gray-100">
                    <button class="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-md transition-colors duration-200 edit-logo" onclick="window.logoSaver.loadLogo('${logo.id}')">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-md transition-colors duration-200 delete-logo" onclick="window.logoSaver.deleteLogo('${logo.id}')">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = savedLogosHTML;
        return container;
    }

    showDialog(dialog) {
        document.body.appendChild(dialog);
        // Prevent body scrolling when dialog is open
        document.body.classList.add('overflow-hidden');
        // Add fade-in effect
        requestAnimationFrame(() => {
            dialog.classList.remove('opacity-0');
            dialog.classList.add('opacity-100');
        });
    }

    closeDialog(dialog) {
        // Add fade-out effect
        dialog.classList.remove('opacity-100');
        dialog.classList.add('opacity-0');
        // Re-enable body scrolling
        document.body.classList.remove('overflow-hidden');
        // Remove dialog after animation
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }

    createNewLogoCard() {
        const card = document.createElement('div');
        card.className = 'template-card create-new';
        card.innerHTML = `
            <div class="add-template-preview">
                <i class="fas fa-plus-circle"></i>
            </div>
            <div class="template-info">
                <h4>Create New Logo</h4>
                <span class="template-category-name">Start Fresh</span>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showStep1Dialog();
        });

        return card;
    }

    showStep1Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        dialog.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md relative transform transition-all">
                <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Let's create your logo</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input type="text" id="companyName" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your company name" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Slogan (Optional)</label>
                            <input type="text" id="slogan" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your slogan">
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 rounded-b-xl border-t">
                    <button class="btn-continue w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled>Continue</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        
        // Set up event listeners
        this.setupStep1Listeners(dialog);
    }

    setupStep1Listeners(dialog) {
        const nameInput = dialog.querySelector('#companyName');
        const sloganInput = dialog.querySelector('#slogan');
        const continueBtn = dialog.querySelector('.btn-continue');
        const closeBtn = dialog.querySelector('button');

        // Enable/disable continue button based on company name
        nameInput.addEventListener('input', () => {
            this.wizardData.companyName = nameInput.value.trim();
            continueBtn.disabled = !this.wizardData.companyName;
            // Update button styling based on disabled state
            if (continueBtn.disabled) {
                continueBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
                continueBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            } else {
                continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
                continueBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        });

        // Store slogan value
        sloganInput.addEventListener('input', () => {
            this.wizardData.slogan = sloganInput.value.trim();
        });

        // Close dialog
        closeBtn.addEventListener('click', () => {
            this.closeDialog(dialog);
        });

        // Continue to next step
        continueBtn.addEventListener('click', () => {
            if (this.wizardData.companyName) {
                this.closeDialog(dialog);
                this.showStep2Dialog();
            }
        });
    }

    showStep2Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        dialog.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md relative transform transition-all">
                <div class="absolute top-4 right-4 flex space-x-2">
                    <button class="btn-back text-gray-400 hover:text-gray-600 transition-colors">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button class="dialog-close text-gray-400 hover:text-gray-600 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Choose your industry</h2>
                    <select class="industry-select w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        <option value="">Select an industry</option>
                        ${[...new Set(this.templates.map(t => t.category))].map(category => `
                            <option value="${category.toLowerCase()}">${this.formatCategoryName(category)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="px-6 py-4 bg-gray-50 rounded-b-xl border-t">
                    <button class="btn-continue w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled>Continue</button>
                </div>
            </div>
        `;

        this.setupStep2Listeners(dialog);
        this.showDialog(dialog);
    }

    formatCategoryName(category) {
        // Convert category names to proper format
        // e.g., "food_and_drink" -> "Food & Drink"
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' & ');
    }

    setupStep2Listeners(dialog) {
        const industrySelect = dialog.querySelector('.industry-select');
        const continueBtn = dialog.querySelector('.btn-continue');
        const backBtn = dialog.querySelector('.btn-back');
        const closeBtn = dialog.querySelector('.dialog-close');

        // Enable/disable continue button based on selection
        industrySelect.addEventListener('change', () => {
            this.wizardData.industry = industrySelect.value;
            continueBtn.disabled = !industrySelect.value;
            
            // Update button styling
            if (continueBtn.disabled) {
                continueBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
                continueBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            } else {
                continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
                continueBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
        });

        // Back button handler
        backBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep1Dialog();
        });

        // Close button handler
        closeBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
        });

        // Continue button handler
        continueBtn.addEventListener('click', () => {
            if (this.wizardData.industry) {
                this.closeDialog(dialog);
                this.showStep3Dialog();
            }
        });
    }

    filterTemplatesByCategory(category) {
        return this.templates.filter(template => 
            template.category.toLowerCase() === category.toLowerCase()
        );
    }

    handleTemplateSelect(template) {
        this.wizardData.selectedTemplate = template;
        this.saveAndRedirect(template);
    }

    saveAndRedirect(template) {
        const templateData = {
            id: Date.now(),
            ...template,
            customization: this.wizardData
        };

        try {
            const savedTemplates = JSON.parse(localStorage.getItem('savedTemplates')) || [];
            savedTemplates.push(templateData);
            localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates));
            window.location.href = 'edithor.html';
        } catch (error) {
            console.error('Error saving template:', error);
        }
    }

    showStep3Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] relative flex flex-col">
                <div class="absolute top-4 right-4 flex space-x-2">
                    <button class="btn-back text-gray-400 hover:text-gray-600 transition-colors">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button class="dialog-close text-gray-400 hover:text-gray-600 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6 flex-grow overflow-auto">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Choose your template</h2>
                    <div class="selected-industry mb-6">
                        <h3 class="text-xl font-semibold text-gray-700">${this.formatCategoryName(this.wizardData.industry)}</h3>
                        <div class="h-1 w-20 bg-blue-500 mt-2"></div>
                    </div>
                    
                    <div class="space-y-8">
                        <div class="preferred-templates">
                            <h4 class="text-lg font-medium text-gray-700 mb-4">Preferred Templates</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${this.filterTemplatesByIndustry(this.wizardData.industry)
                                    .map(template => this.createTemplatePreviewCard(template))
                                    .join('')}
                            </div>
                        </div>
                        
                        <div class="h-px bg-gray-200 my-8"></div>
                        
                        <div class="all-templates">
                            <h4 class="text-lg font-medium text-gray-700 mb-4">All Templates</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${this.templates
                                    .filter(t => t.category !== this.wizardData.industry)
                                    .map(template => this.createTemplatePreviewCard(template))
                                    .join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 border-t">
                    <button class="btn-continue w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled>Continue to Colors</button>
                </div>
            </div>
        `;

        this.setupStep3Listeners(dialog);
        this.showDialog(dialog);
    }

    initializePreviewCanvas(card) {
        try {
            const templateId = card.dataset.templateId;
            const template = this.templates.find(t => t.name === templateId);
            const canvasContainer = card.querySelector('.canvas-container');
            const canvasElement = canvasContainer?.querySelector('canvas');
            
            if (!template || !canvasContainer || !canvasElement) {
                console.error('Missing elements:', { template, canvasContainer, canvasElement });
                return;
            }

            // Get container dimensions
            const containerRect = canvasContainer.getBoundingClientRect();
            const size = Math.min(containerRect.width, containerRect.height);

            // Create Fabric canvas with explicit dimensions
            const canvas = new fabric.Canvas(canvasElement, {
                width: size,
                height: size,
                selection: false,
                renderOnAddRemove: true,
                preserveObjectStacking: true
            });

            // Set white background
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

            const renderTemplate = () => {
                canvas.clear();

                if (template.type === 'svg') {
                    fabric.loadSVGFromString(template.data, (objects, options) => {
                        const svgGroup = fabric.util.groupSVGElements(objects, options);
                        
                        // Scale to fit
                        const scale = Math.min(
                            (size * 0.8) / svgGroup.width, 
                            (size * 0.8) / svgGroup.height
                        );
                        svgGroup.scale(scale);
                        
                        // Center
                        svgGroup.center();
                        canvas.add(svgGroup);
                        canvas.renderAll();
                    });
                } else if (template.type === 'fabric') {
                    const templateData = typeof template.data === 'string' ? 
                        JSON.parse(template.data) : template.data;

                    // Update text objects with placeholders
                    templateData.objects = templateData.objects.map(obj => {
                        if (obj.type === 'text' || obj.type === 'i-text') {
                            if (obj.text.includes('{{companyName}}') || 
                                obj.text.includes('Double click to edit')) {
                                obj.text = this.wizardData.companyName || 'Company Name';
                            } else if (obj.text.includes('{{slogan}}')) {
                                obj.text = this.wizardData.slogan || 'Your Slogan';
                            }
                        }
                        return obj;
                    });

                    // Create and add objects to canvas
                    fabric.util.enlivenObjects(templateData.objects, (objects) => {
                        // Calculate total bounds of all objects
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

                        // Create group with adjusted position
                        const group = new fabric.Group(objects, {
                            left: -minX,
                            top: -minY
                        });

                        // Calculate scale to fit canvas
                        const scale = Math.min(
                            (size * 0.8) / groupWidth,
                            (size * 0.8) / groupHeight
                        );

                        // Apply scale
                        group.scale(scale);

                        // Center the group in canvas
                        group.set({
                            left: (size - groupWidth * scale) / 2,
                            top: (size - groupHeight * scale) / 2
                        });

                        // Add to canvas and render
                        canvas.add(group);
                        canvas.renderAll();
                    });
                }
            };

            // Store canvas reference
            this.previewCanvases.set(templateId, canvas);

            // Add resize observer
            const resizeObserver = new ResizeObserver(() => {
                const newSize = Math.min(
                    canvasContainer.clientWidth,
                    canvasContainer.clientHeight
                );

                canvas.setDimensions({
                    width: newSize,
                    height: newSize
                });

                renderTemplate();
            });

            resizeObserver.observe(canvasContainer);

            // Initial render
            renderTemplate();

            // Make sure canvas is visible
            canvasElement.style.display = 'block';
            canvasElement.style.width = '100%';
            canvasElement.style.height = '100%';

        } catch (error) {
            console.error('Error initializing preview canvas:', error);
        }
    }

    addPreviewText(canvas, template, size) {
        // Add company name
        const companyText = new fabric.Text(this.wizardData.companyName || 'Company Name', {
            fontSize: size * 0.08,
            fill: template.textColor || '#000000',
            top: size * 0.7,
            left: size / 2,
            originX: 'center',
            originY: 'center',
            selectable: false
        });

        // Add slogan if exists
        if (this.wizardData.slogan) {
            const sloganText = new fabric.Text(this.wizardData.slogan, {
                fontSize: size * 0.06,
                fill: template.textColor || '#000000',
                top: size * 0.8,
                left: size / 2,
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            canvas.add(sloganText);
        }

        canvas.add(companyText);
    }

    resizePreviewCanvas(canvas, newSize) {
        if (!canvas) return;

        // Update canvas size
        canvas.setWidth(newSize);
        canvas.setHeight(newSize);

        // Scale all objects
        const scaleFactor = newSize / canvas.getWidth();
        canvas.getObjects().forEach(obj => {
            obj.scale(obj.scaleX * scaleFactor);
            obj.set({
                left: obj.left * scaleFactor,
                top: obj.top * scaleFactor
            });
        });

        canvas.renderAll();
    }

    createTemplatePreviewCard(template) {
        return `
            <div class="template-preview-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                 data-template-id="${template.name || `template-${Date.now()}`}">
                <div class="aspect-square w-full relative bg-gray-50 p-4">
                    <div class="canvas-container w-full h-full relative">
                        <canvas class="absolute inset-0 w-full h-full"></canvas>
                    </div>
                </div>
                <div class="p-4">
                    <h4 class="font-medium text-gray-800">${template.name}</h4>
                    <span class="text-sm text-gray-500">${this.formatCategoryName(template.category)}</span>
                </div>
            </div>
        `;
    }

    filterTemplatesByIndustry(industry) {
        return this.templates.filter(t => t.category === industry);
    }

    showStep4Dialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto';
        dialog.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative flex flex-col min-h-[80vh] md:min-h-0">
                <div class="absolute top-4 right-4 flex space-x-2 z-10">
                    <button class="btn-back text-gray-400 hover:text-gray-600 transition-colors p-2">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button class="dialog-close text-gray-400 hover:text-gray-600 transition-colors p-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="flex-grow overflow-y-auto p-4 md:p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Preview Section with centered canvas -->
                        <div class="preview-section bg-gray-50 rounded-lg flex items-center justify-center aspect-square w-full max-w-md mx-auto">
                            <div class="canvas-wrapper w-[90%] h-[90%] relative">
                                <div class="canvas-container w-full h-full">
                                    <canvas></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- Color Schemes Section -->
                        <div class="color-schemes space-y-6">
                            <h3 class="text-xl font-semibold text-gray-800">Choose Color Scheme</h3>
                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
                                ${this.generateColorSchemeCards()}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sticky bottom-0 px-4 md:px-6 py-4 bg-gray-50 border-t mt-auto">
                    <button class="btn-continue w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                            disabled>Generate Logo</button>
                </div>
            </div>
        `;

        // Add canvas styles
        const style = document.createElement('style');
        style.textContent = `
            .preview-section {
                position: relative;
                padding: 0 !important;
                overflow: hidden;
            }
            .canvas-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .canvas-container {
                position: relative !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .canvas-container canvas {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                max-width: 100% !important;
                max-height: 100% !important;
            }
        `;
        document.head.appendChild(style);

        this.setupStep4Listeners(dialog);
        this.showDialog(dialog);

        // Initialize preview canvas after dialog is shown
        setTimeout(() => {
            this.initializePreviewWithColorScheme(dialog.querySelector('.preview-section'));
        }, 100);
    }

    initializePreviewWithColorScheme(container, colorScheme) {
        const canvasElement = container.querySelector('canvas');
        if (!canvasElement || !this.wizardData.selectedTemplate) return;

        const containerRect = container.querySelector('.canvas-wrapper').getBoundingClientRect();
        const size = Math.min(containerRect.width, containerRect.height);

        // Create or get existing canvas
        if (!this.previewCanvas) {
            this.previewCanvas = new fabric.Canvas(canvasElement, {
                width: size,
                height: size,
                selection: false,
                renderOnAddRemove: true,
                preserveObjectStacking: true,
                centeredScaling: true,
                centeredRotation: true
            });
        } else {
            this.previewCanvas.setDimensions({
                width: size,
                height: size
            });
        }

        // Clear existing content
        this.previewCanvas.clear();

        // Apply background
        if (colorScheme && colorScheme.background) {
            const background = this.createGradientBackground(colorScheme, size);
            this.previewCanvas.setBackgroundColor(
                background,
                this.previewCanvas.renderAll.bind(this.previewCanvas)
            );
        }

        const template = this.wizardData.selectedTemplate;
        let templateData;

        if (template.type === 'fabric') {
            templateData = typeof template.data === 'string' ? 
                JSON.parse(template.data) : template.data;

            // Only update existing text objects
            templateData.objects = templateData.objects.map(obj => {
                if (obj.type === 'text' || obj.type === 'i-text') {
                    // Check if text contains placeholders
                    if (obj.text.includes('{{companyName}}') || obj.text.includes('{{Double click to edit}}')) {
                        obj.text = this.wizardData.companyName;
                    } else if (obj.text.includes('{{slogan}}') && this.wizardData.slogan) {
                        obj.text = this.wizardData.slogan;
                    }

                    // Apply color scheme if selected
                    if (colorScheme) {
                        obj.fill = colorScheme.text;
                    }
                } else if (obj.fill && obj.fill !== 'none' && colorScheme) {
                    obj.fill = colorScheme.primary;
                }
                return obj;
            });

            fabric.util.enlivenObjects(templateData.objects, (objects) => {
                const group = new fabric.Group(objects);
                const scale = Math.min(
                    (size * 0.8) / group.width,
                    (size * 0.8) / group.height
                );
                group.scale(scale);
                group.center();
                this.previewCanvas.add(group);
                this.previewCanvas.renderAll();
            });

        } else if (template.type === 'svg') {
            let svgData = template.data;

            // Replace placeholders in SVG
            svgData = svgData.replace(/\{\{companyName\}\}/g, this.wizardData.companyName);
            if (this.wizardData.slogan) {
                svgData = svgData.replace(/\{\{slogan\}\}/g, this.wizardData.slogan);
            }

            // Apply color scheme if selected
            if (colorScheme) {
                // Update text elements
                svgData = svgData.replace(
                    /<text[^>]*?fill="[^"]*"/g, 
                    match => match.replace(/fill="[^"]*"/, `fill="${colorScheme.text}"`)
                );

                // Update other elements
                svgData = svgData.replace(
                    /<(?!text)[^>]*?fill="[^"]*"/g,
                    match => {
                        if (match.includes('fill="none"')) return match;
                        return match.replace(/fill="[^"]*"/, `fill="${colorScheme.primary}"`);
                    }
                );
            }

            fabric.loadSVGFromString(svgData, (objects, options) => {
                const svgGroup = fabric.util.groupSVGElements(objects, options);
                const scale = Math.min(
                    (size * 0.8) / svgGroup.width,
                    (size * 0.8) / svgGroup.height
                );
                svgGroup.scale(scale);
                svgGroup.center();
                this.previewCanvas.add(svgGroup);
                this.previewCanvas.renderAll();
            });
        }

        return this.previewCanvas;
    }

    createGradientBackground(colorScheme, size) {
        if (!colorScheme.background.includes('gradient')) {
            return colorScheme.background;
        }

        try {
            const colors = colorScheme.background.match(/#[A-Fa-f0-9]{6}/g) || ['#FFFFFF', '#F5F5F5'];
            
            return new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: 0,
                    y1: 0,
                    x2: size,
                    y2: size
                },
                colorStops: [
                    { offset: 0, color: colors[0] || '#FFFFFF' },
                    { offset: 1, color: colors[1] || '#F5F5F5' }
                ]
            });
        } catch (error) {
            console.error('Error creating gradient background:', error);
            return '#FFFFFF';
        }
    }

    sortLogos(sortBy) {
        const logos = Array.from(this.container.querySelectorAll('.logo-card'));
        const createNewCard = this.container.querySelector('#createNewLogo');

        logos.sort((a, b) => {
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
        this.container.innerHTML = '';
        this.container.appendChild(createNewCard);
        logos.forEach(logo => this.container.appendChild(logo));
    }

    filterLogos(searchTerm) {
        const logos = this.container.querySelectorAll('.logo-card');
        const searchLower = searchTerm.toLowerCase();

        logos.forEach(logo => {
            const id = logo.dataset.id.toLowerCase();
            const matches = id.includes(searchLower);
            logo.style.display = matches ? '' : 'none';
        });
    }

    setupStep4Listeners(dialog) {
        const colorCards = dialog.querySelectorAll('.color-scheme-card');
        const continueBtn = dialog.querySelector('.btn-continue');
        const backBtn = dialog.querySelector('.btn-back');
        const closeBtn = dialog.querySelector('.dialog-close');
        const previewSection = dialog.querySelector('.preview-section');

        colorCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selection
                colorCards.forEach(c => {
                    c.classList.remove('ring-2', 'ring-blue-500');
                    c.classList.add('hover:border-blue-500');
                });
                
                // Add selection to clicked card
                card.classList.add('ring-2', 'ring-blue-500');
                card.classList.remove('hover:border-blue-500');
                
                // Store selected colors and update preview
                const colors = JSON.parse(card.dataset.colors);
                this.wizardData.colorScheme = colors;
                
                // Initialize preview with new colors
                this.initializePreviewWithColorScheme(previewSection, colors);
                
                // Enable continue button
                continueBtn.disabled = false;
                continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
                continueBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            });
        });

        continueBtn.addEventListener('click', () => {
            if (this.wizardData.colorScheme) {
                this.closeDialog(dialog);
                this.generateAndSaveTemplate();
            }
        });

        backBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep3Dialog();
        });

        closeBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
        });
    }

    generateAndSaveTemplate() {
        const selectedTemplate = this.wizardData.selectedTemplate;
        if (!selectedTemplate) {
            console.error('No template selected');
            return;
        }

        // Create final template with customizations
        const finalTemplate = this.createCustomizedTemplate(selectedTemplate);

        // Save to IndexedDB and redirect
        this.saveToIndexDBAndRedirect(finalTemplate);
    }

    createCustomizedTemplate(template) {
        let customizedTemplate = JSON.parse(JSON.stringify(template));

        if (template.type === 'fabric') {
            // Get existing text objects from the template
            const existingTexts = customizedTemplate.data.objects.filter(
                obj => obj.type === 'text' || obj.type === 'i-text'
            );

            // Only update existing text objects, don't add new ones
            customizedTemplate.data.objects = customizedTemplate.data.objects.map(obj => {
                if (obj.type === 'text' || obj.type === 'i-text') {
                    // Check if text contains placeholders
                    if (obj.text.includes('{{companyName}}')) {
                        obj.text = this.wizardData.companyName;
                    } else if (obj.text.includes('{{slogan}}') && this.wizardData.slogan) {
                        obj.text = this.wizardData.slogan;
                    }

                    // Apply color scheme if selected
                    if (this.wizardData.colorScheme) {
                        obj.fill = this.wizardData.colorScheme.text;
                    }
                } else if (obj.fill && obj.fill !== 'none' && this.wizardData.colorScheme) {
                    obj.fill = this.wizardData.colorScheme.primary;
                }
                return obj;
            });

        } else if (template.type === 'svg') {
            // Handle SVG template customization
            let svgData = customizedTemplate.data;

            // Replace placeholders in SVG
            svgData = svgData.replace(/\{\{companyName\}\}/g, this.wizardData.companyName);
            if (this.wizardData.slogan) {
                svgData = svgData.replace(/\{\{slogan\}\}/g, this.wizardData.slogan);
            }

            // Apply color scheme if selected
            if (this.wizardData.colorScheme) {
                // Update text elements
                svgData = svgData.replace(
                    /<text[^>]*?fill="[^"]*"/g, 
                    match => match.replace(/fill="[^"]*"/, `fill="${this.wizardData.colorScheme.text}"`)
                );

                // Update other elements
                svgData = svgData.replace(
                    /<(?!text)[^>]*?fill="[^"]*"/g,
                    match => {
                        if (match.includes('fill="none"')) return match;
                        return match.replace(/fill="[^"]*"/, `fill="${this.wizardData.colorScheme.primary}"`);
                    }
                );
            }

            customizedTemplate.data = svgData;
        }

        // Add metadata
        customizedTemplate.metadata = {
            createdAt: new Date().toISOString(),
            companyName: this.wizardData.companyName,
            slogan: this.wizardData.slogan,
            industry: this.wizardData.industry,
            colorScheme: this.wizardData.colorScheme
        };

        return customizedTemplate;
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
                    colorScheme: this.wizardData.colorScheme,
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
                window.location.href = '../wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=logo';
            } else {
                window.location.href = '/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html?l=logo';
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error saving template. Please try again.');
        }
    }

    setupStep3Listeners(dialog) {
        const templateCards = dialog.querySelectorAll('.template-preview-card');
        const continueBtn = dialog.querySelector('.btn-continue');
        const backBtn = dialog.querySelector('.btn-back');
        const closeBtn = dialog.querySelector('.dialog-close');

        // Initialize canvases after a short delay to ensure DOM is ready
        setTimeout(() => {
            templateCards.forEach(card => {
                this.initializePreviewCanvas(card);
            });
        }, 100);

        // Disable continue button initially
        continueBtn.disabled = true;
        continueBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
        continueBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');

        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selection
                templateCards.forEach(c => {
                    c.classList.remove('ring-2', 'ring-blue-500');
                    c.classList.add('hover:shadow-lg');
                });
                
                // Add selection to clicked card
                card.classList.add('ring-2', 'ring-blue-500');
                card.classList.remove('hover:shadow-lg');
                
                // Store selected template
                const templateId = card.dataset.templateId;
                const selectedTemplate = this.templates.find(t => t.name === templateId);
                
                if (selectedTemplate) {
                    this.wizardData.selectedTemplate = selectedTemplate;
                    // Enable continue button
                    continueBtn.disabled = false;
                    continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
                    continueBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    console.log('Selected template:', this.wizardData.selectedTemplate);
                }
            });
        });

        continueBtn.addEventListener('click', () => {
            if (this.wizardData.selectedTemplate) {
                this.closeDialog(dialog);
                this.showStep4Dialog();
            }
        });

        backBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
            this.showStep2Dialog();
        });

        closeBtn?.addEventListener('click', () => {
            this.closeDialog(dialog);
        });
    }

    setupDialogListeners(dialog) {
        const closeBtn = dialog.querySelector('.dialog-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeDialog(dialog);
            });
        }

        // Prevent closing when clicking inside the dialog
        dialog.querySelector('.dialog-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    generateColorSchemeCards() {
        const colorSchemes = [
            {
                name: 'Classic',
                colors: {
                    primary: '#333333',
                    secondary: '#666666',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                    text: '#000000'
                }
            },
            {
                name: 'Ocean',
                colors: {
                    primary: '#1E88E5',
                    secondary: '#64B5F6',
                    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                    text: '#0D47A1'
                }
            },
            {
                name: 'Forest',
                colors: {
                    primary: '#2E7D32',
                    secondary: '#81C784',
                    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                    text: '#1B5E20'
                }
            },
            {
                name: 'Sunset',
                colors: {
                    primary: '#F4511E',
                    secondary: '#FF8A65',
                    background: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 100%)',
                    text: '#BF360C'
                }
            },
            {
                name: 'Royal',
                colors: {
                    primary: '#5E35B1',
                    secondary: '#9575CD',
                    background: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
                    text: '#311B92'
                }
            },
            {
                name: 'Modern',
                colors: {
                    primary: '#212121',
                    secondary: '#757575',
                    background: 'linear-gradient(135deg, #FAFAFA 0%, #EEEEEE 100%)',
                    text: '#000000'
                }
            },
            {
                name: 'Nature',
                colors: {
                    primary: '#558B2F',
                    secondary: '#8BC34A',
                    background: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)',
                    text: '#33691E'
                }
            },
            {
                name: 'Tech',
                colors: {
                    primary: '#0288D1',
                    secondary: '#4FC3F7',
                    background: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)',
                    text: '#01579B'
                }
            }
        ];

        return colorSchemes.map(scheme => `
            <div class="color-scheme-card cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                 data-colors='${JSON.stringify(scheme.colors)}'>
                <div class="aspect-video relative">
                    <div class="absolute inset-0" style="background: ${scheme.colors.background}"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-2 flex gap-2">
                        <span class="w-6 h-6 rounded-full" style="background-color: ${scheme.colors.primary}"></span>
                        <span class="w-6 h-6 rounded-full" style="background-color: ${scheme.colors.secondary}"></span>
                        <span class="w-6 h-6 rounded-full" style="background-color: ${scheme.colors.text}"></span>
                    </div>
                </div>
                <div class="p-2 text-center bg-white border-t">
                    <span class="text-sm font-medium text-gray-700">${scheme.name}</span>
                </div>
            </div>
        `).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TemplateDisplay();
});