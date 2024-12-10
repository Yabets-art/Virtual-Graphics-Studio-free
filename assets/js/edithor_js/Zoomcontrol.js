

class ZoomManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.current = 1;
        this.min = 0.1;
        this.max = 2;
        this.step = 0.1;
        this.init();
    }

    init() {
        this.updateZoomLevel();
    }

    setZoom(zoomLevel, point) {
        this.current = Math.min(Math.max(zoomLevel, this.min), this.max);
        
        if (point) {
            this.canvas.zoomToPoint(point, this.current);
        } else {
            this.canvas.setZoom(this.current);
        }
        
        this.updateZoomLevel();
        this.canvas.requestRenderAll();
    }

    updateZoomLevel() {
        const percentage = Math.round(this.current * 100);
        document.getElementById('zoomValue').textContent = `${percentage}%`;
        
        document.getElementById('zoomIn').disabled = this.current >= this.max;
        document.getElementById('zoomOut').disabled = this.current <= this.min;
    }
}