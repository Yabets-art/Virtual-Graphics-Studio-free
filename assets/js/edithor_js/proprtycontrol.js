

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