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
        this.gridSize = 64;
        const backGround = this.add.image(0, 0, "BG").setOrigin(0,0)

        //create player
        this.player = this.add.sprite(config.width/2, config.height/2, "tilemap", 334);
        this.player.scale = 4;

        //add turns
        this.currentTurn = 1;
        this.turnText = this.add.text(10, 50, 'Turn: 1', { fontSize: '16px', color: '#fff' });


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

        // Highlight sprite for grid hover
        this.highlight = this.add.rectangle(0, 0, this.gridSize, this.gridSize, 0x00ff00, 0.5);
        this.highlight.setOrigin(0.5, 0.5); // Center the rectangle
        this.highlight.setVisible(false); // Hide initially

         // Input events
        this.input.on('pointermove', this.updateHighlight, this);
        this.input.on('pointerdown', this.placeShrub, this);

        console.log(this.newPlant.plantObject.setFrame(this.newPlant.STAGE2)); //this is how you change the sprite
        //above code could probally be implimented in updatePlant() in PlantDetails.js


        //player controls (could be streamlined) (1/2)
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);    
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);    
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); 
    }

    update() {
        const playerSpeed = this.gridSize;

        // Move the player and snap to grid
        if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.player.y -= playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.player.y += playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
            this.player.x -= playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
            this.player.x += playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            this.nextTurn();
        }

        
    
        // Snap player position to the center of the grid
        this.player.x = Math.floor(this.player.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        this.player.y = Math.floor(this.player.y / this.gridSize) * this.gridSize + this.gridSize / 2;
        
    }

    placeShrub(pointer) {
        // Get the grid position where the user clicked
        const shrubX = Math.floor(pointer.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const shrubY = Math.floor(pointer.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    
        // Get the player's current grid position
        const playerX = Math.floor(this.player.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const playerY = Math.floor(this.player.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    
        // Check if the clicked position is adjacent to the player's position
        const isAdjacent = (
            (Math.abs(shrubX - playerX) === this.gridSize && shrubY === playerY) || // Left or right
            (Math.abs(shrubY - playerY) === this.gridSize && shrubX === playerX)   // Up or down
        );
    
        if (isAdjacent) {
            // Create a new shrub at the clicked location
            const newShrub = this.add.sprite(shrubX, shrubY, "tilemap", 294); // Assuming frame 294 is the shrub
            newShrub.scale = 4;
    
            // Optional: Add animation if needed
            if (!this.anims.exists('shrubAnim')) {
                this.anims.create({
                    key: 'shrubAnim',
                    frames: this.anims.generateFrameNumbers("tilemap", { start: 294, end: 294 }),
                    frameRate: 1,
                    repeat: 0
                });
            }
            newShrub.play('shrubAnim');
        } else {
            console.log("You can only place shrubs adjacent to the player.");
        }
    }
    
    updateHighlight(pointer) {
        // Snap highlight to the nearest grid space
        const highlightX = Math.floor(pointer.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const highlightY = Math.floor(pointer.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    
        // Update position of the highlight rectangle
        this.highlight.setPosition(highlightX, highlightY);
        this.highlight.setVisible(true);
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

    nextTurn(){
        this.currentTurn++;
        this.turnText.setText(`Turn: ${this.currentTurn}`);

        console.log(`Turn ${this.currentTurn} started!`);
    }
 }
