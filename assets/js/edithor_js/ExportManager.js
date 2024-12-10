

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