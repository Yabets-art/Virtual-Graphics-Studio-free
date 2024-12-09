window.templates = [
    {
        name: "Basic Layout",
        category: "layouts",
        type: "fabric",
        data: {
            "version": "5.3.0",
            "objects": [
                {
                    "type": "rect",
                    "version": "5.3.0",
                    "originX": "center",
                    "originY": "center",
                    "left": 655,
                    "top": 300,
                    "width": 100,
                    "height": 100,
                    "fill": "red",
                    "stroke": null,
                    "strokeWidth": 1,
                    "strokeDashArray": null,
                    "strokeLineCap": "butt",
                    "strokeDashOffset": 0,
                    "strokeLineJoin": "miter",
                    "strokeUniform": false
                }
            ]
        },
        tags: ["basic", "layout"]
    },
    {
        name: "Circle Icon",
        category: "icons",
        type: "svg",
        data: `<svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="blue"/>
        </svg>`,
        tags: ["icon", "circle"]
    }
];