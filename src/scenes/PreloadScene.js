class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    // preload() {
    //     this.load.spritesheet('plant', 'assets/GRASS+.png', {
    //         frameWidth: 64, frameHeight: 64
    //     });
    // }

    create() {
        this.scene.start('GameScene');
    }
}
