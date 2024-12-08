class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.script('SaveState', './src/SaveState.js');
        this.load.script('PlantManager', './src/PlantManagement.js');
    }

    init(data) {
        this.language = data.language;  // Access the passed 'language' data here
    }

    create() {
        console.log(`PreloadScene: Selected language: ${this.language}`);

        // Start GameScene and pass the language
        this.scene.start('GameScene', { language: this.language });
    }
}

window.PreloadScene = PreloadScene;
