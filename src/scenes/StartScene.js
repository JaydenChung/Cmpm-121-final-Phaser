class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Load the same background used in GameScene
        this.load.image('mapBG', 'assets/mapBG.png');
    }

    create() {
        // Add background image
        const bg = this.add.image(0, 0, 'mapBG').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        // Add title text
        this.add.text(
            this.sys.game.config.width / 2,
            50,
            "Graceful Garden",
            { fontSize: '48px', color: '#ffffff', fontFamily: 'Arial' }
        ).setOrigin(0.5);

        // Add controls info
        const controlsText = `
        Controls:
        W - Move Up
        S - Move Down
        A - Move Left
        D - Move Right
        O - End Turn
        Z - Undo
        X - Redo
        F - Save Game
        L - Load Game`;
        
        this.add.text(
            this.sys.game.config.width / 2,
            200,
            controlsText,
            { fontSize: '20px', color: '#ffffff', fontFamily: 'Courier', align: 'center', lineSpacing: 10 }
        ).setOrigin(0.5);

        // Add start button
        const startButton = this.add.text(
            this.sys.game.config.width / 2,
            500,
            "Start Game",
            { fontSize: '32px', color: '#ffffff', backgroundColor: '#0000ff', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#00ff00' });
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#0000ff' });
        });

        // Button click transitions to PreloadScene
        startButton.on('pointerdown', () => {
            this.scene.start('PreloadScene');
        });
    }
}

// Expose StartScene globally so main.js can access it
window.StartScene = StartScene;