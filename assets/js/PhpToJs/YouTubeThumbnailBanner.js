class YouTubeThumbnailBanner {
    constructor() {
        this.init();
    }

    init() {
        this.modal = document.getElementById("popupModal");
        this.canvas = new fabric.Canvas("previewCanvas");
        this.rect = new fabric.Rect({
            left: 50,
            top: 50,
            width: 1280 / 12, // Reduced width for smaller card
            height: 720 / 12,
            fill: "#3498db",
        });

        this.canvas.add(this.rect);

        document.getElementById("createNewCard").addEventListener("click", () => this.showModal());
        document.getElementById("closePopup").addEventListener("click", () => this.hideModal());
        document.getElementById("colorPicker").addEventListener("input", (e) => this.changeColor(e));
        document.getElementById("gradientStart").addEventListener("input", () => this.updateGradient());
        document.getElementById("gradientEnd").addEventListener("input", () => this.updateGradient());
        document.getElementById("modeSelector").addEventListener("change", () => this.updateMode());
        document.getElementById("saveButton").addEventListener("click", () => this.createTemplate());
    }

    showModal() {
        this.modal.classList.remove("hidden");
    }

    hideModal() {
        this.modal.classList.add("hidden");
    }

    changeColor(event) {
        this.rect.set("fill", event.target.value);
        this.canvas.renderAll();
    }

    updateGradient() {
        const startColor = document.getElementById("gradientStart").value;
        const endColor = document.getElementById("gradientEnd").value;

        const gradient = new fabric.Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: this.rect.width, y2: 0 },
            colorStops: [
                { offset: 0, color: startColor },
                { offset: 1, color: endColor },
            ],
        });

        this.rect.set("fill", gradient);
        this.canvas.renderAll();
    }

    updateMode() {
        const mode = document.getElementById("modeSelector").value;
        if (mode === "thumbnail") {
            this.rect.set({ width: 1280 / 12, height: 720 / 12 });
        } else if (mode === "banner") {
            this.rect.set({ width: 2560 / 12, height: 1440 / 12 });
        }
        this.canvas.renderAll();
    }

    createTemplate() {
        // Serialize the fabric.Rect object
        const serializedRect = this.canvas.toObject();

        // Include additional metadata
        const template = {
            data: serializedRect,
            mode: document.getElementById("modeSelector").value,
            timestamp: Date.now(),
            type:'fabric',
            colorScheme: {
                primary: '#333333',
                secondary: '#666666',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                text: '#000000'
            },
            current: "currentTemplate",
        };

        this.saveToIndexDBAndRedirect(template);
    }

    saveToIndexDBAndRedirect(template) {
        const request = indexedDB.open("templateDB", 1);

        request.onerror = (event) => {
            console.error("Error opening IndexedDB:", event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("templates")) {
                db.createObjectStore("templates", { keyPath: "current" });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["templates"], "readwrite");
            const store = transaction.objectStore("templates");

            const checkRequest = store.get("currentTemplate");

            checkRequest.onsuccess = (event) => {
                const existingData = event.target.result;

                const storeRequest = existingData
                    ? store.put(template)
                    : store.add(template);

                storeRequest.onerror = (error) => {
                    console.error("Error saving to IndexedDB:", error);
                };

                storeRequest.onsuccess = () => {
                    console.log(`Template ${existingData ? "updated" : "added"} successfully`);
                    if (window.location.href.includes("wp-admin")) {
                        window.location.href = "../wp-content/plugins/Virtual-Graphics-Studio/edithor.html";
                    } else {
                        window.location.href = "/wordpress/wp-content/plugins/Virtual-Graphics-Studio/edithor.html";
                    }
                };
            };

            checkRequest.onerror = (error) => {
                console.error("Error checking existing record:", error);
            };
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new YouTubeThumbnailBanner();
});
