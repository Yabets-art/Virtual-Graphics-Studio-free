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
