
class ImageCropTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.active = false;
        this.cropRect = null;
        this.originalImage = null;
    }

    activate() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') {
            alert('Please select an image to crop');
            return;
        }

        this.active = true;
        this.originalImage = activeObject;
        
        this.canvas.selection = false;
        this.canvas.discardActiveObject();

        const imgBounds = this.originalImage.getBoundingRect();
        this.cropRect = new fabric.Rect({
            left: imgBounds.left,
            top: imgBounds.top,
            width: imgBounds.width,
            height: imgBounds.height,
            fill: 'rgba(0,0,0,0.3)',
            stroke: '#2196f3',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            cornerColor: '#2196f3',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            transparentCorners: true,
            hasRotatingPoint: true
        });

        this.canvas.add(this.cropRect);
        this.canvas.setActiveObject(this.cropRect);
        this.canvas.renderAll();

        this.addCropControls();
    }

    deactivate() {
        if (!this.active) return;

        this.active = false;
        if (this.cropRect) {
            this.canvas.remove(this.cropRect);
        }

        const controls = document.getElementById('cropControls');
        if (controls) {
            controls.remove();
        }

        this.canvas.selection = true;
        this.canvas.renderAll();
    }

    applyCrop() {
        if (!this.cropRect || !this.originalImage) return;

        const rect = this.cropRect;
        const image = this.originalImage;

        const imageElement = image.getElement();
        const imgWidth = imageElement.naturalWidth;
        const imgHeight = imageElement.naturalHeight;

        const imgBounds = image.getBoundingRect();
        const cropBounds = rect.getBoundingRect();

        const left = Math.max(0, (cropBounds.left - imgBounds.left) / image.scaleX);
        const top = Math.max(0, (cropBounds.top - imgBounds.top) / image.scaleY);
        const width = Math.min(imgWidth, cropBounds.width / image.scaleX);
        const height = Math.min(imgHeight, cropBounds.height / image.scaleY);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imageElement,
            left, top, width, height,
            0, 0, width, height
        );

        fabric.Image.fromURL(canvas.toDataURL(), (croppedImg) => {
            croppedImg.set({
                left: cropBounds.left -100,
                top: cropBounds.top -100,
                scaleX: 0.2,
                scaleY: 0.2
            });

            this.canvas.remove(this.originalImage);
            this.canvas.add(croppedImg);
            this.canvas.setActiveObject(croppedImg);
            this.deactivate();
        });
    }

    addCropControls() {
        const existingControls = document.getElementById('cropControls');
        if (existingControls) {
            existingControls.remove();
        }

        const controls = document.createElement('div');
        controls.id = 'cropControls';
        controls.style.cssText = `
            position: fixed;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply Crop';
        applyBtn.className = 'btn btn-primary';
        applyBtn.onclick = () => this.applyCrop();

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.onclick = () => this.deactivate();

        controls.appendChild(applyBtn);
        controls.appendChild(cancelBtn);
        document.body.appendChild(controls);
    }
}