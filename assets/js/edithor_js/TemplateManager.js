
class TemplateManager {
    constructor(canvas,template = []) {
        this.canvas = canvas;
        this.templates =  template;
        this.currentCategory = 'all';
        this.sidebarOpen = false;
        this.previewCanvases = new Map();
        this.init();
    }

    init() {
        this.createTemplatePanel();
        this.initEventListeners();
        this.loadTemplates();
    }

    createTemplatePanel() {
        const panel = document.createElement('div');
        panel.className = 'template-panel';
        panel.innerHTML = `
            <div class="template-content">
                <div class="template-header">
                    <h3>Design Templates</h3>
                    <div class="template-search">
                        <input type="text" placeholder="Search templates...">
                        <select class="template-category">
                            <option value="all">All Categories</option>
                        </select>
                    </div>
                </div>
                <div class="template-grid-container">
                    <div class="template-grid"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        this.panel = panel;
        this.grid = panel.querySelector('.template-grid');
        this.searchInput = panel.querySelector('input');
        this.categorySelect = panel.querySelector('.template-category');
    }

    initEventListeners() {
        // Toggle sidebar
        const toggleBtn = document.getElementById('templateToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sidebarOpen && 
                !this.panel.contains(e.target) && 
                !e.target.closest('#templateToggle')) {
                this.toggleSidebar();
            }
        });

        // Prevent panel closing when clicking inside
        this.panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Search functionality
        this.searchInput.addEventListener('input', () => this.filterTemplates());

        // Category filter
        this.categorySelect.addEventListener('change', () => this.filterTemplates());
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.panel.classList.toggle('open', this.sidebarOpen);
        
        // Update the toggle button state
        const toggleBtn = document.getElementById('templateToggle');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.sidebarOpen);
        }
    }

    loadTemplates() {
        this.updateCategories();
        this.renderTemplates();
    }

    updateCategories() {
        const categories = new Set(['all']);
        this.templates.forEach(template => {
            if (template.category) {
                categories.add(template.category);
            }
        });

        this.categorySelect.innerHTML = Array.from(categories).map(category => 
            `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`
        ).join('');
    }

    filterTemplates() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.categorySelect.value;

        const filtered = this.templates.filter(template => {
            const matchesSearch = template.name.toLowerCase().includes(searchTerm) ||
                                template.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesCategory = category === 'all' || template.category === category;
            return matchesSearch && matchesCategory;
        });

        this.renderTemplates(filtered);
    }

    renderTemplates(templates = this.templates) {
        console.log('Rendering templates:', templates); // Debug log
        
        this.grid.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');
        
        // Add click handlers
        this.grid.querySelectorAll('.template-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                console.log('Card clicked:', templates[index]);
                this.handleTemplateSelect(templates[index]);
            });
        });

        // Render all fabric previews after cards are added to DOM
        setTimeout(() => {
            templates.forEach(template => {
                if (template.type !== 'svg') {
                    const canvas = this.previewCanvases.get(template.name);
                    if (canvas) {
                        canvas.renderAll();
                        console.log('Rendered preview for:', template.name); // Debug log
                    }
                }
            });
        }, 100);
    }

    createTemplateCard(template) {
        return `
            <div class="template-card" data-name="${template.name}">
                <div class="template-preview">
                    ${this.createPreview(template)}
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <span class="template-category-name">${template.category}</span>
                </div>
            </div>
        `;
    }

    createPreview(template) {
        try {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container';

            if (template.type === 'svg') {
                // If it's already SVG, use it directly
                previewContainer.innerHTML = template.data;
            } else {
                // Convert Fabric objects to SVG preview
                const tempCanvas = new fabric.StaticCanvas(null, {
                    width: 150,
                    height: 112
                });

                // Load objects
                fabric.util.enlivenObjects(template.data.objects, (objects) => {
                    // Group all objects
                    const group = new fabric.Group(objects, {
                        left: tempCanvas.width / 2,
                        top: tempCanvas.height / 2,
                        originX: 'center',
                        originY: 'center'
                    });

                    // Scale to fit
                    const scaleX = (tempCanvas.width * 0.8) / group.width;
                    const scaleY = (tempCanvas.height * 0.8) / group.height;
                    const scale = Math.min(scaleX, scaleY);
                    group.scale(scale);

                    tempCanvas.add(group);
                    tempCanvas.renderAll();

                    // Convert to SVG
                    const svg = tempCanvas.toSVG();
                    previewContainer.innerHTML = svg;
                });
            }

            // Ensure SVG fills container
            const svg = previewContainer.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.style.maxHeight = '100%';
            }

            return previewContainer.outerHTML;
        } catch (error) {
            console.error('Error creating preview:', error);
            return '<div class="preview-error">Error loading preview</div>';
        }
    }
    handleTemplateSelect(template) {
        console.log('Template selected:', template);
        
        const dialog = document.createElement('div');
        dialog.className = 'template-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>Load Template</h3>
                    <button class="dialog-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dialog-body">
                    <div class="template-preview">
                        ${this.createPreview(template)}
                    </div>
                    <p>How would you like to add "${template.name}"?</p>
                </div>
                <div class="dialog-buttons">
                    <button class="btn-cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn-append">
                        <i class="fas fa-plus"></i> Append to Canvas
                    </button>
                    <button class="btn-clear">
                        <i class="fas fa-sync"></i> Clear & Add
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add animation class after a small delay
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);

        // Handle button clicks
        dialog.querySelector('.btn-cancel').onclick = () => {
            this.closeDialog(dialog);
        };

        dialog.querySelector('.dialog-close').onclick = () => {
            this.closeDialog(dialog);
        };

        dialog.querySelector('.btn-append').onclick = () => {
            this.addTemplateToCanvas(template, 'append');
            this.closeDialog(dialog);
        };

        dialog.querySelector('.btn-clear').onclick = () => {
            this.addTemplateToCanvas(template, 'clear');
            this.closeDialog(dialog);
        };

        // Close dialog when clicking overlay
        dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
            this.closeDialog(dialog);
        });
    }

    closeDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
        }, 300); // Match this with CSS transition duration
    }

    addTemplateToCanvas(template, action) {
        console.log('Adding template:', template, 'Action:', action);

        try {
            if (action === 'clear') {
                this.canvas.clear();
            }

            if (template.type === 'svg') {
                fabric.loadSVGFromString(template.data, (objects, options) => {
                    const loadedObjects = fabric.util.groupSVGElements(objects, options);
                    if (action === 'append') {
                        loadedObjects.center();
                    }
                    this.canvas.add(loadedObjects);
                    this.canvas.requestRenderAll();
                    console.log('SVG template added');
                });
            } else {
                if (action === 'append') {
                    fabric.util.enlivenObjects(template.data.objects, (objects) => {
                        const group = new fabric.Group(objects, {
                            left: this.canvas.width / 2,
                            top: this.canvas.height / 2,
                            originX: 'center',
                            originY: 'center'
                        });
                        this.canvas.add(group);
                        this.canvas.requestRenderAll();
                        console.log('Fabric objects appended');
                    });
                } else {
                    this.canvas.loadFromJSON(template.data, () => {
                        this.canvas.requestRenderAll();
                        console.log('Fabric template loaded');
                    });
                }
            }

            if (this.canvas.history) {
                this.canvas.history.saveState();
            }
        } catch (error) {
            console.error('Error adding template:', error);
        }

        this.toggleSidebar();
    }
}