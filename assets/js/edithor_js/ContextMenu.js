

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
