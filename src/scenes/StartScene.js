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
            if (button.text !== selectedLanguage) { // Only change hover for non-selected
                button.setStyle({ backgroundColor: '#00ff00' });
            }
        });

        button.on('pointerout', () => {
            if (button.text !== selectedLanguage) { // Only change hover for non-selected
                button.setStyle({ backgroundColor: '#0000ff' });
            } else {
                button.setStyle({ color: '#ff0000' }); // Keep it red if selected
            }
        });

        // Button click
        button.on('pointerdown', () => {
            // Reset previously selected button color
            languages.forEach((lang) => {
                if (lang !== selectedLanguage) {
                    const otherLangButton = this.children.entries.find((child) => child.text === lang);
                    if (otherLangButton) {
                        otherLangButton.setStyle({ color: '#ffffff', backgroundColor: '#0000ff' });
                    }
                }
            });

            // Select new language
            selectedLanguage = language;
            button.setStyle({ color: '#ff0000' }); // Set selected to red
            console.log(`Language selected: ${selectedLanguage}`);
        });
    });
    }
}

// Expose StartScene globally
window.StartScene = StartScene;
