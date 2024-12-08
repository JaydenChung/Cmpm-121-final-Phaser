class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('mapBG', 'assets/mapBG.png');
    }

    create() {
        document.getElementById('description').innerHTML = `
        <h1>Graceful Garden
        <pre>
        [A] ⟵   [W] ↑   [S] ↓  [D] ⟶
        [1] 1st Plant   [2] 2nd Plant   [3] 3rd Plant
        [O] Next Turn
        [Z] Undo        [X] Redo
        [F] Save Game   [L] Load Game`;

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

        // Language selection buttons
        const languages = ['English', 'Chinese', 'Arabic'];
        let selectedLanguage = 'English'; // Default

        languages.forEach((language, index) => {
            const button = this.add.text(
                this.sys.game.config.width / 2,
                200 + index * 50,
                language,
                { fontSize: '32px', color: '#ffffff', backgroundColor: '#0000ff', padding: { x: 20, y: 10 } }
            ).setOrigin(0.5).setInteractive();

            // Button hover effects
            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: '#00ff00' });
            });
            button.on('pointerout', () => {
                button.setStyle({ backgroundColor: '#0000ff' });
            });

            // Button click
            button.on('pointerdown', () => {
                selectedLanguage = language;
                console.log(`Language selected: ${selectedLanguage}`);
            });
        });

        // Start Game button
        const startButton = this.add.text(
            this.sys.game.config.width / 2,
            500,
            "Start Game",
            { fontSize: '32px', color: '#ffffff', backgroundColor: '#0000ff', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#00ff00' });
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#0000ff' });
        });

        // Start game and pass language to GameScene
        startButton.on('pointerdown', () => {
            console.log(selectedLanguage);
            this.scene.start('PreloadScene', { language: selectedLanguage });  // Use selectedLanguage here
        });
    }
}

// Expose StartScene globally
window.StartScene = StartScene;
