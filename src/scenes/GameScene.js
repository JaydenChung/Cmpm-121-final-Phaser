class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload(){
        this.load.script('PlantDetails','./src/PlantDetails.js')
        this.load.spritesheet("tilemap", "assets/GRASS+.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("BG", "assets/mapBG.png")
    }

    create() {
        const backGround = this.add.image(0, 0, "BG").setOrigin(0,0)

        //create player
        this.player = this.add.sprite(config.width/2, config.height/2, "tilemap", 334);
        this.player.scale = 4;

        // Sun and water counters
        this.sun = 0;
        this.water = 0;

        // Display counters
        this.sunText = this.add.text(10, 10, 'Sun: 0', { fontSize: '16px', color: '#fff' });
        this.waterText = this.add.text(10, 30, 'Water: 0', { fontSize: '16px', color: '#fff' });

        // Add a plant
        this.plant = this.add.sprite(200, 200, "tilemap", 343);
        this.plant.scale = 2.5
        this.newPlant = new PlantA(this.plant); //attaches the plant sprite into newPlant obj

        // Input to add sun or water
        this.input.on('pointerdown', this.addResources, this);


        //player controls (could be streamlined) (1/2)
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);    
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);    
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
    }

    update() {
        // Check for growth stage updates
        if (this.sun >= 10 && this.water >= 5) {
            this.growPlant();
        }

        //player movement (2/2)
        if (this.wKey.isDown) {

            if (this.player.y > (this.player.displayHeight/2)){
                this.player.y -= 5.5
            }
        } else if (this.sKey.isDown) {

            if (this.player.y < (config.height-35)){
                this.player.y += 5.5
            }
        } else if (this.aKey.isDown) {

            if (this.player.x > (this.player.displayWidth/2)){
                this.player.x -= 5.5
            }
        } else if (this.dKey.isDown) {

            if (this.player.x < config.width-20){
                this.player.x += 5.5
            }
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
