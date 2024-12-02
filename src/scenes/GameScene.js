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
        this.plantsPlacedThisTurn = 0;
        this.currentTurn = 1;
        this.turnText = this.add.text(10, 50, 'Turn: 1', { fontSize: '16px', color: '#fff' });

        // Store placed shrubs
        this.placedShrubs = [];


        // Sun and water counters
        this.sun = 0;
        this.water = 0;

        // Create 2D arrays for sun and water levels based on grid size
        this.sunLevels = [];
        this.waterLevels = [];
        this.resetResources();

        // Display counters
        this.sunText = this.add.text(10, 10, 'Sun: 0', { fontSize: '16px', color: '#fff' });
        this.waterText = this.add.text(10, 30, 'Water: 0', { fontSize: '16px', color: '#fff' });

        // Add plants
        this.plants = [294, 340, 338]; //Plant sprites for stage 1
        this.shrubs = [290, 341, 303]; //Shrub sprites for stage 2
        this.trees = [285, 342, 306]; //Tree sprites for stage 3
        this.plantIndex = 0; //Default Plant Index

        // Highlight sprite for grid hover
        this.highlight = this.add.rectangle(0, 0, this.gridSize, this.gridSize, 0x00ff00, 0.5);
        this.highlight.setOrigin(0.5, 0.5); // Center the rectangle
        this.highlight.setVisible(false); // Hide initially

         // Input events
        this.input.on('pointermove', this.updateHighlight, this);
        this.input.on('pointerdown', this.placeShrub, this);

        //player controls (could be streamlined) (1/2)
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);    
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);    
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); 
        this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE); 
        this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO); 
        this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE); 

        //randomize sun and water levels for each grid cell
        
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

        //Plant Switch
        if (Phaser.Input.Keyboard.JustDown(this.oneKey)) {
            this.plantIndex = 0;
        } else if (Phaser.Input.Keyboard.JustDown(this.twoKey)) {
            this.plantIndex = 1;
        } else if (Phaser.Input.Keyboard.JustDown(this.threeKey)) {
            this.plantIndex = 2;
        }

        
    
        // Snap player position to the center of the grid
        this.player.x = Math.floor(this.player.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        this.player.y = Math.floor(this.player.y / this.gridSize) * this.gridSize + this.gridSize / 2;
        
    }

    placeShrub(pointer) {
        if (this.plantsPlacedThisTurn >= 3) {
            console.log("Maximum of 3 plants can be placed per turn.");
            return;
        }
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
            const newShrub = this.add.sprite(shrubX, shrubY, "tilemap", this.plants[this.plantIndex]); // Assuming frame 294 is the shrub
            newShrub.scale = 4;
            this.placedShrubs.push(newShrub);
            this.plantsPlacedThisTurn++;
    
            // Optional: Add animation if needed
            if (!this.anims.exists('shrubAnim')) {
                this.anims.create({
                    key: 'shrubAnim',
                    frames: this.anims.generateFrameNumbers("tilemap", { 
                        start: this.plants[this.plantsIndex], 
                        end: this.plants[this.plantsIndex] 
                    }),
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

    resetResources() {
        // Randomize sun and water levels for each grid cell
        for (let i = 0; i < 10; i++) {
            this.sunLevels[i] = [];
            this.waterLevels[i] = [];
            for (let j = 0; j < 10; j++) {
                this.sunLevels[i][j] = Phaser.Math.Between(0, 10); // Random sun level between 0 and 10
                this.waterLevels[i][j] = Phaser.Math.Between(0, 5); // Random water level between 0 and 5
            }
        }
    }

    growPlant(shrubObj) {
        const shrub = shrubObj.shrub;
        const shrubX = shrubObj.x;
        const shrubY = shrubObj.y;
    
        // Get the sun and water levels for the current grid cell
        const sunLevel = this.sunLevels[shrubX][shrubY];
        const waterLevel = this.waterLevels[shrubX][shrubY];
    
        // Check if the sun and water requirements are met
        const sunRequirement = 5; // Example sun requirement
        const waterRequirement = 2; // Example water requirement
    
        if (sunLevel >= sunRequirement && waterLevel >= waterRequirement) {
            // Change the sprite to the grown plant
            shrub.setTexture("tilemap", 264); // Grown plant sprite from spritesheet at (264, 186)
            shrub.scale = 4; // Adjust scale if needed
            console.log("Shrub has grown into a plant!");
        } else {
            console.log("Not enough sun or water to grow the shrub.");
        }
    }
    

    nextTurn() {
        this.currentTurn++;
        this.plantsPlacedThisTurn = 0; // Reset plants placed for the new turn
        
        this.turnText.setText(`Turn: ${this.currentTurn}`);
        //having issues changing shrub to plant
        // this.placedShrubs.forEach((shrubObj) => {
        //     this.growPlant(shrubObj.shrub);
        // });
        this.resetResources(); // Randomize sun and water levels for new turn
    }
 }
