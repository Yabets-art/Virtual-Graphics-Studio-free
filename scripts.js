// Element Store - Define all shape elements and their properties
const ElementStore = {
    shapes: {},
    
    registerShape(key, config) {
        this.shapes[key] = {
            name: config.name,
            type: 'shape',
            icon: config.icon,
            fabricType: config.fabricType,
            createFunction: config.createFunction,
            defaultProps: config.defaultProps
        };
    },

    // Method to bulk register shapes
    registerShapes(shapesConfig) {
        Object.entries(shapesConfig).forEach(([key, config]) => {
            this.registerShape(key, config);
        });
    }
};

// Register basic shapes
ElementStore.registerShapes({
    rect: {
        name: 'Rectangle',
        icon: 'fa-square',
        fabricType: 'Rect',
        defaultProps: {
            width: 100,
            height: 100,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
            rx: 0,
            ry: 0
        }
    },
    circle: {
        name: 'Circle',
        icon: 'fa-circle',
        fabricType: 'Circle',
        defaultProps: {
            radius: 50,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2
        }
    },
        ellipse: {
            name: 'Ellipse',
            type: 'shape',
            icon: 'fa-ellipsis-h',
            fabricType: 'Ellipse',
            defaultProps: {
                rx: 75,
                ry: 50,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 2
            }
        },
        triangle: {
            name: 'Triangle',
            type: 'shape',
            icon: 'fa-play',
            fabricType: 'Triangle',
            defaultProps: {
                width: 100,
                height: 100,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 2
            }
        },
        line: {
            name: 'Line',
            type: 'shape',
            icon: 'fa-minus',
            fabricType: 'Line',
            defaultProps: {
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 0,
                stroke: '#000000',
                strokeWidth: 2
            }
        }
});

// Register custom shapes
ElementStore.registerShapes({
    polyline: {
        name: 'Polyline',
        icon: 'fa-draw-polygon',
        fabricType: 'custom',
        createFunction: 'createPolyline',
        defaultProps: {
            points: [],
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2,
            isDrawing: true
        }
    },
    // ... other custom shapes ...
});


/**
 * now u can add like this to make it easy 
 * editor.registerNewShape({
    key: 'newShape',
    name: 'New Shape',
    icon: 'fa-icon-name',
    fabricType: 'custom', // or any fabric.js type
    createFunction: 'createNewShape',
    creator: function(options) {
        // Shape creation logic
    },
    defaultProps: {
        // Default properties
    }
});
 */

class CanvasEditor {
    constructor() {
        this.initCanvas();
        this.initVariables();
        this.initManagers();
        this.initDefaults();
        this.initEventListeners();
        this.setActiveTool('select');
        this.initShapeMenu();
        this.initKeyboardShortcuts();
        this.isDrawingMode = false;
        this.currentShapeType = null;
        this.previousTool = null; 
        this.isPanning = false;
        this.initCanvasEvents();
        this.initDragAndResize();
        this.initIconMenu();
        this.initMenuClosing(); 
    }

