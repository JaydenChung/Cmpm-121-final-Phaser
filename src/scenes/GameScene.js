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

        // Plant Growth Stages
        this.PlantGrowthStage = {
            Grass: 0,
            Shrub: 1,
            Tree: 2
        };

        // Sprite sets for different plant types
        this.grassSprites = [294, 340, 338];
        this.shrubSprites = [290, 341, 303];
        this.treeSprites = [285, 342, 306];

        // Create player
        this.player = this.add.sprite(config.width/2, config.height/2, "tilemap", 334);
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

 
    handleClick(pointer) {
        // Get the grid position of the click
        const gridX = Math.floor(pointer.x / this.gridSize);
        const gridY = Math.floor(pointer.y / this.gridSize);

        // Check if clicking on a fully grown plant
        const plantToReap = this.placedPlants.find(plant => 
            plant.x === gridX && 
            plant.y === gridY && 
            plant.currentStage === this.PlantGrowthStage.Tree
        );

        if (plantToReap) {
            this.reapPlant(plantToReap);
        } else {
            // If not reaping, try to place a plant
            this.placePlant(pointer);
        }
    }

    
    reapPlant(plantObj) {
        // Check if the plant is at the final stage (Tree)
        if (plantObj.currentStage === this.PlantGrowthStage.Tree) {
            // Increment score
            this.score++;
            this.scoreText.setText(`Score: ${this.score}`);

            // Increment sowed plants
            this.sowedPlants++;

            // Remove the plant from the scene and placedPlants array
            plantObj.sprite.destroy();
            this.placedPlants = this.placedPlants.filter(plant => plant !== plantObj);

            // Check if player has won
            if (this.sowedPlants === 5) {
                this.showWinScreen();
            } else if (this.sowedPlants === this.maxSowedPlants) {
                console.log(`Game is finished, total plants sowed: ${this.sowedPlants}`);
                // Previous end game logic remains
            }
        } else {
            console.log("You can only sow final stage plants (trees).");
        }
    }

    placePlant(pointer) {
        if (this.plantsPlacedThisTurn >= this.maxPlantsPerTurn) {
            console.log("Maximum of 3 plants can be placed per turn.");
            return;
        }
        
        // Get the grid position where the user clicked
        const plantX = Math.floor(pointer.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const plantY = Math.floor(pointer.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    
        // Get the player's current grid position
        const playerX = Math.floor(this.player.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const playerY = Math.floor(this.player.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    
        // Check if the clicked position is adjacent to the player's position
        const isAdjacent = (
            (Math.abs(plantX - playerX) === this.gridSize && plantY === playerY) || // Left or right
            (Math.abs(plantY - playerY) === this.gridSize && plantX === playerX)   // Up or down
        );

        // Determine grid coordinates
        const gridX = Math.floor(plantX / this.gridSize);
        const gridY = Math.floor(plantY / this.gridSize);

        // Check if the grid cell is already occupied by a plant
        const isOccupied = this.placedPlants.some(plant => 
            plant.x === gridX && plant.y === gridY
        );
    
        if (isAdjacent && !isOccupied) {
            // Create a new plant
            const newPlant = this.add.sprite(plantX, plantY, "tilemap", this.grassSprites[this.plantIndex]);
            newPlant.scale = 4;

            // Store plant with its growth information
            this.placedPlants.push({
                sprite: newPlant,
                x: gridX,
                y: gridY,
                currentStage: this.PlantGrowthStage.Grass,
                spriteSetIndex: this.plantIndex
            });

            this.plantsPlacedThisTurn++;
        } else if (isOccupied) {
            console.log("Cannot place a plant on an already occupied grid cell.");
        } else {
            console.log("You can only place plants adjacent to the player.");
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

    growPlant(plantObj) {
        const { sprite, x, y, currentStage, spriteSetIndex } = plantObj;
    
        // Get the sun and water levels for the current grid cell
        const sunLevel = this.sunLevels[x][y];
        const waterLevel = this.waterLevels[x][y];
    
        // Check if the sun and water requirements are met for growth
        const sunRequirement = 5; // Example sun requirement
        const waterRequirement = 2; // Example water requirement
    
        if (sunLevel >= sunRequirement && waterLevel >= waterRequirement) {
            // Advance to next growth stage if not already at final stage
            if (currentStage < this.PlantGrowthStage.Tree) {
                let nextSprites;
                switch(currentStage) {
                    case this.PlantGrowthStage.Grass:
                        nextSprites = this.shrubSprites;
                        break;
                    case this.PlantGrowthStage.Shrub:
                        nextSprites = this.treeSprites;
                        break;
                }
                
                // Update sprite to next growth stage
                sprite.setTexture("tilemap", nextSprites[spriteSetIndex]);
                
                // Update plant object with new stage
                plantObj.currentStage++;
                console.log(`Plant at (${x},${y}) has grown to stage ${plantObj.currentStage}`);
            } else {
                console.log(`Plant at (${x},${y}) is fully grown!`);
            }
        } else {
            console.log(`Not enough sun (${sunLevel}) or water (${waterLevel}) to grow the plant at (${x},${y}).`);
        }
    }

    nextTurn() {
        this.currentTurn++;
        this.plantsPlacedThisTurn = 0; // Reset plants placed for the new turn
        
        this.turnText.setText(`Turn: ${this.currentTurn}`);
        
        // Attempt to grow each placed plant
        this.placedPlants.forEach((plantObj) => {
            this.growPlant(plantObj);
        });

        this.resetResources(); // Randomize sun and water levels for new turn
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
