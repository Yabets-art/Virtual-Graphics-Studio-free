
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
