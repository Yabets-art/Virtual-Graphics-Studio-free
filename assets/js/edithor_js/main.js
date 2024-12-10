
// Initialize the editor when the DOM is loaded which make it to be accesable in all window
//  it export or othere thing to do with it  whick  Make it globally available
let editor;

document.addEventListener('DOMContentLoaded', () => {
    try {
        editor = new CanvasEditor();
        window.editor = editor;
        window.templateManager= new TemplateManager(editor.canvas)
        window.hintManager = new HintManager();
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