class bannerEventandBinuess {
    constructor() {
        this.init();
    }

    init() {
        this.modal = document.getElementById("popupModalbanner");
        this.canvas = new fabric.Canvas("previewCanvasbanner");
        this.rect = new fabric.Rect({
            left: 50,
            top: 50,
            width: 1280 / 12, // Reduced width for smaller card
            height: 720 / 12,
            fill: "#3498db",
        });

        this.canvas.add(this.rect);

        document.getElementById("createNewCardbanner").addEventListener("click", () => this.showModal());
        document.getElementById("closePopupbanner").addEventListener("click", () => this.hideModal());
        document.getElementById("colorPickerbanner").addEventListener("input", (e) => this.changeColor(e));
        document.getElementById("gradientStartbanner").addEventListener("input", () => this.updateGradient());
        document.getElementById("gradientEndbanner").addEventListener("input", () => this.updateGradient());
        document.getElementById("modeSelectorbanner").addEventListener("change", () => this.updateMode());
        document.getElementById("saveButtonbanner").addEventListener("click", () => this.createTemplate());
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
        const startColor = document.getElementById("gradientStartbanner").value;
        const endColor = document.getElementById("gradientEndbanner").value;

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
        const mode = document.getElementById("modeSelectorbanner").value;
        if (mode === "web_header") {
            this.rect.set({ width: 1920/12, height: 600/12 });
        } else if (mode === "social_facebook") {
            this.rect.set({ width: 1200/12, height: 628/12 });
        } else if (mode === "social_instagram_story") {
            this.rect.set({ width: 1080/12, height: 1920/12 });
        } else if (mode === "poster_small") {
            this.rect.set({ width: 792/12, height: 1224/12 }); // Inches converted to pixels (72 DPI)
        } else if (mode === "rollup_standard") {
            this.rect.set({ width: 1376/12, height: 4760/12 }); // Inches converted to pixels (72 DPI)
        } else if (mode === "stage_backdrop") {
            this.rect.set({ width: 720/12, height: 1440/12 }); // Feet converted to pixels (72 DPI)
        }
        this.canvas.renderAll();
    }
    

    createTemplate() {
        // Serialize the fabric.Rect object
        const serializedRect = this.canvas.toObject();

        // Include additional metadata
        const template = {
            data: serializedRect,
            mode: document.getElementById("modeSelectorbanner").value,
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
    new bannerEventandBinuess();
});