    initMenuClosing() {
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            const shapeMenu = document.getElementById('shapeMenu');
            const iconMenu = document.getElementById('iconMenu');
            const shapeButton = document.querySelector('[data-tool="shape"]');
            const iconButton = document.querySelector('[data-tool="icon"]');

            // Check if click is outside both menus and their trigger buttons
            if (!e.target.closest('#shapeMenu') && 
                !e.target.closest('#iconMenu') && 
                !e.target.closest('[data-tool="shape"]') && 
                !e.target.closest('[data-tool="icon"]')) {
                
                // Hide both menus
                if (shapeMenu) shapeMenu.style.display = 'none';
                if (iconMenu) iconMenu.style.display = 'none';
            }
        });

        // Prevent menu closing when clicking inside the menus
        const menus = document.querySelectorAll('#shapeMenu, #iconMenu');
        menus.forEach(menu => {
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }


    initIconMenu() {
        const iconMenu = document.getElementById('iconMenu');
        const iconSearch = document.getElementById('iconSearch');
        const iconCategory = document.getElementById('iconCategory');
        const iconGrid = document.getElementById('iconGrid');

        // Show/hide icon menu
        document.querySelector('[data-tool="icon"]').addEventListener('click', () => {
            iconMenu.style.display = iconMenu.style.display === 'none' ? 'block' : 'none';
            // Generate categories and populate grid when opening
            this.generateCategories();
            this.populateIconGrid();
        });

        // Search functionality
        iconSearch.addEventListener('input', () => {
            this.populateIconGrid(iconSearch.value, iconCategory.value);
        });

        // Category filter
        iconCategory.addEventListener('change', () => {
            this.populateIconGrid(iconSearch.value, iconCategory.value);
        });
    }

    generateCategories() {
        const iconCategory = document.getElementById('iconCategory');
        // Get unique categories from IconStore
        const categories = new Set(['all']);
        
        Object.values(IconStore.icons).forEach(icon => {
            if (icon.category) {
                categories.add(icon.category);
            }
        });

        // Generate options
        iconCategory.innerHTML = Array.from(categories).map(category => {
            const displayName = category === 'all' ? 'All Categories' : 
                category.charAt(0).toUpperCase() + category.slice(1);
            return `<option value="${category}">${displayName}</option>`;
        }).join('');
    }

    populateIconGrid(search = '', category = 'all') {
        const iconGrid = document.getElementById('iconGrid');
        iconGrid.innerHTML = '';

        const gridContainer = document.createElement('div');
        gridContainer.className = 'icon-grid-container';

        Object.entries(IconStore.icons).forEach(([key, icon]) => {
            // Apply filters
            if (search && !icon.name.toLowerCase().includes(search.toLowerCase())) return;
            if (category !== 'all' && icon.category !== category) return;

            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            
            // Display icon based on type
            switch(icon.type) {
                case 'font':
                    iconItem.innerHTML = `<i class="fas fa-${key}"></i>`;
                    break;
                case 'unicode':
                    iconItem.innerHTML = `<span class="unicode-icon">${icon.unicode}</span>`;
                    break;
                case 'svg':
                    iconItem.innerHTML = icon.svg;
                    break;
            }

            iconItem.title = icon.name;
            iconItem.addEventListener('click', () => {
                this.addIcon(key);
            });

            gridContainer.appendChild(iconItem);
        });

        iconGrid.appendChild(gridContainer);
    }

    addIcon(iconKey) {
        const iconConfig = IconStore.icons[iconKey];
        if (!iconConfig) return;

        let icon;
        const commonProps = {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            ...iconConfig.defaultProps
        };

        switch(iconConfig.type) {
            case 'font':
                icon = new fabric.Text(iconConfig.unicode, {
                    ...commonProps,
                    fontFamily: iconConfig.fontFamily,
                });
                break;

            case 'unicode':
                icon = new fabric.Text(iconConfig.unicode, {
                    ...commonProps,
                    fontFamily: 'Arial' // Use a font that supports Unicode/Emoji
                });
                break;

            case 'svg':
                fabric.loadSVGFromString(iconConfig.svg, (objects, options) => {
                    const svgIcon = fabric.util.groupSVGElements(objects, options);
                    svgIcon.set(commonProps);
                    this.canvas.add(svgIcon);
                    this.canvas.setActiveObject(svgIcon);
                    this.canvas.requestRenderAll();
                });
                return; // Early return as SVG loading is asynchronous
        }

        if (icon) {
            this.canvas.add(icon);
            this.canvas.setActiveObject(icon);
            this.canvas.requestRenderAll();
        }

        // Hide icon menu after adding
        document.getElementById('iconMenu').style.display = 'none';

        // Save state
        if (this.history) {
            this.history.saveState();
        }
    }

    initDragAndResize() {
        this.initToolbarDrag();
        this.initCanvasObjectHandling();
    }

    initToolbarDrag() {
        const toolbarShapes = document.querySelectorAll('.shape-tool');
        
        toolbarShapes.forEach(shape => {
            shape.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('shapeType', shape.dataset.shape);
                this.isDragging = true;
            });

            shape.addEventListener('dragend', () => {
                this.isDragging = false;
            });
        });

        // Handle drag over canvas
        this.canvas.wrapperEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        // Handle drop on canvas
        this.canvas.wrapperEl.addEventListener('drop', (e) => {
            e.preventDefault();
            const shapeType = e.dataTransfer.getData('shapeType');
            if (shapeType) {
                const pointer = this.canvas.getPointer(e);
                this.createShapeAtPoint(shapeType, pointer);
            }
        });
    }

    initCanvasObjectHandling() {
        // Set default object controls
        fabric.Object.prototype.set({
            borderColor: '#2196F3',
            cornerColor: '#2196F3',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerStrokeColor: '#ffffff',
            borderScaleFactor: 2,
            padding: 5
        });

        // Custom control handlers
        this.canvas.on('object:moving', (e) => this.handleObjectMoving(e));
        this.canvas.on('object:scaling', (e) => this.handleObjectScaling(e));
        this.canvas.on('object:rotating', (e) => this.handleObjectRotating(e));
        this.canvas.on('object:modified', () => this.handleObjectModified());

        // Add snap to grid functionality
        this.initSnapToGrid();
    }

    handleObjectMoving(e) {
        const obj = e.target;
        const gridSize = 10; // Size of grid for snapping
        
        if (this.snapToGrid) {
            // Snap to grid
            obj.set({
                left: Math.round(obj.left / gridSize) * gridSize,
                top: Math.round(obj.top / gridSize) * gridSize
            });
        }

        // Keep object within canvas bounds
        this.keepObjectInBounds(obj);
    }

    handleObjectScaling(e) {
        const obj = e.target;
        const minSize = 5; // Minimum size in pixels
        
        // Prevent scaling smaller than minimum size
        if (obj.getScaledWidth() < minSize || obj.getScaledHeight() < minSize) {
            obj.setCoords();
            obj.scaleToWidth(minSize);
            obj.scaleToHeight(minSize);
        }

        // Keep object within canvas bounds while scaling
        this.keepObjectInBounds(obj);
    }

    handleObjectRotating(e) {
        const obj = e.target;
        
        // Snap to common angles (0, 45, 90, etc.)
        if (this.snapToGrid) {
            const snapAngle = 45;
            const angle = obj.angle;
            obj.set('angle', Math.round(angle / snapAngle) * snapAngle);
        }
    }

    handleObjectModified() {
        // Save state for undo/redo
        if (this.history) {
            this.history.saveState();
        }
    }

    keepObjectInBounds(obj) {
        const bound = obj.getBoundingRect(true, true);
        const canvas = this.canvas;
        
        // Calculate boundaries with padding
        const padding = 0;
        let left = bound.left;
        let top = bound.top;
        
        // Adjust horizontal position
        if (bound.left < padding) {
            left = padding;
        }
        if (bound.left + bound.width > canvas.width - padding) {
            left = canvas.width - bound.width - padding;
        }
        
        // Adjust vertical position
        if (bound.top < padding) {
            top = padding;
        }
        if (bound.top + bound.height > canvas.height - padding) {
            top = canvas.height - bound.height - padding;
        }
        
        // Update object position if needed
        if (left !== bound.left || top !== bound.top) {
            obj.set({
                left: left + (obj.left - bound.left),
                top: top + (obj.top - bound.top)
            });
            obj.setCoords();
        }
    }

    initSnapToGrid() {
        this.snapToGrid = false;
        
        // Add snap to grid toggle button
        const snapButton = document.getElementById('snapToGrid');
        if (snapButton) {
            snapButton.addEventListener('click', () => {
                this.snapToGrid = !this.snapToGrid;
                snapButton.classList.toggle('active');
            });
        }
    }

    createShapeAtPoint(shapeType, pointer) {
        const shapeConfig = ElementStore.shapes[shapeType];
        if (!shapeConfig) return;

        try {
            const defaultProps = {
                left: pointer.x,
                top: pointer.y,
                originX: 'center',
                originY: 'center',
                ...shapeConfig.defaultProps
            };

            const shape = ShapeFactory.createShape(shapeType, defaultProps);
            
            if (shape) {
                // Add resize controls
                this.addResizeControls(shape);
                
                this.canvas.add(shape);
                this.canvas.setActiveObject(shape);
                this.canvas.requestRenderAll();
                
                if (this.history) {
                    this.history.saveState();
                }
            }
        } catch (error) {
            console.error('Error creating shape:', error);
        }
    }

    addResizeControls(object) {
        // Add custom resize controls
        object.setControlsVisibility({
            mt: true,  // middle top
            mb: true,  // middle bottom
            ml: true,  // middle left
            mr: true,  // middle right
            tl: true,  // top left
            tr: true,  // top right
            bl: true,  // bottom left
            br: true   // bottom right
        });

        // Add custom control styles
        object.set({
            borderColor: '#2196F3',
            cornerColor: '#2196F3',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerStrokeColor: '#ffffff',
            padding: 5
        });
    }

    // Add this to your existing handleMouseDown method
    handleMouseDown(opt) {
        if (!this.isDrawingMode || !this.currentShapeType) return;
        
        const pointer = this.canvas.getPointer(opt.e);
        
        // Check if we clicked on an existing object
        const clickedObject = this.canvas.findTarget(opt.e);
        if (clickedObject) {
            // If we clicked an object, select it for dragging
            this.canvas.setActiveObject(clickedObject);
            return;
        }

        // Otherwise create a new shape
        this.isDrawing = true;
        this.startPoint = pointer;
        this.createShape(pointer);
    }

    initCanvasEvents() {
        this.canvas.on('mouse:down', (opt) => this.handleMouseDown(opt));
        this.canvas.on('mouse:move', (opt) => this.handleMouseMove(opt));
        this.canvas.on('mouse:up', () => this.handleMouseUp());
        this.canvas.on('mouse:dblclick', (opt) => this.handleDoubleClick(opt));

        // Pan event handlers
        let isDragging = false;
        let lastPosX, lastPosY;

        this.canvas.on('mouse:down', (opt) => {
            if (this.currentTool === 'pan') {
                isDragging = true;
                this.canvas.defaultCursor = 'grabbing';
                lastPosX = opt.e.clientX;
                lastPosY = opt.e.clientY;
            }
        });

        this.canvas.on('mouse:move', (opt) => {
            if (isDragging && this.currentTool === 'pan') {
                const e = opt.e;
                const vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                this.canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
            }
        });

        this.canvas.on('mouse:up', () => {
            isDragging = false;
            if (this.currentTool === 'pan') {
                this.canvas.defaultCursor = 'grab';
            }
        });

        // Handle hover states for objects
        this.canvas.on('mouse:over', (e) => {
            if (e.target && this.currentTool === 'select') {
                this.canvas.defaultCursor = 'move';
            }
        });

        this.canvas.on('mouse:out', (e) => {
            if (e.target && this.currentTool === 'select') {
                this.canvas.defaultCursor = 'default';
            }
        });
    }

    initCanvas() {
        this.canvas = new fabric.Canvas('mainCanvas', {
            width: window.innerWidth - 48,
            height: 600,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
            defaultCursor: 'default',
            hoverCursor: 'move',
            moveCursor: 'move',
            rotationCursor: 'crosshair',
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false,
            cornerColor: '#2196f3',
            borderColor: '#2196f3',
            borderScaleFactor: 2
        });
    }

    initVariables() {
        this.isPanning = false;
        this.lastPosX = 0;
        this.lastPosY = 0;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentShape = null;
        this.currentTool = 'select';
        this.currentShapeType = 'rect';
    }

    initManagers() {
        this.history = new HistoryManager(this.canvas);
        this.zoom = new ZoomManager(this.canvas);
        this.properties = new PropertiesEditor(this.canvas);
        this.contextMenu = new ContextMenu(this.canvas);
        this.cropTool = new ImageCropTool(this.canvas);
        this.exportManager = new ExportManager(this.canvas);
    }

    initDefaults() {
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#2196f3',
            cornerStyle: 'circle',
            cornerSize: 8,
            borderColor: '#2196f3',
            borderScaleFactor: 2,
            padding: 5,
            cornerStrokeColor: '#ffffff',
            hasRotatingPoint: true,
            lockRotation: false
        });
    }

    initEventListeners() {
        this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
        this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
        this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
        this.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));

        this.canvas.on('selection:created', e => this.properties.showProperties(e.selected[0]));
        this.canvas.on('selection:updated', e => this.properties.showProperties(e.selected[0]));
        this.canvas.on('selection:cleared', () => this.properties.hideProperties());

        this.canvas.on('object:modified', () => this.history.saveState());
        this.canvas.on('object:added', () => this.history.saveState());
        this.canvas.on('object:removed', () => this.history.saveState());

        window.addEventListener('resize', () => {
            this.canvas.setWidth(window.innerWidth - 48);
            this.canvas.renderAll();
        });

        this.initToolButtons();
        this.initKeyboardShortcuts();
        this.initZoomButtons();

        document.querySelector('[data-action="fit"]')?.addEventListener('click', () => {
            this.fitToScreen();
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                this.fitToScreen();
            }
        });
    }

    initToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                if (tool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.setActiveTool(tool);
                }
            });
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add toast styles if not already in CSS
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not in input field
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.ctrlKey || e.metaKey) { // Support both Ctrl and Command (Mac)
                switch (e.key.toLowerCase()) {
                    case 'a': // Select Tool
                        e.preventDefault();
                        this.setActiveTool('select');
                        this.updateToolbarState('select');
                        this.showToast('select is ready');
                        break;
                        
                    case 't': // Text Tool
                        e.preventDefault();
                        this.setActiveTool('text');
                        this.updateToolbarState('text');
                        this.showToast('text is ready');
                        break;
                        
                    case 's': // Shape Tool
                        e.preventDefault();
                        this.setActiveTool('shape');
                        this.updateToolbarState('shape');
                        this.showToast('shape is ready');
                        break;
                        
                    case 'd': // Draw Tool
                        e.preventDefault();
                        this.setActiveTool('draw');
                        this.updateToolbarState('draw');
                        this.showToast('draw is ready');
                        break;
                        
                    case 'i': // Image Tool or Icon Tool
                        e.preventDefault();
                        if(e.shiftKey) {
                            // Icon menu (Ctrl + Shift + I)
                            const iconMenu = document.getElementById('iconMenu');
                            const shapeMenu = document.getElementById('shapeMenu');
                            
                            if (shapeMenu) shapeMenu.style.display = 'none';
                            if (iconMenu) {
                                iconMenu.style.display =  'block';
                                if (iconMenu.style.display === 'block') {
                                    this.generateCategories();
                                    this.populateIconGrid();
                                }
                            }
                            this.showToast('Icon menu ' + (iconMenu.style.display === 'none' ? 'closed' : 'opened'));
                        } else {
                            this.setActiveTool('image');
                            this.updateToolbarState('image');
                        }
                        break;
                        
                    case 'c': // Copy or Crop Tool
                        e.preventDefault();
                        if (e.shiftKey) { 
                            this.setActiveTool('crop');
                            this.updateToolbarState('crop');
                        } else {
                            this.contextMenu.handleAction('copy');
                            this.showToast('Copied to clipboard');
                        }
                        break;
                    case 'c': //copy
                            e.preventDefault();
                            ContextMenu.handleAction('cut')
                        break;
                    case 'p': // Pan Tool
                        e.preventDefault();
                        this.setActiveTool('pan');
                        this.updateToolbarState('pan');
                        break;
                    case 0: // Zoom Reset
                        e.preventDefault();
                        this.zoom.setZoom(1);
                        break;
                    case 'z': //undo 
                        this.history.undo();
                        break;
                    case 'y' ://redo 
                        this.history.redo();
                        break;
                    case 'c': // Copy
                            e.preventDefault();
                            this.contextMenu.handleAction('copy');
                            this.showToast('Copied to clipboard');
                        break;

                    case 'x': // Cut
                        e.preventDefault();
                        this.contextMenu.handleAction('cut');
                        this.showToast('Cut to clipboard');
                        break;

                    case 'v': // Paste
                        e.preventDefault();
                        this.contextMenu.handleAction('paste');
                        this.showToast('Pasted from clipboard');
                        break;

                    case 'z': // Undo
                        e.preventDefault();
                        this.history.undo();
                        this.showToast('Undo');
                        break;

                    case 'y': // Redo
                        e.preventDefault();
                        this.history.redo();
                        this.showToast('Redo');
                        break;

                    case ' ': // Space for pan tool
                        e.preventDefault();
                        if (!this.isPanning) {
                            this.previousTool = this.currentTool;
                            this.isPanning = true;
                            this.setActiveTool('pan');
                            this.updateToolbarState('pan');
                            this.showToast('Pan tool activated');
                        }
                        break;
                    case 'b':
                        e.preventDefault();
                        document.getElementById('fontBold')?.click();
                        break;
                    case 'i':
                        e.preventDefault();
                        document.getElementById('fontItalic')?.click();
                        break;
                    case 'u':
                        e.preventDefault();
                        document.getElementById('fontUnderline')?.click();
                        break;
                }
            }
        });

        // Reset pan tool when space is released
        document.addEventListener('keyup', (e) => {
            if (e.key === ' ' && this.isPanning) {
                this.isPanning = false;
                this.setActiveTool(this.previousTool || 'select');
                this.updateToolbarState(this.previousTool || 'select');
                this.showToast('Pan tool deactivated');
            }
        });
    }

    updateToolbarState(tool) {
        // Update toolbar button states
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
    }

    setActiveTool(tool) {
        if (tool !== 'pan' && this.currentTool !== tool) {
            this.previousTool = this.currentTool;
        }
        this.currentTool = tool;
        
        // Update cursor and canvas state
        const container = document.querySelector('.canvas-container');
        
        // Remove all cursor classes
        container.classList.remove(
            'cursor-select',
            'cursor-text',
            'cursor-shape',
            'cursor-draw',
            'cursor-image',
            'cursor-crop',
            'cursor-pan',
            'cursor-icon',
            'cursor-move'
        );
        
        // Add the appropriate cursor class
        container.classList.add(`cursor-${tool}`);
        
        // Hide menus if not using their tools
        const shapeMenu = document.getElementById('shapeMenu');
        const iconMenu = document.getElementById('iconMenu');
        if (tool !== 'shape' && shapeMenu) shapeMenu.style.display = 'none';
        if (tool !== 'icon' && iconMenu) iconMenu.style.display = 'none';

        // Set canvas properties based on tool
        this.canvas.isDrawingMode = tool === 'draw';
        this.canvas.selection = tool === 'select';

        // Set appropriate canvas cursor based on tool
        switch(tool) {
            case 'select':
                this.canvas.defaultCursor = 'default';
                this.canvas.hoverCursor = 'move';
                this.canvas.moveCursor = 'move';
                break;
            case 'text':
                this.canvas.defaultCursor = 'text';
                this.canvas.hoverCursor = 'text';
                break;
            case 'shape':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                break;
            case 'draw':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                break;
            case 'image':
                this.canvas.defaultCursor = 'cell';
                this.canvas.hoverCursor = 'cell';
                break;
            case 'crop':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                break;
            case 'icon':
                this.canvas.defaultCursor = 'pointer';
                this.canvas.hoverCursor = 'pointer';
                break;
            case 'pan':
                this.canvas.defaultCursor = 'grab';
                this.canvas.hoverCursor = 'grab';
                this.canvas.selection = false;
                this.canvas.discardActiveObject();
                break;
            default:
                this.canvas.defaultCursor = 'default';
                this.canvas.hoverCursor = 'move';
        }

        // Update canvas
        this.canvas.renderAll();

        // Reset drawing mode when changing tools
        this.isDrawingMode = tool === 'shape';
        if (!this.isDrawingMode) {
            this.currentShapeType = null;
        }
    }

    initZoomButtons() {
        document.getElementById('zoomIn')?.addEventListener('click', () => {
            const newZoom = this.zoom.current + this.zoom.step;
            this.zoom.setZoom(newZoom);
        });

        document.getElementById('zoomOut')?.addEventListener('click', () => {
            const newZoom = this.zoom.current - this.zoom.step;
            this.zoom.setZoom(newZoom);
        });

        document.getElementById('zoomReset')?.addEventListener('click', () => {
            this.zoom.setZoom(1);
        });
    }



    handleMouseDown(opt) {
        if (!this.isDrawingMode || !this.currentShapeType) return;
        
        const pointer = this.canvas.getPointer(opt.e);
        this.isDrawing = true;
        this.startPoint = pointer;
        
        // Create initial shape at pointer location
        this.createShape(pointer);
    }

    handleMouseMove(opt) {
        if (!this.isDrawing || !this.currentShape) return;
        
        const pointer = this.canvas.getPointer(opt.e);
        this.updateShapeSize(pointer);
    }

    handleMouseUp() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        if (this.currentShape) {
            this.currentShape.setCoords();
            this.canvas.setActiveObject(this.currentShape);
            this.currentShape = null;
            
            // Reset drawing mode after creating a shape
            this.isDrawingMode = false;
            this.currentShapeType = null;
            
            // Switch back to select tool
            this.setActiveTool('select');
            
            // Save to history
            if (this.history) {
                this.history.saveState();
            }
        }
    }

    handleMouseWheel(opt) {
        const delta = opt.e.deltaY;
        let newZoom = this.zoom.current * (0.999 ** delta);
        newZoom = Math.min(Math.max(newZoom, this.zoom.min), this.zoom.max);
        const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
        this.zoom.setZoom(newZoom, point);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    initPanEvents() {
        let lastX, lastY;

        this.canvas.on('mouse:down', (opt) => {
            if (!this.isPanning) return;
            
            const evt = opt.e;
            this.canvas.defaultCursor = 'grabbing';
            lastX = evt.clientX;
            lastY = evt.clientY;
        });

        this.canvas.on('mouse:move', (opt) => {
            if (!this.isPanning || !opt.e.buttons) return;
            
            const evt = opt.e;
            const deltaX = evt.clientX - lastX;
            const deltaY = evt.clientY - lastY;

            // Pan the canvas
            const vpt = this.canvas.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            
            this.canvas.requestRenderAll();
            lastX = evt.clientX;
            lastY = evt.clientY;
        });

        this.canvas.on('mouse:up', () => {
            if (!this.isPanning) return;
            this.canvas.defaultCursor = 'grab';
        });
    }

    setActiveTool(tool) {
        if (tool !== 'pan' && this.currentTool !== tool) {
            this.previousTool = this.currentTool;
        }
        this.currentTool = tool;
        
        // Update cursor and canvas state
        const container = document.querySelector('.canvas-container');
        
        // Remove all cursor classes
        container.classList.remove(
            'cursor-select',
            'cursor-text',
            'cursor-shape',
            'cursor-draw',
            'cursor-image',
            'cursor-crop',
            'cursor-pan',
            'cursor-icon',
            'cursor-move'
        );
        
        // Add the appropriate cursor class
        container.classList.add(`cursor-${tool}`);
        
        // Hide menus if not using their tools
        const shapeMenu = document.getElementById('shapeMenu');
        const iconMenu = document.getElementById('iconMenu');
        if (tool !== 'shape' && shapeMenu) shapeMenu.style.display = 'none';
        if (tool !== 'icon' && iconMenu) iconMenu.style.display = 'none';

        // Set canvas properties based on tool
        this.canvas.isDrawingMode = tool === 'draw';
        this.canvas.selection = tool === 'select';
        this.updateCursor();

        if (tool !== 'crop' && this.cropTool && this.cropTool.active) {
            this.cropTool.deactivate();
        }

        // Set appropriate canvas cursor based on tool
        switch(tool) {
            case 'select':
                this.canvas.defaultCursor = 'default';
                this.canvas.hoverCursor = 'move';
                this.canvas.moveCursor = 'move';
                break;
            case 'text':
                this.canvas.defaultCursor = 'text';
                this.canvas.hoverCursor = 'text';
                this.addText();
                break;
            case 'shape':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                this.showShapeMenu();
                break;
            case 'draw':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                this.canvas.freeDrawingBrush.width = 2;
                this.canvas.freeDrawingBrush.color = '#000000';
                break;
            case 'image':
                this.canvas.defaultCursor = 'cell';
                this.canvas.hoverCursor = 'cell';
                this.addImage();
                break;
            case 'crop':
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.hoverCursor = 'crosshair';
                this.cropTool.activate();
                break;
            case 'icon':
                this.canvas.defaultCursor = 'pointer';
                this.canvas.hoverCursor = 'pointer';
                break;
            case 'pan':
                this.canvas.defaultCursor = 'grab';
                this.canvas.hoverCursor = 'grab';
                this.canvas.selection = false;
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
                break;
            default:
                this.canvas.defaultCursor = 'default';
                this.canvas.hoverCursor = 'move';
        }

        // Update canvas
        this.canvas.renderAll();

        // Reset drawing mode when changing tools
        this.isDrawingMode = tool === 'shape';
        if (!this.isDrawingMode) {
            this.currentShapeType = null;
        }
    }

    updateCursor() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        container.classList.remove('select', 'move', 'drawing', 'text', 'panning', 'cropping');
        
        switch(this.currentTool) {
            case 'select':
                container.classList.add('select');
                break;
            case 'move':
                container.classList.add('move');
                break;
            case 'shape':
                container.classList.add('drawing');
                break;
            case 'text':
                container.classList.add('text');
                break;
            case 'crop':
                container.classList.add('cropping');
                break;
            case 'pan':
                container.classList.add('panning');
                break;
        }
    }

    createShape(pointer) {
        const shapeType = this.currentShapeType || 'rect';
        const shapeConfig = ElementStore.shapes[shapeType];
        
        if (!shapeConfig) return;

        const initialProps = {
            left: pointer.x,
            top: pointer.y,
            originX: 'left',
            originY: 'top',
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2
        };

        try {
            switch(shapeConfig.fabricType) {
                case 'Line':
                    this.currentShape = new fabric.Line([
                        pointer.x, pointer.y, pointer.x, pointer.y
                    ], initialProps);
                    break;

                case 'Polyline':
                case 'Polygon':
                    this.currentShape = new fabric[shapeConfig.fabricType]([
                        { x: pointer.x, y: pointer.y }
                    ], {
                        ...initialProps,
                        fill: shapeConfig.fabricType === 'Polyline' ? 'transparent' : initialProps.fill
                    });
                    break;

                case 'Path':
                    this.currentShape = new fabric.Path(`M ${pointer.x} ${pointer.y}`, initialProps);
                    break;

                case 'custom':
                    if (shapeConfig.createFunction && this[shapeConfig.createFunction]) {
                        this.currentShape = this[shapeConfig.createFunction]({
                            ...initialProps,
                            ...shapeConfig.defaultProps
                        });
                    }
                    break;

                default:
                    // Handle basic shapes (Rect, Circle, Triangle, etc.)
                    this.currentShape = new fabric[shapeConfig.fabricType]({
                        ...initialProps,
                        ...this.getInitialShapeProps(shapeConfig.fabricType)
                    });
            }

            if (this.currentShape) {
                this.canvas.add(this.currentShape);
                if (this.properties) {
                    this.properties.setDefaultColors(this.currentShape);
                }
            }
        } catch (error) {
            console.error('Error creating shape:', error);
        }
    }

    getInitialShapeProps(fabricType) {
        const initialProps = {
            'Rect': { width: 0, height: 0, rx: 0, ry: 0 },
            'Circle': { radius: 0 },
            'Triangle': { width: 0, height: 0 },
            'Ellipse': { rx: 0, ry: 0 },
            'Line': { x1: 0, y1: 0, x2: 0, y2: 0 },
            'Polyline': { points: [] },
            'Polygon': { points: [] },
            'Star': { points: 5, outerRadius: 0, innerRadius: 0 }
        };
        return initialProps[fabricType] || {};
    }

    updateShapeSize(pointer) {
        if (!this.currentShape || !this.startPoint) return;

        const dx = pointer.x - this.startPoint.x;
        const dy = pointer.y - this.startPoint.y;
        const shapeType = this.currentShapeType || 'rect';
        const shapeConfig = ElementStore.shapes[shapeType];

        try {
            switch(shapeConfig.fabricType) {
                case 'Line':
                    this.currentShape.set({
                        x2: pointer.x,
                        y2: pointer.y
                    });
                    break;

                case 'Polyline':
                case 'Polygon':
                    const points = this.currentShape.points;
                    // Update last point or add new point
                    points[points.length - 1] = { x: pointer.x, y: pointer.y };
                    this.currentShape.set({ points: points });
                    break;

                case 'Path':
                    const path = this.currentShape.path;
                    if (path.length === 1) {
                        // If just started, add line to current point
                        path.push(['L', pointer.x, pointer.y]);
                    } else {
                        // Update last point
                        path[path.length - 1][1] = pointer.x;
                        path[path.length - 1][2] = pointer.y;
                    }
                    this.currentShape.set({ path: path });
                    break;

                case 'custom':
                    if (shapeConfig.updateFunction && this[shapeConfig.updateFunction]) {
                        this[shapeConfig.updateFunction](this.currentShape, pointer);
                    }
                    break;

                default:
                    // Handle basic shapes
                    this.updateBasicShape(this.currentShape, pointer, shapeConfig.fabricType);
            }

            this.canvas.renderAll();
        } catch (error) {
            console.error('Error updating shape:', error);
        }
    }

    updateBasicShape(shape, pointer, fabricType) {
        const dx = pointer.x - this.startPoint.x;
        const dy = pointer.y - this.startPoint.y;
        const width = Math.abs(dx);
        const height = Math.abs(dy);
        const left = Math.min(pointer.x, this.startPoint.x);
        const top = Math.min(pointer.y, this.startPoint.y);

        switch(fabricType) {
            case 'Rect':
            case 'Triangle':
                shape.set({
                    width,
                    height,
                    left,
                    top
                });
                break;

            case 'Circle':
                const radius = Math.sqrt(dx * dx + dy * dy) / 2;
                shape.set({
                    radius,
                    left: this.startPoint.x - radius,
                    top: this.startPoint.y - radius
                });
                break;

            case 'Ellipse':
                shape.set({
                    rx: width / 2,
                    ry: height / 2,
                    left: this.startPoint.x,
                    top: this.startPoint.y,
                    originX: 'center',
                    originY: 'center'
                });
                break;
        }
    }

    // Add this method to handle double-click for finishing polygons/polylines
    handleDoubleClick(opt) {
        if (!this.currentShape) return;
        
        const shapeConfig = ElementStore.shapes[this.currentShapeType];
        if (['Polyline', 'Polygon'].includes(shapeConfig.fabricType)) {
            this.finishShape();
        }
    }

    finishShape() {
        if (this.currentShape) {
            this.currentShape.setCoords();
            this.canvas.setActiveObject(this.currentShape);
            this.currentShape = null;
            this.isDrawing = false;
            this.setActiveTool('select');
        }
    }

    addText() {
        const text = new fabric.IText('Double click to edit', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 20,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            fill: '#000000'
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.requestRenderAll();
        if (this.history) this.history.saveState();
    }

    addImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    img.scaleToWidth(200);
                    this.canvas.add(img);
                    this.canvas.setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    showShapeMenu() {
        const shapeMenu = document.getElementById('shapeMenu');
        if (!shapeMenu) return;

        const shapeButton = document.querySelector('[data-tool="shape"]');
        if (!shapeButton) return;

        const rect = shapeButton.getBoundingClientRect();
        
        shapeMenu.style.display = 'flex';
        shapeMenu.style.top = (rect.bottom + 8) + 'px';
        shapeMenu.style.left = rect.left + 'px';
        
        // Initialize shape menu buttons if not already done
        if (!shapeMenu.hasAttribute('data-initialized')) {
            shapeMenu.querySelectorAll('[data-shape]').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.currentShapeType = btn.dataset.shape;
                    this.isDrawingMode = true;
                    shapeMenu.style.display = 'none';
                });
            });
            shapeMenu.setAttribute('data-initialized', 'true');
        }
    }

    initShapeMenu() {
        const shapeMenu = document.getElementById('shapeMenu');
        if (!shapeMenu) return;

        shapeMenu.innerHTML = '';

        // Create buttons for all registered shapes
        Object.entries(ElementStore.shapes).forEach(([key, shape]) => {
            const button = document.createElement('button');
            button.className = 'tool-btn';
            button.dataset.shape = key;
            button.title = shape.name;
            button.innerHTML = `<i class="fas ${shape.icon}"></i>`;
            
            button.addEventListener('click', () => {
                this.addShape(key);
                shapeMenu.style.display = 'none';
            });
            
            shapeMenu.appendChild(button);
        });
    }

    

    addShape(type) {
        try {
            const shape = ShapeFactory.createShape(type, {
                left: this.canvas.width / 2,
                top: this.canvas.height / 2,
                originX: 'center',
                originY: 'center'
            });

            if (shape) {
                // this.canvas.add(shape);
                // this.canvas.setActiveObject(shape);
                // this.canvas.requestRenderAll();
                
                if (this.properties) {
                    this.properties.setDefaultColors(shape);
                }
                if (this.history) {
                    this.history.saveState();
                }
            }
        } catch (error) {
            console.error('Error creating shape:', error);
        }
    }


    registerNewShape(config) {
        ElementStore.registerShape(config.key, config);
        if (config.fabricType === 'custom') {
            ShapeFactory.registerShapeCreator(config.createFunction, config.creator);
        }
        this.initShapeMenu();
    }

    createStar(options) {
        const points = [];
        const outerRadius = options.outerRadius;
        const innerRadius = options.innerRadius;
        const numPoints = options.points;

        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / numPoints;
            points.push({
                x: radius * Math.sin(angle),
                y: radius * Math.cos(angle)
            });
        }

        return new fabric.Polygon(points, options);
    }

    createPolygon(options) {
        const points = [];
        const sides = options.sides;
        const radius = options.radius;

        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            });
        }

        return new fabric.Polygon(points, options);
    }

    handleAction(action) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;

        switch(action) {
            case 'group':
                this.groupObjects();
                break;
            case 'ungroup':
                this.ungroupObjects();
                break;
            case 'bring-front':
                this.bringToFront();
                break;
            case 'send-back':
                this.sendToBack();
                break;
            case 'fit':
                this.fitToScreen();
                break;
            case 'crop':
                if (activeObject && activeObject.type === 'image') {
                    this.cropTool.activate();
                }
                break;
        }
        this.canvas.requestRenderAll();
        this.history.saveState();
    }

    groupObjects() {
        if (!this.canvas.getActiveObject()) return;
        if (this.canvas.getActiveObject().type !== 'activeSelection') return;

        const activeSelection = this.canvas.getActiveObject();
        activeSelection.toGroup();
        this.canvas.requestRenderAll();
    }

    ungroupObjects() {
        if (!this.canvas.getActiveObject()) return;
        if (this.canvas.getActiveObject().type !== 'group') return;

        const group = this.canvas.getActiveObject();
        group.toActiveSelection();
        this.canvas.requestRenderAll();
    }

    bringToFront() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.bringToFront();
            this.canvas.requestRenderAll();
        }
    }

    sendToBack() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.sendToBack();
            this.canvas.requestRenderAll();
        }
    }

    fitToScreen() {
        const objects = this.canvas.getObjects();
        if (objects.length === 0) return;

        const bounds = this.getObjectsBounds(objects);
        if (!bounds) return;

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const padding = 40;

        const scaleX = (canvasWidth - padding) / bounds.width;
        const scaleY = (canvasHeight - padding) / bounds.height;
        const scale = Math.min(scaleX, scaleY);

        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        const centerX = (canvasWidth - bounds.width * scale) / 2;
        const centerY = (canvasHeight - bounds.height * scale) / 2;

        const deltaX = centerX - bounds.left * scale;
        const deltaY = centerY - bounds.top * scale;

        objects.forEach(obj => {
            const originalLeft = obj.left;
            const originalTop = obj.top;
            
            obj.set({
                left: originalLeft + deltaX / scale,
                top: originalTop + deltaY / scale,
                scaleX: obj.scaleX * scale,
                scaleY: obj.scaleY * scale
            });
            obj.setCoords();
        });

        this.zoom.current = scale;
        this.zoom.updateZoomLevel();

        this.canvas.requestRenderAll();
        this.history.saveState();
    }

    getObjectsBounds(objects) {
        if (objects.length === 0) return null;

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        objects.forEach(obj => {
            const bounds = obj.getBoundingRect(true, true);
            minX = Math.min(minX, bounds.left);
            minY = Math.min(minY, bounds.top);
            maxX = Math.max(maxX, bounds.left + bounds.width);
            maxY = Math.max(maxY, bounds.top + bounds.height);
        });

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}

class HistoryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStates = 50;

        document.getElementById('undoButton').addEventListener('click', () => this.undo());
        document.getElementById('redoButton').addEventListener('click', () => this.redo());

        this.saveState();

        this.canvas.on('object:modified', () => this.saveState());
        this.canvas.on('object:added', () => this.saveState());
        this.canvas.on('object:removed', () => this.saveState());
    }

    saveState() {
        const currentState = this.canvas.toJSON(['selectable', 'hasControls']);
        const serializedState = JSON.stringify(currentState);

        const isDuplicate = this.undoStack.some(state => JSON.stringify(state) === serializedState);
        if (isDuplicate) {
            return;
        }

        this.undoStack.push(currentState);

        if (this.undoStack.length > this.maxStates) {
            this.undoStack.shift();
        }

        this.updateButtons();
    }

    undo() {
        if (this.undoStack.length > 1) {
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);

            const previousState = this.undoStack[this.undoStack.length - 1];
            this.loadState(previousState);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            this.loadState(nextState);
        }
    }

    loadState(state) {
        this.canvas.loadFromJSON(state, () => {
            this.canvas.getObjects().forEach(obj => {
                obj.setControlsVisibility({
                    mtr: true,
                    ml: true,
                    mr: true,
                    mt: true,
                    mb: true
                });
            });

            this.canvas.renderAll();
            this.updateButtons();
        });
    }

    updateButtons() {
        const undoBtn = document.getElementById('undoButton');
        const redoBtn = document.getElementById('redoButton');

        undoBtn.disabled = this.undoStack.length <= 1;
        redoBtn.disabled = this.redoStack.length === 0;
    }
}


class ZoomManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.current = 1;
        this.min = 0.1;
        this.max = 2;
        this.step = 0.1;
        this.init();
    }

    init() {
        this.updateZoomLevel();
    }

    setZoom(zoomLevel, point) {
        this.current = Math.min(Math.max(zoomLevel, this.min), this.max);
        
        if (point) {
            this.canvas.zoomToPoint(point, this.current);
        } else {
            this.canvas.setZoom(this.current);
        }
        
        this.updateZoomLevel();
        this.canvas.requestRenderAll();
    }

    updateZoomLevel() {
        const percentage = Math.round(this.current * 100);
        document.getElementById('zoomValue').textContent = `${percentage}%`;
        
        document.getElementById('zoomIn').disabled = this.current >= this.max;
        document.getElementById('zoomOut').disabled = this.current <= this.min;
    }
}

class PropertiesEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.panel = null;
        this.isEditing = false;
        this.init();
        this.loadGoogleFonts();
    }

    loadGoogleFonts() {
        const googleFonts = [
            'Roboto',
            'Open Sans',
            'Lato',
            'Montserrat',
            'Raleway',
            'Oswald',
            'Poppins'
        ];

        // Create link element for Google Fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${googleFonts.join('&family=')}&display=swap`;
        document.head.appendChild(link);
    }

    init() {
        this.panel = document.getElementById('propertiesEditor');
        if (!this.panel) {
            console.error('Properties panel not found');
            return;
        }
        
        this.elements = {
            posX: document.getElementById('posX'),
            posY: document.getElementById('posY'),
            objWidth: document.getElementById('objWidth'),
            objHeight: document.getElementById('objHeight'),
            rotation: document.getElementById('rotation'),
            scaleX: document.getElementById('scaleX'),
            scaleY: document.getElementById('scaleY'),
            skewX: document.getElementById('skewX'),
            skewY: document.getElementById('skewY'),
            flipX: document.getElementById('flipX'),
            flipY: document.getElementById('flipY'),

            // Style properties
            fillColor: document.getElementById('fillColor'),
            strokeColor: document.getElementById('strokeColor'),
            strokeWidth: document.getElementById('strokeWidth'),
            opacity: document.getElementById('opacity'),
            fontSize: document.getElementById('fontSize'),
            fontFamily: document.getElementById('fontFamily'),
            fontWeight: document.getElementById('fontWeight'),
            textAlign: document.getElementById('textAlign'),
            lineHeight: document.getElementById('lineHeight'),
            charSpacing: document.getElementById('charSpacing'),
            borderRadius: document.getElementById('borderRadius')
        };

        this.setupEventListeners();
        this.setupInputHandlers();
        this.setupPanelClickHandlers();
        this.setupGroupToggles();
        this.initializeColorControls();
        this.setupTextControls();
        this.setupTransformControls();
        this.initBorderRadiusControls();
        this.initTextControls();
        this.initBorderRadiusControl();
    }

    setupInput(element, property, type, step = 1) {
        if (!element) return;

        const updateFunction = (value) => {
            const obj = this.canvas.getActiveObject();
            if (!obj) return;

            switch (property) {
                case 'fontSize':
                    obj.set(property, parseInt(value, 10));
                    break;
                case 'fontFamily':
                case 'fontStyle':
                case 'textAlign':
                    obj.set(property, value);
                    break;
                case 'lineHeight':
                    obj.set(property, parseFloat(value));
                    break;
                case 'charSpacing':
                    obj.set(property, parseInt(value, 10));
                    break;
                default:
                    obj.set(property, value);
            }

            this.canvas.requestRenderAll();
        };

        element.addEventListener('change', (e) => updateFunction(e.target.value));
        element.addEventListener('input', (e) => updateFunction(e.target.value));
    }

        // Add this method to the PropertiesEditor class
        updatePropertyValuesRealTime(obj) {
            if (!obj) return;
    
            // Update basic properties in real-time
            Object.entries(this.elements).forEach(([key, element]) => {
                if (!element) return;
    
                // Skip update if element is focused (being edited)
                if (document.activeElement === element) {
                    return;
                }
    
                let value;
                switch (key) {
                    case 'posX':
                        value = Math.round(obj.left) || 0;
                        break;
                    case 'posY':
                        value = Math.round(obj.top) || 0;
                        break;
                    case 'objWidth':
                        value = Math.round(obj.width * obj.scaleX) || 0;
                        break;
                    case 'objHeight':
                        value = Math.round(obj.height * obj.scaleY) || 0;
                        break;
                    default:
                        value = obj[key] || 0;
                }
    
                // Update input value
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            });
        }

    setupEventListeners() {

        this.canvas.on('object:moving', (e) => {
            this.updatePropertyValuesRealTime(e.target);
        });

        this.canvas.on('object:scaling', (e) => {
            this.updatePropertyValuesRealTime(e.target);
        });

        this.canvas.on('object:rotating', (e) => {
            this.updatePropertyValuesRealTime(e.target);
        });
    
        this.canvas.on('selection:created', (e) => {
            if (!this.isEditing) {
                this.showProperties(e.selected[0]);
            }
        });

        this.canvas.on('selection:updated', (e) => {
            if (!this.isEditing) {
                this.showProperties(e.selected[0]);
            }
        });

        this.canvas.on('selection:cleared', () => {
            if (!this.isEditing) {
                this.hideProperties();
            }
        });

        // Add click handler for the close button
        const closeBtn = document.getElementById('closeProperties');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isEditing) {
                    this.hideProperties();
                }
            });
        }
    }

    setupPanelClickHandlers() {
        this.panel.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        // Prevent panel from closing when clicking inputs
        this.panel.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.isEditing = true;
            });

            input.addEventListener('blur', () => {
                this.isEditing = false;
            });
        });
    }

    setupInputHandlers() {
        // Transform properties
        this.setupInput(this.elements.posX, 'left', 'number');
        this.setupInput(this.elements.posY, 'top', 'number');
        this.setupInput(this.elements.objWidth, 'width', 'number');
        this.setupInput(this.elements.objHeight, 'height', 'number');
        this.setupInput(this.elements.rotation, 'angle', 'number');
        this.setupInput(this.elements.scaleX, 'scaleX', 'number', 0.1);
        this.setupInput(this.elements.scaleY, 'scaleY', 'number', 0.1);
        this.setupInput(this.elements.skewX, 'skewX', 'number');
        this.setupInput(this.elements.skewY, 'skewY', 'number');
        this.setupInput(this.elements.flipX, 'flipX', 'boolean');
        this.setupInput(this.elements.flipY, 'flipY', 'boolean');

        // Style properties
        this.setupInput(this.elements.fillColor, 'fill', 'color');
        this.setupInput(this.elements.strokeColor, 'stroke', 'color');
        this.setupInput(this.elements.strokeWidth, 'strokeWidth', 'number');
        this.setupInput(this.elements.opacity, 'opacity', 'number', 0.01);
        this.setupInput(this.elements.fontSize, 'fontSize', 'number');
        this.setupInput(this.elements.fontFamily, 'fontFamily', 'select');
        this.setupInput(this.elements.fontWeight, 'fontWeight', 'select');
        this.setupInput(this.elements.textAlign, 'textAlign', 'select');
        this.setupInput(this.elements.lineHeight, 'lineHeight', 'number', 0.1);
        this.setupInput(this.elements.charSpacing, 'charSpacing', 'number');
        this.setupInput(this.elements.borderRadius, 'borderRadius', 'number');
    }

    setupGroupToggles() {
        document.querySelectorAll('.property-group-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('i');
                
                // Toggle content visibility
                if (content) {
                    const isVisible = content.style.display !== 'none';
                    content.style.display = isVisible ? 'none' : 'block';
                    
                    // Toggle icon rotation
                    if (icon) {
                        icon.classList.toggle('fa-chevron-down');
                        icon.classList.toggle('fa-chevron-up');
                    }
                    
                    // Toggle header class for styling
                    header.classList.toggle('collapsed');
                }
            });
        });
    }

    updatePropertyValues(obj) {
        if (!obj) return;

        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) return;

            // Skip update if element is focused (being edited)
            if (document.activeElement === element) {
                return;
            }

            let value;
            switch (key) {
                case 'text':
                    value = obj.text || '';
                    break;
                case 'left':
                case 'top':
                    value = Math.round(obj[key]) || 0;
                    break;
                case 'width':
                    value = Math.round(obj.width * obj.scaleX) || 0;
                    break;
                case 'height':
                    value = Math.round(obj.height * obj.scaleY) || 0;
                    break;
                case 'angle':
                    value = (obj.angle || 0) % 360;
                    break;
                case 'opacity':
                    value = obj.opacity || 1;
                    break;
                default:
                    value = obj[key] || 0;
            }

            // Update input value
            if (element.type === 'checkbox') {
                element.checked = value;
            } //else {
            //     element.value = value ;
            // }

            // Update any associated display elements
            const display = element.nextElementSibling;
            if (display && display.classList.contains('property-value')) {
                if (key === 'opacity') {
                    display.textContent = `${Math.round(value * 100)}%`;
                } else if (key === 'angle') {
                    display.textContent = `${Math.round(value)}°`;
                }
            }
        });

        // Update text properties if object is text
        if (obj.text) {
            // Update font family
            const fontFamily = document.getElementById('fontFamily');
            if (fontFamily) {
                fontFamily.value = obj.fontFamily;
            }

            // Update font style buttons
            const fontBold = document.getElementById('fontBold');
            const fontItalic = document.getElementById('fontItalic');
            const fontUnderline = document.getElementById('fontUnderline');

            if (fontBold) {
                fontBold.classList.toggle('active', obj.fontWeight === 'bold');
            }
            if (fontItalic) {
                fontItalic.classList.toggle('active', obj.fontStyle === 'italic');
            }
            if (fontUnderline) {
                fontUnderline.classList.toggle('active', obj.underline === true);
            }

            // Update text transform
            const textTransform = document.getElementById('textTransform');
            if (textTransform) {
                // Try to detect current transform
                const text = obj.text;
                if (text === text.toUpperCase()) textTransform.value = 'uppercase';
                else if (text === text.toLowerCase()) textTransform.value = 'lowercase';
                else if (text.match(/^[A-Z]/)) textTransform.value = 'capitalize';
                else textTransform.value = 'normal';
            }
        }

        // Update border radius for rectangles
        if (obj.type === 'rect') {
            const value = obj.rx || 0;
            ['TL', 'TR', 'BL', 'BR'].forEach(corner => {
                const input = document.getElementById(`borderRadius${corner}`);
                if (input) {
                    input.value = value;
                }
            });
        }

        // Update flip buttons state
        const flipX = document.getElementById('flipX');
        const flipY = document.getElementById('flipY');

        if (flipX) {
            flipX.classList.toggle('active', obj.flipX);
        }
        if (flipY) {
            flipY.classList.toggle('active', obj.flipY);
        }
    }

    showProperties(obj) {
        if (!obj) return;

        this.panel.classList.add('active');
        this.updatePropertyValues(obj);
    }


    updatePropertyValues(obj) {
        if (!obj) return;

        // Update border radius for rectangles
        if (obj.type === 'rect') {
            const borderRadius = document.getElementById('borderRadius');
            if (borderRadius) {
                borderRadius.value = obj.rx || 0;
            }
        }

        // Update text properties only for text objects
        const isText = obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox';
        if (isText) {
            // Update text transform
            const textTransform = document.getElementById('textTransform');
            if (textTransform) {
                const text = obj.text;
                if (text === text.toUpperCase()) textTransform.value = 'uppercase';
                else if (text === text.toLowerCase()) textTransform.value = 'lowercase';
                else if (text.match(/^[A-Z]/)) textTransform.value = 'capitalize';
                else textTransform.value = 'normal';
            }

            // Update alignment buttons
            const alignMap = {
                left: 'alignLeft',
                center: 'alignCenter',
                right: 'alignRight',
                justify: 'alignJustify'
            };

            Object.entries(alignMap).forEach(([alignment, btnId]) => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.classList.toggle('active', obj.textAlign === alignment);
                }
            });

            // Update font style buttons
            const fontBold = document.getElementById('fontBold');
            const fontItalic = document.getElementById('fontItalic');
            const fontUnderline = document.getElementById('fontUnderline');

            if (fontBold) fontBold.classList.toggle('active', obj.fontWeight === 'bold');
            if (fontItalic) fontItalic.classList.toggle('active', obj.fontStyle === 'italic');
            if (fontUnderline) fontUnderline.classList.toggle('active', obj.underline === true);
        }
    }

    hideProperties() {
        if (this.isEditing) return;
        
        if (this.panel) {
            this.panel.classList.remove('active');
        }
    }

    setDefaultColors(shape) {
        if (!shape) return;
        
        const fillColorInput =  "#fff" // or use this document.getElementById('fillColor');
        const strokeColorInput = document.getElementById('strokeColor');
        
        if (fillColorInput && fillColorInput.value) {
            shape.set('fill', formatColor(fillColorInput.value));
        }
        
        if (strokeColorInput && strokeColorInput.value) {
            shape.set('stroke', formatColor(strokeColorInput.value));
        }
    }

    isValidBounds(bounds) {
        return bounds && 
               isFinite(bounds.left) && 
               isFinite(bounds.top) && 
               isFinite(bounds.width) && 
               isFinite(bounds.height) &&
               bounds.width > 0 &&
               bounds.height > 0;
    }

    // Add this helper method to format numbers
    formatNumber(value, decimals = 0) {
        return Number(parseFloat(value).toFixed(decimals));
    }

    getValidValue(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    initializeColorControls() {
        document.getElementById('fillColor')?.addEventListener('input', (e) => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                const color = formatColor(e.target.value);
                activeObject.set('fill', color);
                this.canvas.requestRenderAll();
            }
        });

        // Border/Stroke color control
        document.getElementById('strokeColor')?.addEventListener('input', (e) => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                const color = formatColor(e.target.value);
                activeObject.set('stroke', color);
                this.canvas.requestRenderAll();
            }
        });

        // Update color inputs when object is selected
        this.canvas.on('selection:created', (e) => this.updateColorInputs(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.updateColorInputs(e.selected[0]));
    }

    updateColorInputs(object) {
        if (!object) return;

        const fillColorInput = document.getElementById('fillColor');
        const strokeColorInput = document.getElementById('strokeColor');

        if (fillColorInput && object.fill && typeof object.fill === 'string') {
            fillColorInput.value = formatColor(object.fill);
        }

        if (strokeColorInput && object.stroke && typeof object.stroke === 'string') {
            strokeColorInput.value = formatColor(object.stroke);
        }
    }

    setupTextControls() {
        // Font Style Controls
        const fontBold = document.getElementById('fontBold');
        const fontItalic = document.getElementById('fontItalic');
        const fontUnderline = document.getElementById('fontUnderline');

        // Bold
        fontBold?.addEventListener('click', () => {
            const obj = this.canvas.getActiveObject();
            if (!obj || !obj.text) return;
            
            const isBold = obj.get('fontWeight') === 'bold';
            obj.set({
                fontWeight: isBold ? 'normal' : 'bold'
            });
            fontBold.classList.toggle('active', !isBold);
            this.canvas.requestRenderAll();
            if (this.history) this.history.saveState();
        });

        // Italic
        fontItalic?.addEventListener('click', () => {
            const obj = this.canvas.getActiveObject();
            if (!obj || !obj.text) return;
            
            const isItalic = obj.get('fontStyle') === 'italic';
            obj.set({
                fontStyle: isItalic ? 'normal' : 'italic'
            });
            fontItalic.classList.toggle('active', !isItalic);
            this.canvas.requestRenderAll();
            if (this.history) this.history.saveState();
        });

        // Underline
        fontUnderline?.addEventListener('click', () => {
            const obj = this.canvas.getActiveObject();
            if (!obj || !obj.text) return;
            
            const isUnderline = obj.get('underline');
            obj.set({
                underline: !isUnderline
            });
            fontUnderline.classList.toggle('active', !isUnderline);
            this.canvas.requestRenderAll();
            if (this.history) this.history.saveState();
        });
    }

    // Update the addText method in your CanvasEditor class
    addText() {
        const text = new fabric.IText('Double click to edit', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 20,
            fontFamily: 'Arial',
            fontWeight: 'normal', // Initialize with normal weight
            fontStyle: 'normal', // Initialize with normal style
            underline: false,    // Initialize with no underline
            fill: '#000000',
            textAlign: 'left'
        });

        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.requestRenderAll();
        if (this.history) this.history.saveState();
    }

    setupTransformControls() {
        // Flip X and Y controls
        const flipX = document.getElementById('flipX');
        const flipY = document.getElementById('flipY');

        flipX?.addEventListener('click', () => {
            const obj = this.canvas.getActiveObject();
            if (!obj) return;
            
            obj.set('flipX', !obj.flipX);
            flipX.classList.toggle('active', obj.flipX);
            this.canvas.requestRenderAll();
            if (this.history) this.history.saveState();
        });

        flipY?.addEventListener('click', () => {
            const obj = this.canvas.getActiveObject();
            if (!obj) return;
            
            obj.set('flipY', !obj.flipY);
            flipY.classList.toggle('active', obj.flipY);
            this.canvas.requestRenderAll();
            if (this.history) this.history.saveState();
        });
    }

    initBorderRadiusControls() {
        const corners = ['TL', 'TR', 'BL', 'BR'];
        const linkButton = document.getElementById('linkCorners');
        this.linkedCorners = true;

        // Toggle link state
        linkButton?.addEventListener('click', () => {
            this.linkedCorners = !this.linkedCorners;
            linkButton.classList.toggle('active');
            const icon = linkButton.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-link');
                icon.classList.toggle('fa-unlink');
            }
        });

        // Handle corner input changes
        corners.forEach(corner => {
            const input = document.getElementById(`borderRadius${corner}`);
            if (!input) return;

            input.addEventListener('input', (e) => {
                const obj = this.canvas.getActiveObject();
                if (!obj || obj.type !== 'rect') return;

                const value = parseInt(e.target.value) || 0;

                if (this.linkedCorners) {
                    // Update all corners
                    corners.forEach(c => {
                        const cornerInput = document.getElementById(`borderRadius${c}`);
                        if (cornerInput) {
                            cornerInput.value = value;
                        }
                        // Set both rx and ry for each corner
                        obj.set(`rx${c.toLowerCase()}`, value);
                        obj.set(`ry${c.toLowerCase()}`, value);
                    });
                } else {
                    // Update only this corner
                    obj.set(`rx${corner.toLowerCase()}`, value);
                    obj.set(`ry${corner.toLowerCase()}`, value);
                }

                this.canvas.requestRenderAll();
                if (this.history) this.history.saveState();
            });
        });
    }

    updatePropertyValues(obj) {
        if (!obj) return

        // Show/hide border radius controls for rectangles
        const borderRadiusGroup = document.querySelector('.property-group:has([id^="borderRadius"])');
        if (borderRadiusGroup) {
            borderRadiusGroup.style.display = obj.type === 'rect' ? 'block' : 'none';
        }

        const textProperties = document.querySelector('.property-group:has([id^="text"])');
        if (textProperties) {
            const isText = obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox';
            textProperties.style.display = isText ? 'block' : 'none';
        }
    }

    // Add this method to create rectangles with proper border radius support
    createRectangle(options = {}) {
        const rect = new fabric.Rect({
            left: options.left || this.canvas.width / 2,
            top: options.top || this.canvas.height / 2,
            width: options.width || 100,
            height: options.height || 100,
            fill: options.fill || '#ffffff',
            stroke: options.stroke || '#000000',
            strokeWidth: options.strokeWidth || 1,
            // Initialize all corner radii
            rxTL: 0,
            ryTL: 0,
            rxTR: 0,
            ryTR: 0,
            rxBL: 0,
            ryBL: 0,
            rxBR: 0,
            ryBR: 0
        });

        return rect;
    }

    initTextControls() {
        // Text case transform
        const textTransform = document.getElementById('textTransform');
        if (textTransform) {
            textTransform.addEventListener('change', (e) => {
                const obj = this.canvas.getActiveObject();
                const isText = obj && (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox');
                if (!isText) return;

                let text = obj.text;
                switch(e.target.value) {
                    case 'uppercase':
                        text = text.toUpperCase();
                    break;
                    case 'lowercase':
                        text = text.toLowerCase();
                    break;
                    case 'capitalize':
                        text = text.replace(/\b\w/g, l => l.toUpperCase());
                    break;
                }
                obj.set('text', text);
                this.canvas.requestRenderAll();
            });
        }

        // Text alignment
        ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;

            btn.addEventListener('click', () => {
                const obj = this.canvas.getActiveObject();
                const isText = obj && (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox');
                if (!isText) return;

                const alignment = id.replace('align', '').toLowerCase();
                
                // Remove active class from all alignment buttons
                ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'].forEach(btnId => {
                    document.getElementById(btnId)?.classList.remove('active');
                });

                btn.classList.add('active');
                obj.set('textAlign', alignment);
                this.canvas.requestRenderAll();
            });
        });
    }

    initBorderRadiusControl() {
        const borderRadius = document.getElementById('borderRadius');
        if (!borderRadius) return;

        borderRadius.addEventListener('input', (e) => {
            const obj = this.canvas.getActiveObject();
            if (!obj || obj.type !== 'rect') return;

            const value = parseInt(e.target.value) || 0;
            obj.set({
                rx: value,
                ry: value
            });
            this.canvas.requestRenderAll();
        });
    }

    updateValues(obj) {
        // ... other value updates ...

        // Update border radius for rectangles
        if (obj.type === 'rect') {
            const borderRadius = document.getElementById('borderRadius');
            if (borderRadius) {
                borderRadius.value = obj.rx || 0;
            }
        }

        // Update text alignment
        if (obj.isType('text')) {
            const alignButtons = {
                alignLeft: 'left',
                alignCenter: 'center',
                alignRight: 'right',
                alignJustify: 'justify'
            };

            Object.entries(alignButtons).forEach(([btnId, alignment]) => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.classList.toggle('active', obj.textAlign === alignment);
                }
            });

            // Update text transform
            const textTransform = document.getElementById('textTransform');
            if (textTransform) {
                const text = obj.text;
                if (text === text.toUpperCase()) textTransform.value = 'uppercase';
                else if (text === text.toLowerCase()) textTransform.value = 'lowercase';
                else if (text.match(/^[A-Z]/)) textTransform.value = 'capitalize';
                else textTransform.value = 'normal';
            }
        }
    }
   
}

