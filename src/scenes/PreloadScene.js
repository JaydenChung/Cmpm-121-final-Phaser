class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(){
        this.load.script('SaveState','./src/SaveState.js')
        this.load.script('PlantManager','./src/PlantManagement.js')
    }

    create() {
        this.scene.start('GameScene');
    }
}
