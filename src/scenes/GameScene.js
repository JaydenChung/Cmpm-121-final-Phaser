class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload(){
        this.load.spritesheet('plant', 'assets/GRASS+.png', {
            frameWidth: 10, frameHeight: 20
        });
        this.load.spritesheet('player', 'assets/GRASS+.png', {
            frameWidth: 28, frameHeight: 9
        });
    }

    create() {
        const plant = this.add.image(0, 0, "plant").setOrigin(0,0);

        plant.displayWidth = this.game.config.width;
        plant.displayHeight = this.game.config.height;

        //this.createMap()

        //create player sprite not working 
        this.player = this.physics.add.sprite(config.width/2, config.height/2, 'player')
        this.player.body.setSize(8000, 8000)

        // Sun and water counters
        this.sun = 0;
        this.water = 0;

        // Display counters
        this.sunText = this.add.text(10, 10, 'Sun: 0', { fontSize: '16px', color: '#fff' });
        this.waterText = this.add.text(10, 30, 'Water: 0', { fontSize: '16px', color: '#fff' });

        // Add a plant
        this.plant = this.add.sprite(200, 200, 'plant', 0);  // Frame 0 is the first growth stage

        // Input to add sun or water
        this.input.on('pointerdown', this.addResources, this);
    }

    update() {
        // Check for growth stage updates
        if (this.sun >= 10 && this.water >= 5) {
            this.growPlant();
        }
    }

    addResources(pointer) {
        // Add resources based on click position
        if (pointer.x < 400) {
            this.sun += 1;
            this.sunText.setText(`Sun: ${this.sun}`);
        } else {
            this.water += 1;
            this.waterText.setText(`Water: ${this.water}`);
        }
    }

    growPlant() {
        if (this.plant.frame.name < 3) { // Assuming 4 growth stages (frames 0-3)
            this.plant.setFrame(this.plant.frame.name + 1);
            this.sun -= 10;
            this.water -= 5;
            this.sunText.setText(`Sun: ${this.sun}`);
            this.waterText.setText(`Water: ${this.water}`);
        }
    }

//     createMap() {
//         const tileWidth = 16; // Width of each tile
//         const tileHeight = 16; // Height of each tile
//         const rows = Math.floor(this.sys.game.config.height / tileHeight); // Fit rows in canvas
//         const cols = Math.floor(this.sys.game.config.width / tileWidth);  // Fit columns in canvas
    
//         for (let row = 0; row < rows; row++) {
//             for (let col = 0; col < cols; col++) {
//                 this.add.grass(
//                     col * tileWidth,  // X position
//                     row * tileHeight, // Y position
//                     'assets',         // Spritesheet key
//                     0                 // Frame index
//                 ).setOrigin(0, 0); // Anchor at top-left
//             }
//         }
//     }
 }
