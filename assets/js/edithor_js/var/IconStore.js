
// Update IconStore to support SVG and Unicode
const IconStore = {
    icons: {},
    
    registerIcon(key, config) {
        this.icons[key] = {
            name: config.name,
            type: config.type || 'font', // 'font', 'svg', or 'unicode'
            category: config.category || 'general',
            unicode: config.unicode,
            svg: config.svg,
            fontFamily: config.fontFamily || 'FontAwesome',
            defaultProps: {
                fontSize: config.fontSize || 40,
                fill: config.fill || '#000000',
                ...config.defaultProps
            }
        };
    },

    registerIcons(iconsConfig) {
        Object.entries(iconsConfig).forEach(([key, config]) => {
            this.registerIcon(key, config);
        });
    }
};

IconStore.registerIcons({
    // Font Awesome icons
    heart: {
        name: 'Heart',
        type: 'font',
        category: 'symbols',
        unicode: '\uf004',
        defaultProps: { fill: '#ff0000' }
    },
    star: {
        name: 'Star',
        category: 'symbols',
        unicode: '\uf005'
    },
    
    // Interface category
    check: {
        name: 'Check',
        category: 'interface',
        unicode: '\uf00c'
    },
    
    // SVG icons
    triangle: {
        name: 'triangle',
        type: 'svg',
        category: 'custom',
        svg: `<svg viewBox="0 0 100 100">
                <path d="M50 0 L100 100 L0 100 Z" />
              </svg>`,
        defaultProps: { fill: '#000000' }
    }
});