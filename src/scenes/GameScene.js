class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Stacks for undo and redo functionality
        this.undoStack = [];
        this.redoStack = [];
        this.scenarioEventTurns = {};
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
        this.input.on('pointerdown', this.placePlant, this);

        // Player controls
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);    
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);    
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); 
        this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE); 
        this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO); 
        this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        
        this.input.keyboard.on('keydown-Z', () => this.undo());
        this.input.keyboard.on('keydown-X', () => this.redo());

        this.input.keyboard.on('keydown-K', () => this.saveGameToStorage());
        this.input.keyboard.on('keydown-L', () => this.loadGameFromStorage());

        this.time.addEvent({ 
            delay: 60000, // 60 seconds
            callback: () => this.saveGameToStorage(),
            loop: true
        });

        this.saveState('initial');
        this.loadScenarioFromFile('tutorial');
    }

    update() {
        const playerSpeed = this.gridSize;

        // Move the player and snap to grid
        if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.player.y -= playerSpeed;
            this.saveState(); // Save state after movement
        } else if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.player.y += playerSpeed;
            this.saveState(); // Save state after movement
        } else if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
            this.player.x -= playerSpeed;
            this.saveState(); // Save state after movement
        } else if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
            this.player.x += playerSpeed;
            this.saveState(); // Save state after movement
        } else if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            this.nextTurn();
        }

        // Plant Switch
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

    

    saveState(actionType = 'unknown') {
        const state = {
            playerX: this.player.x,
            playerY: this.player.y,
            currentTurn: this.currentTurn,
            sun: this.sun,
            water: this.water,
            placedPlants: this.placedPlants.map(plant => ({
                x: plant.x,
                y: plant.y,
                currentStage: plant.currentStage,
                spriteSetIndex: plant.spriteSetIndex,
                spriteFrame: plant.sprite.frame.name
            })),
            sunLevels: this.sunLevels.map(row => [...row]),
            waterLevels: this.waterLevels.map(row => [...row]),
            lastAction: actionType // Add action metadata
        };
        this.undoStack.push(state);
        this.redoStack = []; // Clear redo stack whenever a new action is performed
    }

    // Enhanced undo method
    undo() {
        if (this.undoStack.length > 1) { // Keep at least one state for reset
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);
            const previousState = this.undoStack[this.undoStack.length - 1];
            this.applyState(previousState);
        }else if(this.undoStack.length == 0){
            this.applyState(previousState);
        }
    }

    // Enhanced redo method
    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            this.applyState(nextState);
        }
    }

    applyState(state) {
        // Restore player position
        this.player.x = state.playerX;
        this.player.y = state.playerY;
        
        // Restore turn and resources
        this.currentTurn = state.currentTurn;
        this.sun = state.sun;
        this.water = state.water;
        this.turnText.setText(`Turn: ${this.currentTurn}`);
        this.sunText.setText(`Sun: ${this.sun}`);
        this.waterText.setText(`Water: ${this.water}`);
    
        // Clear existing plants
        this.placedPlants.forEach(plant => plant.sprite.destroy());
        this.placedPlants = [];
    
        // Restore placed plants
        state.placedPlants.forEach(plantData => {
            const newPlant = this.add.sprite(
                plantData.x * this.gridSize + this.gridSize / 2, 
                plantData.y * this.gridSize + this.gridSize / 2, 
                "tilemap", 
                plantData.spriteFrame
            );
            newPlant.scale = 4;
            this.placedPlants.push({
                sprite: newPlant,
                x: plantData.x,
                y: plantData.y,
                currentStage: plantData.currentStage,
                spriteSetIndex: plantData.spriteSetIndex
            });
        });
    
        // **Update the plantsPlacedThisTurn counter**
        this.plantsPlacedThisTurn = this.placedPlants.length;
    
        // Restore sun and water levels
        this.sunLevels = state.sunLevels.map(row => [...row]);
        this.waterLevels = state.waterLevels.map(row => [...row]);
    }

    placePlant(pointer) {
        if (this.plantsPlacedThisTurn >= this.maxPlantsPerTurn) {
            console.log("Maximum of 3 plants can be placed per turn.");
            return false;
        }
        
        // Get the grid position where the user clicked
        const plantX = Math.floor(pointer.x / this.gridSize);
        const plantY = Math.floor(pointer.y / this.gridSize);
        
        // Check if a plant already exists at this grid position
        const isOccupied = this.placedPlants.some(
            (plant) => plant.x === plantX && plant.y === plantY
        );
    
        if (isOccupied) {
            console.log(`Cannot place a plant at (${plantX}, ${plantY}). Space already occupied!`);
            return false;
        }
    
        // Get the player's current grid position
        const playerX = Math.floor(this.player.x / this.gridSize);
        const playerY = Math.floor(this.player.y / this.gridSize);
    
        // Check if the clicked position is adjacent to the player's position
        const isAdjacent = (
            (Math.abs(plantX - playerX) === 1 && plantY === playerY) || // Left or right
            (Math.abs(plantY - playerY) === 1 && plantX === playerX)   // Up or down
        );
    
        if (isAdjacent) {
            // Calculate actual pixel coordinates for the new plant sprite
            const plantPixelX = plantX * this.gridSize + this.gridSize / 2;
            const plantPixelY = plantY * this.gridSize + this.gridSize / 2;
    
            // Create the new plant sprite
            const newPlant = this.add.sprite(
                plantPixelX, 
                plantPixelY, 
                "tilemap", 
                this.grassSprites[this.plantIndex]
            );
            newPlant.scale = 4;
    
            // Add this plant to the list of placedPlants
            this.placedPlants.push({
                sprite: newPlant,
                x: plantX,
                y: plantY,
                currentStage: this.PlantGrowthStage.Grass,
                spriteSetIndex: this.plantIndex
            });
    
            this.plantsPlacedThisTurn++;
            
            // Save state after successful placement
            this.saveState('plant');
            console.log(`Plant successfully placed at (${plantX}, ${plantY}).`);
            return true;
        } else {
            console.log("You can only place plants adjacent to the player.");
            return false;
        }
    }

    nextTurn() {
        // Save state before advancing turn
        this.saveState();
        
        // Existing turn advancement logic
        this.currentTurn++;
        this.plantsPlacedThisTurn = 0;
        this.turnText.setText(`Turn: ${this.currentTurn}`);
        const turnEvent = this.scenarioEventTurns[this.currentTurn];
        if (turnEvent) {
            switch(turnEvent.type) {
                case 'spawn_plant':
                    this.spawnScenarioPlant(turnEvent);
                    break;
                case 'randomize_resources':
                    this.applyResourceRandomization(turnEvent);
                    break;
                // Add other event type handlers as needed
            }
        }
        
        // Attempt to grow each placed plants
        this.placedPlants.forEach((plantObj) => {
            this.growPlant(plantObj);
        });

        this.resetResources();
    }

    saveGameToStorage() {
        if (this.undoStack.length > 0) {
            const saveData = {
                undoStack: this.undoStack,   // Save all undo states
                redoStack: this.redoStack   // Save all redo states
            };
            localStorage.setItem('saveGame', JSON.stringify(saveData));
            console.log('Game state (including undo/redo) saved to storage!');
        } else {
            console.log('No game state to save.');
        }
    }
    
    loadGameFromStorage() {
        const saveData = localStorage.getItem('saveGame');
        if (saveData) {
            const parsedData = JSON.parse(saveData);
    
            // Restore undo and redo stacks
            this.undoStack = parsedData.undoStack || [];  // Fallback to empty array if undefined
            this.redoStack = parsedData.redoStack || [];  // Fallback to empty array if undefined
    
            // Apply the latest state from the undoStack
            const latestState = this.undoStack[this.undoStack.length - 1];
            if (latestState) {
                this.applyState(latestState);
                console.log('Game state and undo/redo stacks restored from storage!');
            } else {
                console.log('No valid game state found in undo stack.');
            }
        } else {
            console.log('No saved game state found in storage.');
        }
    }

    async loadScenarioFromFile(scenarioName) {
        try {
            const response = await fetch(`src/scenarios/${scenarioName}.json`);
            const scenarioData = await response.json();
            
            // Check if scenario exists
            if (!scenarioData.scenarios || !scenarioData.scenarios[scenarioName]) {
                console.error(`Scenario ${scenarioName} not found`);
                return;
            }
            
            // Pass specific scenario to apply method
            this.applyScenario(scenarioData.scenarios[scenarioName]);
        } catch (error) {
            console.error('Failed to load scenario:', error);
        }
    }
    
    // Method to apply a loaded scenario
    applyScenario(scenarioData) {
        // Reset game state
        this.resetGameState();
    
        // Apply initial conditions
        const initialConditions = scenarioData.initial_conditions;
        
        // Set player position
        if (initialConditions.player_start_position) {
            this.player.x = initialConditions.player_start_position[0] * this.gridSize + this.gridSize / 2;
            this.player.y = initialConditions.player_start_position[1] * this.gridSize + this.gridSize / 2;
        }
    
        // Set starting resources
        if (initialConditions.starting_resources) {
            this.sun = initialConditions.starting_resources.sun || 0;
            this.water = initialConditions.starting_resources.water || 0;
            
            this.sunText.setText(`Sun: ${this.sun}`);
            this.waterText.setText(`Water: ${this.water}`);
        }
    
        // Place initial plants
        if (initialConditions.starting_plants) {
            initialConditions.starting_plants.forEach(plant => {
                const plantX = plant.location[0];
                const plantY = plant.location[1];
                const plantPixelX = plantX * this.gridSize + this.gridSize / 2;
                const plantPixelY = plantY * this.gridSize + this.gridSize / 2;
    
                // Select appropriate sprite set based on growth stage
                let spriteSet;
                switch(plant.growth_stage) {
                    case this.PlantGrowthStage.Tree:
                        spriteSet = this.treeSprites;
                        break;
                    case this.PlantGrowthStage.Shrub:
                        spriteSet = this.shrubSprites;
                        break;
                    default:
                        spriteSet = this.grassSprites;
                }
    
                const spriteIndex = plant.sprite_variation !== undefined 
                    ? Math.min(2, Math.max(0, plant.sprite_variation))
                    : 0;
                
                const spriteFrame = spriteSet[spriteIndex];
    
                const newPlant = this.add.sprite(
                    plantPixelX, 
                    plantPixelY, 
                    "tilemap", 
                    spriteFrame
                );
                newPlant.scale = 4;
    
                this.placedPlants.push({
                    sprite: newPlant,
                    x: plantX,
                    y: plantY,
                    currentStage: plant.growth_stage,
                    spriteSetIndex: spriteIndex
                });
            });
        }
    
        // Schedule scenario events
        if (scenarioData.events) {
            this.scenarioEvents = scenarioData.events;
            this.processScenarioEvents();
        }
    
        // Set victory conditions
        this.victoryConditions = scenarioData.victory_conditions || {};
    }
    
    // Method to process scenario events
    processScenarioEvents() {
        if (!this.scenarioEvents) return;
    
        this.scenarioEvents.forEach((event, index) => {
            // If event has a specific turn, store it
            if (event.turn) {
                this.scenarioEventTurns[event.turn] = event;
            }
        });
    }
    
    
    // Helper methods for scenario events
    spawnScenarioPlant(event) {
        if (!event.location) return;
    
        const plantX = event.location[0];
        const plantY = event.location[1];
        const plantPixelX = plantX * this.gridSize + this.gridSize / 2;
        const plantPixelY = plantY * this.gridSize + this.gridSize / 2;
    
        // Get growth stage from event, default to Grass if not specified
        const growthStage = event.growth_stage !== undefined 
            ? event.growth_stage 
            : this.PlantGrowthStage.Grass;
    
        // Select appropriate sprite set based on growth stage
        let spriteSet;
        switch(growthStage) {
            case this.PlantGrowthStage.Tree:
                spriteSet = this.treeSprites;
                break;
            case this.PlantGrowthStage.Shrub:
                spriteSet = this.shrubSprites;
                break;
            default:
                spriteSet = this.grassSprites;
        }
    
        // Use the specified sprite variation or default to the first one
        const spriteIndex = event.sprite_variation !== undefined 
            ? Math.min(2, Math.max(0, event.sprite_variation))
            : 0;
        
        const spriteFrame = spriteSet[spriteIndex];
    
        const newPlant = this.add.sprite(
            plantPixelX, 
            plantPixelY, 
            "tilemap", 
            spriteFrame
        );
        newPlant.scale = 4;
    
        this.placedPlants.push({
            sprite: newPlant,
            x: plantX,
            y: plantY,
            currentStage: growthStage,
            spriteSetIndex: spriteIndex
        });
    }
    
    applyResourceRandomization(event) {
        const intensityMap = {
            'low': { sunRange: [0, 5], waterRange: [0, 3] },
            'medium': { sunRange: [3, 8], waterRange: [2, 5] },
            'high': { sunRange: [5, 10], waterRange: [4, 7] }
        };
    
        const intensity = event.intensity || 'medium';
        const { sunRange, waterRange } = intensityMap[intensity];
    
        const gridCols = Math.ceil(this.sys.game.config.width / this.gridSize);
        const gridRows = Math.ceil(this.sys.game.config.height / this.gridSize);
    
        for (let i = 0; i < gridCols; i++) {
            for (let j = 0; j < gridRows; j++) {
                this.sunLevels[i][j] = Phaser.Math.Between(sunRange[0], sunRange[1]);
                this.waterLevels[i][j] = Phaser.Math.Between(waterRange[0], waterRange[1]);
            }
        }
    }
    
    applyWeatherEffect(event) {
        switch(event.effect) {
            case 'drought':
                // Reduce water levels across the grid
                this.waterLevels = this.waterLevels.map(row => 
                    row.map(water => Math.max(0, water - 2))
                );
                break;
            case 'rain':
                // Increase water levels across the grid
                this.waterLevels = this.waterLevels.map(row => 
                    row.map(water => Math.min(10, water + 2))
                );
                break;
        }
    }
    
    spawnObstacle(event) {
        // Placeholder for obstacle spawning logic
        console.log('Spawning obstacle:', event.type);
    }
    
    // Method to check victory conditions at the end of each turn
    checkVictoryConditions() {
        // Check tree growth condition
        if (this.victoryConditions.grow_trees) {
            const treesGrown = this.placedPlants.filter(
                p => p.currentStage === this.PlantGrowthStage.Tree
            ).length;
            
            if (treesGrown >= this.victoryConditions.grow_trees) {
                this.gameWin();
            }
        }
    
        // Check turns limit
        if (this.victoryConditions.turns_limit && 
            this.currentTurn > this.victoryConditions.turns_limit) {
            this.gameLose();
        }
    
        // Add more victory condition checks as needed
    }
    
    // Placeholder methods for win/lose game states
    gameWin() {
        console.log('Scenario completed successfully!');
        // Add win screen or transition logic
    }
    
    gameLose() {
        console.log('Scenario failed!');
        // Add lose screen or retry logic
    }
    
    // Reset game state method
    resetGameState() {
        // Clear existing plants
        this.placedPlants.forEach(plant => plant.sprite.destroy());
        this.placedPlants = [];
    
        // Reset turn and resources
        this.currentTurn = 1;
        this.plantsPlacedThisTurn = 0;
        this.turnText.setText('Turn: 1');
    
        // Reset resources
        this.sun = 0;
        this.water = 0;
        this.resetResources();
    }

}
