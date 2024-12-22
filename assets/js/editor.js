jQuery(document).ready(function ($) {
    let history = [];
    let redoStack = [];

    // Initial setup
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Canvas drawing example
    function drawRectangle() {
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(50, 50, 200, 100);
        saveState();
    }

    // Save the current state for undo
    function saveState() {
        history.push(canvas.toDataURL());
        redoStack = [];
    }

    // Undo function
    function undo() {
        if (history.length > 0) {
            redoStack.push(history.pop());
            restoreCanvas(history[history.length - 1]);
        }
    }

    // Redo function
    function redo() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            history.push(state);
            restoreCanvas(state);
        }
    }

    // Restore canvas from history
    function restoreCanvas(state) {
        if (state) {
            let img = new Image();
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = state;
        }
    }

    // Event listeners for buttons
    $('#templates-btn').click(function () {
        alert('Templates feature coming soon!');
    });

    $('#elements-btn').click(function () {
        alert('Elements feature coming soon!');
    });

    $('#text-btn').click(function () {
        alert('Text feature coming soon!');
    });

    $('#uploads-btn').click(function () {
        alert('Uploads feature coming soon!');
    });

    // Adding keyboard shortcuts
    $(document).keydown(function (e) {
        if (e.ctrlKey && e.key === 'z') undo();
        if (e.ctrlKey && e.key === 'y') redo();
    });

    // Example: Initial draw on canvas
    drawRectangle();
});
