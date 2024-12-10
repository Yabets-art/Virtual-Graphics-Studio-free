
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