class ContextMenu {
    constructor(canvas) {
        this.canvas = canvas;
        this.element = null;
        this.clipboard = null;
        this.init();
    }

    init() {
        this.element = document.getElementById('contextMenu');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.wrapperEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const activeObject = this.canvas.getActiveObject();
            this.show(e, activeObject);
        });

        this.canvas.on('mouse:down', () => this.hide());

        this.element.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleAction(action);
                this.hide();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hide();
            }
        });
    }

    show(e, activeObject) {
        const menu = this.element;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        menu.style.display = 'block';
        
        const menuHeight = menu.offsetHeight;
        const menuWidth = menu.offsetWidth;
        
        let top = e.clientY;
        let left = e.clientX;
        
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight - 10;
        }
        
        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - 10;
        }
        
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        
        this.updateMenuState(activeObject);
    }

    hide() {
        this.element.style.display = 'none';
    }

    handleAction(action) {
            const activeObject = this.canvas.getActiveObject();
        
        switch(action) {
            case 'copy':
            if (activeObject) {
                    activeObject.clone((cloned) => {
                        this.clipboard = cloned;
                    });
                }
                break;

            case 'cut':
                if (activeObject) {
                    activeObject.clone((cloned) => {
                        this.clipboard = cloned;
                        this.canvas.remove(activeObject);
                this.canvas.requestRenderAll();
                    });
                }
                break;

            case 'paste':
                if (this.clipboard) {
                    this.clipboard.clone((cloned) => {
                        cloned.set({
                            left: cloned.left + 10,
                            top: cloned.top + 10,
                            evented: true,
                        });
                        this.canvas.add(cloned);
                        this.canvas.setActiveObject(cloned);
                        this.canvas.requestRenderAll();
                    });
                }
                break;

            case 'delete':
            if (activeObject) {
                    this.canvas.remove(activeObject);
                this.canvas.requestRenderAll();
            }
                break;

            case 'bring-front':
                if (activeObject) {
                    activeObject.bringToFront();
                    this.canvas.requestRenderAll();
                }
                break;

            case 'send-back':
                if (activeObject) {
                    activeObject.sendToBack();
                    this.canvas.requestRenderAll();
                }
                break;

            case 'group':
                if (activeObject && activeObject.type === 'activeSelection') {
                    activeObject.toGroup();
                    this.canvas.requestRenderAll();
                }
                break;

            case 'ungroup':
                if (activeObject && activeObject.type === 'group') {
                    activeObject.toActiveSelection();
                    this.canvas.requestRenderAll();
                }
                break;

            case 'fit':
                window.editor.fitToScreen();
                break;

            case 'crop':
                if (activeObject && activeObject.type === 'image') {
                    window.editor.cropTool.activate();
                }
                break;
        }
    }

    updateMenuState(activeObject) {
        const items = this.element.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            const action = item.dataset.action;
            let enabled = true;

            switch(action) {
                case 'copy':
                case 'cut':
                case 'delete':
                case 'bring-front':
                case 'send-back':
                    enabled = !!activeObject;
                    break;
                case 'paste':
                    enabled = !!this.clipboard;
                    break;
                case 'group':
                    enabled = activeObject && activeObject.type === 'activeSelection';
                    break;
                case 'ungroup':
                    enabled = activeObject && activeObject.type === 'group';
                    break;
                case 'crop':
                    enabled = activeObject && activeObject.type === 'image';
                    break;
                case 'fit':
                    enabled = this.canvas.getObjects().length > 0;
                    break;
            }

            item.classList.toggle('disabled', !enabled);
        });
    }
}

class ImageCropTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.active = false;
        this.cropRect = null;
        this.originalImage = null;
    }

    activate() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') {
            alert('Please select an image to crop');
            return;
        }

        this.active = true;
        this.originalImage = activeObject;
        
        this.canvas.selection = false;
        this.canvas.discardActiveObject();

        const imgBounds = this.originalImage.getBoundingRect();
        this.cropRect = new fabric.Rect({
            left: imgBounds.left,
            top: imgBounds.top,
            width: imgBounds.width,
            height: imgBounds.height,
            fill: 'rgba(0,0,0,0.3)',
            stroke: '#2196f3',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            cornerColor: '#2196f3',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            transparentCorners: true,
            hasRotatingPoint: true
        });

        this.canvas.add(this.cropRect);
        this.canvas.setActiveObject(this.cropRect);
        this.canvas.renderAll();

        this.addCropControls();
    }

    deactivate() {
        if (!this.active) return;

        this.active = false;
        if (this.cropRect) {
            this.canvas.remove(this.cropRect);
        }

        const controls = document.getElementById('cropControls');
        if (controls) {
            controls.remove();
        }

        this.canvas.selection = true;
        this.canvas.renderAll();
    }

    applyCrop() {
        if (!this.cropRect || !this.originalImage) return;

        const rect = this.cropRect;
        const image = this.originalImage;

        const imageElement = image.getElement();
        const imgWidth = imageElement.naturalWidth;
        const imgHeight = imageElement.naturalHeight;

        const imgBounds = image.getBoundingRect();
        const cropBounds = rect.getBoundingRect();

        const left = Math.max(0, (cropBounds.left - imgBounds.left) / image.scaleX);
        const top = Math.max(0, (cropBounds.top - imgBounds.top) / image.scaleY);
        const width = Math.min(imgWidth, cropBounds.width / image.scaleX);
        const height = Math.min(imgHeight, cropBounds.height / image.scaleY);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imageElement,
            left, top, width, height,
            0, 0, width, height
        );

        fabric.Image.fromURL(canvas.toDataURL(), (croppedImg) => {
            croppedImg.set({
                left: cropBounds.left -100,
                top: cropBounds.top -100,
                scaleX: 0.2,
                scaleY: 0.2
            });

            this.canvas.remove(this.originalImage);
            this.canvas.add(croppedImg);
            this.canvas.setActiveObject(croppedImg);
            this.deactivate();
        });
    }

    addCropControls() {
        const existingControls = document.getElementById('cropControls');
        if (existingControls) {
            existingControls.remove();
        }

        const controls = document.createElement('div');
        controls.id = 'cropControls';
        controls.style.cssText = `
            position: fixed;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply Crop';
        applyBtn.className = 'btn btn-primary';
        applyBtn.onclick = () => this.applyCrop();

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.onclick = () => this.deactivate();

        controls.appendChild(applyBtn);
        controls.appendChild(cancelBtn);
        document.body.appendChild(controls);
    }
}

class ExportManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Export handlers
        document.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exportType = e.currentTarget.dataset.export;
                this.handleExport(exportType);
            });
        });

        // Share handlers
        document.querySelectorAll('[data-share]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shareType = e.currentTarget.dataset.share;
                this.handleShare(shareType);
            });
        });
    }

    handleExport(type) {
        const preserveBackground = document.getElementById('backgroundToggle').checked;
        const originalBackground = this.canvas.backgroundColor;

        if (!preserveBackground) {
            this.canvas.setBackgroundColor(null, this.canvas.renderAll.bind(this.canvas));
        }

        switch(type) {
            case 'png':
                this.exportImage('png');
                break;
            case 'jpeg':
                this.exportImage('jpeg');
                break;
            case 'svg':
                this.exportSVG();
                break;
            case 'code':
                this.exportCode();
                break;
        }

        // Restore the original background after export
        if (!preserveBackground) {
            this.canvas.setBackgroundColor(originalBackground, this.canvas.renderAll.bind(this.canvas));
        }
    }

    exportImage(format) {
        const dataUrl = this.canvas.toDataURL({
            format: format,
            quality: 1
        });
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `canvas-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportSVG() {
        const svg = this.canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'canvas-export.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    exportCode() {
        const json = this.canvas.toJSON();
        const jsonStr = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'canvas-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    handleShare(type) {
        if (type === 'copy') {
            const url = window.location.href;
            navigator.clipboard.writeText(url)
                .then(() => {
                    this.showToast('Link copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy link:', err);
                    this.showToast('Failed to copy link');
                });
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add toast styles if not already in CSS
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

class ShapeFactory {
    static createShape(type, options) {
        const shapeConfig = ElementStore.shapes[type];
        if (!shapeConfig) return null;

        if (type === 'rect') {
            return new fabric.Rect({
                ...options,
                rxTL: 0,
                ryTL: 0,
                rxTR: 0,
                ryTR: 0,
                rxBL: 0,
                ryBL: 0,
                rxBR: 0,
                ryBR: 0
            });
        }

        const formattedOptions = {
            ...options,
            fill: formatColor(options.fill),
            stroke: formatColor(options.stroke)
        };

        const defaultProps = {
            ...shapeConfig.defaultProps,
            ...formattedOptions
        };

        if (shapeConfig.fabricType === 'custom') {
            return ShapeFactory[shapeConfig.createFunction](defaultProps);
        } else {
            return new fabric[shapeConfig.fabricType](defaultProps);
        }
    }

    static createPolyline(options) {
        return new fabric.Polyline(options.points || [], options);
    }

    static createPolygon(options) {
        return new fabric.Polygon(options.points || [], options);
    }

    static createPath(options) {
        return new fabric.Path(options.path || 'M 0 0', options);
    }

    static registerShapeCreator(name, creatorFunction) {
        ShapeFactory[name] = creatorFunction;
    }
}

// Initialize the editor when the DOM is loaded which make it to be accesable in all window
//  it export or othere thing to do with it  whick  Make it globally available
let editor;

document.addEventListener('DOMContentLoaded', () => {
    try {
        editor = new CanvasEditor();
        window.editor = editor;
        const templateManager = new TemplateManager(editor.canvas);
        window.templateManager = templateManager;
    } catch (error) {
        console.error('Error initializing editor:', error);
    }
});

function formatColor(color) {
    if (!color) return '#fff'; // Default white
    
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        return color;
    }
    
    if (color.match(/^#[0-9A-Fa-f]{3}$/)) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    
    if (color === 'transparent') {
        return 'transparent';
    }
    return '#fff';
}

// Update IconStore to support SVG and Unicode
const IconStore = {
    icons: {},
    
    registerIcon(key, config) {
        this.icons[key] = {
            name: config.name,
            type: config.type || 'font', // 'font', 'svg', or 'unicode'
            category: config.category || 'general',
            unicode: config.unicode,
            svg: config.svg,
            fontFamily: config.fontFamily || 'FontAwesome',
            defaultProps: {
                fontSize: config.fontSize || 40,
                fill: config.fill || '#000000',
                ...config.defaultProps
            }
        };
    },

    registerIcons(iconsConfig) {
        Object.entries(iconsConfig).forEach(([key, config]) => {
            this.registerIcon(key, config);
        });
    }
};

IconStore.registerIcons({
    // Font Awesome icons
    heart: {
        name: 'Heart',
        type: 'font',
        category: 'symbols',
        unicode: '\uf004',
        defaultProps: { fill: '#ff0000' }
    },
    star: {
        name: 'Star',
        category: 'symbols',
        unicode: '\uf005'
    },
    
    // Interface category
    check: {
        name: 'Check',
        category: 'interface',
        unicode: '\uf00c'
    },
    
    // SVG icons
    triangle: {
        name: 'triangle',
        type: 'svg',
        category: 'custom',
        svg: `<svg viewBox="0 0 100 100">
                <path d="M50 0 L100 100 L0 100 Z" />
              </svg>`,
        defaultProps: { fill: '#000000' }
    }
});


// Add this after your existing classes (CanvasEditor, HistoryManager, etc.)
class TemplateManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.templates = [];
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
                <div class="template-grid"></div>
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
        // Load templates from the window.templates
        if (window.templates) {
            console.log('Loading templates from window.templates'); // Debug log
            this.templates = window.templates;
        } else {
            console.warn('No templates found in window.templates');
            this.templates = [];
        }
        
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
        this.grid.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');
        
        // Add click handlers
        this.grid.querySelectorAll('.template-card').forEach((card, index) => {
            card.addEventListener('click', () => this.handleTemplateSelect(templates[index]));
        });
    }

    createTemplateCard(template) {
        return `
            <div class="template-card" data-name="${template.name}">
                <div class="template-preview">
                    ${this.createPreview(template)}
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <span class="template-category">${template.category}</span>
                </div>
            </div>
        `;
    }

    createPreview(template) {
        try {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container';
            
            if (template.type === 'svg') {
                previewContainer.innerHTML = template.data;
                const svg = previewContainer.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                }
            } else {
                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = 150;
                previewCanvas.height = 150;
                
                const fabricPreview = new fabric.StaticCanvas(previewCanvas);
                fabricPreview.loadFromJSON(template.data, () => {
                    const objects = fabricPreview.getObjects();
                    if (objects.length > 0) {
                        fabricPreview.setZoom(0.5);
                        const group = new fabric.Group(objects, {
                            left: 75,
                            top: 75,
                            originX: 'center',
                            originY: 'center'
                        });
                        fabricPreview.clear();
                        fabricPreview.add(group);
                        fabricPreview.renderAll();
                    }
                });
                
                previewContainer.appendChild(previewCanvas);
                this.previewCanvases.set(template.name, fabricPreview);
            }
            
            return previewContainer.outerHTML;
        } catch (error) {
            console.error('Error creating preview:', error);
            return '<div class="preview-error">Error loading preview</div>';
        }
    }

    async handleTemplateSelect(template) {
        console.log('Template selected:', template); // Debug log

        const action = await this.showTemplatePrompt(template.name);
        console.log('Action selected:', action); // Debug log
        
        if (!action) return;
        
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
                    console.log('SVG template added'); // Debug log
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
                        console.log('Fabric objects appended'); // Debug log
                    });
                } else {
                    this.canvas.loadFromJSON(template.data, () => {
                        this.canvas.requestRenderAll();
                        console.log('Fabric template loaded'); // Debug log
                    });
                }
            }

            // Save state after adding template
            if (this.canvas.history) {
                this.canvas.history.saveState();
            }
        } catch (error) {
            console.error('Error handling template:', error);
        }

        this.toggleSidebar();
    }

    showTemplatePrompt(templateName) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'template-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>Load Template: ${templateName}</h3>
                    <p>How would you like to add this template?</p>
                    <div class="dialog-buttons">
                        <button class="btn-cancel">Cancel</button>
                        <button class="btn-append">Append to Canvas</button>
                        <button class="btn-clear">Clear & Add</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            dialog.querySelector('.btn-cancel').onclick = () => {
                dialog.remove();
                resolve(null);
            };

            dialog.querySelector('.btn-append').onclick = () => {
                dialog.remove();
                resolve('append');
            };

            dialog.querySelector('.btn-clear').onclick = () => {
                dialog.remove();
                resolve('clear');
            };
        });
    }
}