

class ShapeFactory {
    static createShape(type, options) {
        const shapeConfig = ElementStore.shapes[type];
        if (!shapeConfig) return null;

        if (type === 'rect') {
            return new fabric.Rect({
                ...options,
                rxTL: 0,
                ryTL: 0,
                rxTR: 0,
                ryTR: 0,
                rxBL: 0,
                ryBL: 0,
                rxBR: 0,
                ryBR: 0
            });
        }

        const formattedOptions = {
            ...options,
            fill: formatColor(options.fill),
            stroke: formatColor(options.stroke)
        };

        const defaultProps = {
            ...shapeConfig.defaultProps,
            ...formattedOptions
        };

        if (shapeConfig.fabricType === 'custom') {
            return ShapeFactory[shapeConfig.createFunction](defaultProps);
        } else {
            return new fabric[shapeConfig.fabricType](defaultProps);
        }
    }

    static createPolyline(options) {
        return new fabric.Polyline(options.points || [], options);
    }

    static createPolygon(options) {
        return new fabric.Polygon(options.points || [], options);
    }

    static createPath(options) {
        return new fabric.Path(options.path || 'M 0 0', options);
    }

    static registerShapeCreator(name, creatorFunction) {
        ShapeFactory[name] = creatorFunction;
    }
}
