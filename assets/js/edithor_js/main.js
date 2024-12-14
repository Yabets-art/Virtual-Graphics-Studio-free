// Initialize the editor when the DOM is loaded which make it to be accesable in all window
//  it export or othere thing to do with it  whick  Make it globally available
let editor;

document.addEventListener('DOMContentLoaded', () => {
    try {
        editor = new CanvasEditor();
        window.editor = editor;
        window.templateManager = new TemplateManager(editor.canvas);
        window.hintManager = new HintManager(); 

        // Load template from IndexedDB
        const request = indexedDB.open('templateDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            
            const getRequest = store.get('currentTemplate');
            
            getRequest.onsuccess = (event) => {
                const data = event.target.result;
                if (data && data.colorScheme) {
                    // Convert CSS gradient to Fabric.js gradient
                    const createGradient = (colorScheme) => {
                        return new fabric.Gradient({
                            type: 'linear',
                            coords: {
                                x1: 0,
                                y1: 0,
                                x2: editor.canvas.width,
                                y2: editor.canvas.height
                            },
                            colorStops: [
                                { offset: 0, color: colorScheme.background.match(/#[A-Fa-f0-9]{6}/g)[0] },
                                { offset: 1, color: colorScheme.background.match(/#[A-Fa-f0-9]{6}/g)[1] }
                            ]
                        });
                    };
     
                    if (data.type === 'fabric') {
                        const templateData = typeof data.data === 'string' ? 
                            JSON.parse(data.data) : data.data;

                        editor.canvas.loadFromJSON(templateData, () => {
                            editor.canvas.getObjects().forEach(obj => {
                                if (obj.type === 'text' || obj.type === 'i-text') {
                                    obj.set({
                                        fill: data.colorScheme.text,
                                        dirty: true
                                    });
                                } else {
                                    obj.set({
                                        fill: data.colorScheme.primary,
                                        dirty: true
                                    });
                                }
                            });
                            editor.canvas.requestRenderAll();
                        });
                    } else if (data.type === 'svg') {
                        fabric.loadSVGFromString(data.data, (objects, options) => {
                            objects.forEach(obj => {
                                if (obj.type === 'text' || obj.type === 'i-text') {
                                    obj.set({
                                        fill: data.colorScheme.text,
                                        dirty: true
                                    });
                                } else if (obj.get('fill') !== 'none') {
                                    obj.set({
                                        fill: data.colorScheme.primary,
                                        dirty: true
                                    });
                                }
                            });

                            const loadedObjects = fabric.util.groupSVGElements(objects, options);
                            editor.canvas.add(loadedObjects);
                            editor.canvas.requestRenderAll();
                        });
                    }
                    editor.canvas.setBackgroundColor(createGradient(data.colorScheme), () => {
                        editor.canvas.renderAll();
                    });

                }
            };

            getRequest.onerror = (event) => {
                console.error('Error loading template:', event.target.error);
            };
        };
    } catch (error) {
        console.error('Error initializing editor:', error);
    }
});

function formatColor(color) {
    if (!color) return '#fff'; // Default :it is  white
    
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