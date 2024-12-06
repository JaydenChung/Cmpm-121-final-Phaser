class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload(){
        this.load.spritesheet("tilemap", "assets/GRASS+.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("BG", "assets/mapBG.png")
    }

    create() {
        this.gridSize = 64;

        this.gridWidth = 10; // Adjust as needed
        this.gridHeight = 10; // Adjust as needed
        // Initialize the grid state as a Uint8Array

        // Naming floating numbers for identity sake
        this.playerSprite = 334;

        this.gridState = new gridStateManager(this.gridWidth * this.gridHeight);

        const backGround = this.add.image(0, 0, "BG").setOrigin(0,0)

        // Create player
        this.player = this.add.sprite(config.width/2, config.height/2, "tilemap", this.playerSprite);
        this.player.scale = 4;

        // Turn and plant management
        this.plantsPlacedThisTurn = 0;
        this.currentTurn = 1;
        this.maxPlantsPerTurn = 3;
        this.turnText = this.add.text(10, 50, 'Turn: 1', { fontSize: '16px', color: '#fff' });

        // Score tracking
        this.score = 0;
        this.scoreText = this.add.text(10, 70, 'Score: 0', { fontSize: '16px', color: '#fff' });

        // Reaping tracking
        this.sowedPlants = 0;
        this.maxSowedPlants = 2; // As per the Unity script

        // Store placed plants with their growth information
        this.placedPlants = [];

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

        // Plant sprite selection
        this.plantIndex = 0;

        // Highlight sprite for grid hover
        this.highlight = this.add.rectangle(0, 0, this.gridSize, this.gridSize, 0x00ff00, 0.5);
        this.highlight.setOrigin(0.5, 0.5);
        this.highlight.setVisible(false);

        // Input events
        this.input.on('pointermove', this.updateHighlight, this);
        this.input.on('pointerdown', this.handleClick, this);

        // Player controls
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);    
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);    
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); 
        this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE); 
        this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO); 
        this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

        
        this.input.keyboard.on('keydown-F', () => this.gridState.saveGame(1, this.returnGameState())); 
        this.input.keyboard.on('keydown-L', () => this.gridState.loadGame(1, this)); 


        //Declare plant management system
        this.plantManager = new PlantManager(this.gridSize, this.maxPlantsPerTurn);
    }

    update() {
        const playerSpeed = this.gridSize;
        let newX = this.player.x;
        let newY = this.player.y;

        // Determine potential new position
        if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
            newY -= playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
            newY += playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
            newX -= playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
            newX += playerSpeed;
        } else if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            this.nextTurn();
            return;
        }

        // Snap new position to grid
        const gridX = Math.floor(newX / this.gridSize);
        const gridY = Math.floor(newY / this.gridSize);

        // Check if the new grid cell is occupied by a plant
        const isOccupied = this.placedPlants.some(plant => 
            plant.x === gridX && plant.y === gridY
        );

        // Only move if the cell is not occupied
        if (!isOccupied) {
            this.player.x = gridX * this.gridSize + this.gridSize / 2;
            this.player.y = gridY * this.gridSize + this.gridSize / 2;
        }

        // Plant Switch
        if (Phaser.Input.Keyboard.JustDown(this.oneKey)) {
            this.plantIndex = 0;
        } else if (Phaser.Input.Keyboard.JustDown(this.twoKey)) {
            this.plantIndex = 1;
        } else if (Phaser.Input.Keyboard.JustDown(this.threeKey)) {
            this.plantIndex = 2;
        }
    }

    returnGameState(){
        return {
            gridState: Array.from(this.gridState.getGridState()), // Convert Uint8Array to normal array
            player: this.player,
            playerX: this.player.x,
            playerY: this.player.y,
            score: this.score,
            turn: this.currentTurn,
            placedDownPlants: this.placedPlants
            // Serialize placedPlants without the sprite reference
        }
    }

    handleClick(pointer) {
        // Get the grid position of the click
        const gridX = Math.floor(pointer.x / this.gridSize);
        const gridY = Math.floor(pointer.y / this.gridSize);

        // Check if clicking on a fully grown plant
        const plantToReap = this.plantManager.getPlaced().find(plant => 
            plant.x === gridX && 
            plant.y === gridY && 
            plant.currentStage === this.plantManager.PlantGrowthStage.Tree
        );

        if (plantToReap) {
            this.plantManager.reapPlant(plantToReap, this);
        } else {
            // If not reaping, try to place a plant
            this.plantManager.placePlant(pointer, this.plantIndex, this);
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
        const gridCols = Math.ceil(this.sys.game.config.width / this.gridSize); // Columns in the grid
        const gridRows = Math.ceil(this.sys.game.config.height / this.gridSize); // Rows in the grid
        for (let i = 0; i < gridCols; i++) {
            this.sunLevels[i] = [];
            this.waterLevels[i] = [];
            for (let j = 0; j < gridRows; j++) {
                this.sunLevels[i][j] = Phaser.Math.Between(0, 10); // Random sun level
                this.waterLevels[i][j] = Phaser.Math.Between(0, 5); // Random water level
            }
        }

        // Update sun and water text
        const averageSun = this.calculateAverageSun();
        const averageWater = this.calculateAverageWater();
        // this.sunText.setText(`Sun: ${averageSun.toFixed(1)}`);
        // this.waterText.setText(`Water: ${averageWater.toFixed(1)}`);
    }

    calculateAverageSun() {
        let totalSun = 0;
        for (let i = 0; i < this.sunLevels.length; i++) {
            for (let j = 0; j < this.sunLevels[i].length; j++) {
                totalSun += this.sunLevels[i][j];
            }
        }
        return totalSun / (this.sunLevels.length * this.sunLevels[0].length);
    }

    calculateAverageWater() {
        let totalWater = 0;
        for (let i = 0; i < this.waterLevels.length; i++) {
            for (let j = 0; j < this.waterLevels[i].length; j++) {
                totalWater += this.waterLevels[i][j];
            }
        }
        return totalWater / (this.waterLevels.length * this.waterLevels[0].length);
    }
    

    nextTurn() {
        this.currentTurn++;
        this.plantsPlacedThisTurn = 0; // Reset plants placed for the new turn
        
        this.turnText.setText(`Turn: ${this.currentTurn}`);
        this.plantManager.resetPlacedTurn();
        
        // Attempt to grow each placed plant
        let plantedPlants = this.plantManager.getPlaced()
        plantedPlants.forEach((plantObj) => {
            this.plantManager.growPlant(plantObj, this);
        });

        this.resetResources(); // Randomize sun and water levels for new turn
        this.plantManager.placedPlants = plantedPlants;
        console.log(this.plantManager.getPlaced());
    }
    showWinScreen() {
        // Stop any ongoing game interactions
        this.input.off('pointermove');
        this.input.off('pointerdown');

        // Create a win screen overlay
        const overlay = this.add.rectangle(
            config.width / 2, 
            config.height / 2, 
            config.width, 
            config.height, 
            0x000000, 
            0.7
        );

        // Win text
        const winText = this.add.text(
            config.width / 2, 
            config.height / 2, 
            'Congratulations!\nYou Won!', 
            { 
                fontSize: '48px', 
                color: '#ffffff', 
                align: 'center' 
            }
        ).setOrigin(0.5);

        // Restart button
        const restartButton = this.add.text(
            config.width / 2, 
            config.height / 2 + 100, 
            'Restart Game', 
            { 
                fontSize: '24px', 
                color: '#00ff00', 
                backgroundColor: '#333333',
                padding: 10 
            }
        ).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // Restart the scene
            this.scene.restart();
        });
    }
}