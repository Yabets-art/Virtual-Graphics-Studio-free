
class HintManager {
    constructor() {
        this.hints = window.hints || [];
        this.currentHint = 0;
        this.overlay = null;
        this.hintBox = null;
        this.hasSeenHints = localStorage.getItem('hasSeenHints');
        this.init();
    }

    init() {
        if (this.hasSeenHints || !this.hints.length) return;
        
        this.createOverlay();
        this.showHint(0);
        
        // Add keyboard listeners for navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.endTour();
            if (e.key === 'ArrowRight') this.nextHint();
            if (e.key === 'ArrowLeft') this.previousHint();
        });
    }

    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'hint-overlay';
        
        // Create hint box
        this.hintBox = document.createElement('div');
        this.hintBox.className = 'hint-box';
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.hintBox);
    }

    showHint(index) {
        if (index < 0 || index >= this.hints.length) return;
        
        const hint = this.hints[index];
        const element = document.querySelector(hint.element);
        
        if (!element) return;
        
        // Update current hint index
        this.currentHint = index;
        
        // Position hint box
        const elementRect = element.getBoundingClientRect();
        this.positionHintBox(elementRect, hint.position);
        
        // Update hint content
        this.hintBox.innerHTML = `
            <div class="hint-content">
                <h3>${hint.title}</h3>
                <p>${hint.message}</p>
                <div class="hint-navigation">
                    <button class="hint-btn" ${index === 0 ? 'disabled' : ''} onclick="window.hintManager.previousHint()">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <span class="hint-progress">${index + 1}/${this.hints.length}</span>
                    ${index === this.hints.length - 1 ? 
                        `<button class="hint-btn hint-finish" onclick="window.hintManager.endTour()">Finish</button>` :
                        `<button class="hint-btn" onclick="window.hintManager.nextHint()">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>`
                    }
                </div>
                <button class="hint-skip" onclick="window.hintManager.endTour()">Skip Tour</button>
            </div>
        `;
        
        // Highlight current element
        this.highlightElement(element);
    }

    positionHintBox(elementRect, position = 'right') {
        const hintBox = this.hintBox;
        const margin = 20;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate initial position
        let left, top;
        
        switch(position) {
            case 'right':
                left = elementRect.right + margin;
                top = elementRect.top;
                // Check if hint box would go off screen
                if (left + hintBox.offsetWidth > windowWidth) {
                    position = 'left';
                }
                break;
            case 'left':
                left = elementRect.left - hintBox.offsetWidth - margin;
                top = elementRect.top;
                // Check if hint box would go off screen
                if (left < 0) {
                    position = 'right';
                }
                break;
            case 'top':
                left = elementRect.left;
                top = elementRect.top - hintBox.offsetHeight - margin;
                // Check if hint box would go off screen
                if (top < 0) {
                    position = 'bottom';
                }
                break;
            case 'bottom':
                left = elementRect.left;
                top = elementRect.bottom + margin;
                // Check if hint box would go off screen
                if (top + hintBox.offsetHeight > windowHeight) {
                    position = 'top';
                }
                break;
        }

        // Reposition if needed based on new position
        switch(position) {
            case 'right':
                left = elementRect.right + margin;
                break;
            case 'left':
                left = elementRect.left - hintBox.offsetWidth - margin;
                break;
            case 'top':
                top = elementRect.top - hintBox.offsetHeight - margin;
                break;
            case 'bottom':
                top = elementRect.bottom + margin;
                break;
        }

        // Ensure hint box stays within viewport
        left = Math.max(margin, Math.min(left, windowWidth - hintBox.offsetWidth - margin));
        top = Math.max(margin, Math.min(top, windowHeight - hintBox.offsetHeight - margin));

        // Apply position
        hintBox.style.left = `${left}px`;
        hintBox.style.top = `${top}px`;

        // Add position class for arrow
        hintBox.className = `hint-box hint-${position}`;
    }

    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        this.overlay.style.setProperty('--highlight-top', `${rect.top}px`);
        this.overlay.style.setProperty('--highlight-left', `${rect.left}px`);
        this.overlay.style.setProperty('--highlight-width', `${rect.width}px`);
        this.overlay.style.setProperty('--highlight-height', `${rect.height}px`);
    }

    nextHint() {
        if (this.currentHint < this.hints.length - 1) {
            this.showHint(this.currentHint + 1);
        }
    }

    previousHint() {
        if (this.currentHint > 0) {
            this.showHint(this.currentHint - 1);
        }
    }

    endTour() {
        this.overlay.remove();
        this.hintBox.remove();
        localStorage.setItem('hasSeenHints', 'true');
    }

    resetTour() {
        localStorage.removeItem('hasSeenHints');
        this.hasSeenHints = false;
        this.init();
    }
}