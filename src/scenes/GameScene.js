

class GameScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'GameScene' });

        // Stacks for undo and redo functionality
        this.undoStack = [];
        this.redoStack = [];
        this.scenarioEventTurns = {};
        
    }


    init(data) {
        this.language = data.language;  // Access the passed 'language' data here
    }

    preload(){
        this.load.spritesheet("tilemap", "assets/GRASS+.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("BG", "assets/mapBG.png")
    }



    create() {
        console.log(this.language + " successfully passed in gamescene.js");
        
        this.localization = [
            {
                language: "English",
                translations: {
                    "movedup": "Moved up",
                    "moveddown": "Moved down",
                    "movedleft": "Moved left",
                    "movedright": "Moved right"
                }
            },
            {
                language: "Chinese",
                translations: {
                    "movedup": "向上移动",
                    "moveddown": "向下移动",
                    "movedleft": "向左移动",
                    "movedright": "向右移动"
                }
            },
            {
                language: "Arabic",
                translations: {
                    "movedup": "تحرك للأعلى",
                    "moveddown": "تحرك للأسفل",
                    "movedleft": "تحرك لليسار",
                    "movedright": "تحرك لليمين"
                }
            }
        ];

        this.Translations = this.localization.find(lang => lang.language === this.language).translations;

        //mobile movements
        const moveCharacter = (deltaX, deltaY) => {
            const playerSpeed = this.gridSize;
            const newX = this.player.x + (deltaX * playerSpeed);
            const newY = this.player.y + (deltaY * playerSpeed);
            
            // Snap to grid
            const gridX = Math.floor(newX / this.gridSize);
            const gridY = Math.floor(newY / this.gridSize);
            
            // Check if occupied
            const isOccupied = this.plantManager.getPlaced().some(plant => 
                plant.x === gridX && plant.y === gridY
            );
            
            if (!isOccupied) {
                this.saveState();
                this.player.x = gridX * this.gridSize + this.gridSize / 2;
                this.player.y = gridY * this.gridSize + this.gridSize / 2;
                
                // Update fading text based on direction
                if (deltaY < 0) this.updateFadingText(this.Translations.movedup);
                else if (deltaY > 0) this.updateFadingText(this.Translations.moveddown);
                else if (deltaX < 0) this.updateFadingText(this.Translations.movedleft);
                else if (deltaX > 0) this.updateFadingText(this.Translations.movedright);
            }
        };

        const plantAction = () => {
            const playerGridX = Math.floor(this.player.x / this.gridSize);
            const playerGridY = Math.floor(this.player.y / this.gridSize);
            
            // Check all adjacent cells (up, right, down, left)
            const adjacentCells = [
                {x: playerGridX, y: playerGridY - 1}, // up
                {x: playerGridX + 1, y: playerGridY}, // right
                {x: playerGridX, y: playerGridY + 1}, // down
                {x: playerGridX - 1, y: playerGridY}  // left
            ];

            // Find the first empty adjacent cell
            const emptyCell = adjacentCells.find(cell => {
                return !this.plantManager.getPlaced().some(plant => 
                    plant.x === cell.x && plant.y === cell.y
                );
            });

            if (emptyCell) {
                this.saveState();
                // Convert grid coordinates to pixel coordinates for plant placement
                const pixelX = emptyCell.x * this.gridSize + this.gridSize / 2;
                const pixelY = emptyCell.y * this.gridSize + this.gridSize / 2;
                
                // Create a mock pointer event for the plant manager
                const mockPointer = {
                    x: pixelX,
                    y: pixelY
                };
                
                this.plantManager.placePlant(mockPointer, this.plantIndex, this);
            }
        };

        const interactAction = () => {
            const playerGridX = Math.floor(this.player.x / this.gridSize);
            const playerGridY = Math.floor(this.player.y / this.gridSize);
            
            // Check all adjacent cells
            const adjacentCells = [
                {x: playerGridX, y: playerGridY - 1}, // up
                {x: playerGridX + 1, y: playerGridY}, // right
                {x: playerGridX, y: playerGridY + 1}, // down
                {x: playerGridX - 1, y: playerGridY}  // left
            ];

            let harvestedAny = false;

            // Find and harvest all fully grown plants in adjacent cells
            adjacentCells.forEach(cell => {
                const plantToReap = this.plantManager.getPlaced().find(plant => 
                    plant.x === cell.x && 
                    plant.y === cell.y && 
                    plant.currentStage === this.plantManager.PlantGrowthStage.Tree
                );

                if (plantToReap) {
                    if (!harvestedAny) {
                        this.saveState();
                        harvestedAny = true;
                    }
                    this.plantManager.reapPlant(plantToReap, this);
                }
            });
        };
        


        this.gridSize = 64;
        const backGround = this.add.image(0, 0, "BG").setOrigin(0,0)

        this.gridWidth = 10; // Adjust as needed
        this.gridHeight = 10; // Adjust as needed
        this.playerSprite = 334;

        // Initialize the grid state as a Uint8Array
        this.gridState = new gridStateManager(this.gridWidth * this.gridHeight);

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
        
        this.input.keyboard.on('keydown-Z', () => this.undo());
        this.input.keyboard.on('keydown-X', () => this.redo());

        this.input.keyboard.on('keydown-F', () => this.gridState.saveGame(this.returnGameState(), this)); 
        this.input.keyboard.on('keydown-L', () => this.gridState.loadGame(this)); 


        /**this.time.addEvent({ 
            delay: 60000, // 60 seconds
            callback: () => this.gridState.saveGame(1, this.returnGameState()),
            loop: true
        });**/

        this.plantManager = new PlantManager(this.gridSize, this.maxPlantsPerTurn);
        this.saveState('initial');
        //this.loadScenarioFromFile('tutorial');

        //Preview Plant
        this.previewSprite = this.add.sprite(0, 0, "tilemap", this.plantManager.grassSprites[this.plantIndex]);
        this.previewSprite.scale = 4
        this.previewSprite.alpha = 0.5;
        this.previewSprite.setVisible(false);

        this.fadingText = this.add.text(
            this.sys.game.config.width / 2,   // Horizontal center
            this.sys.game.config.height / 2,  // Vertical center
            '', {
                font: '32px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5, 0.5)  // Center the text's origin point
         .setAlpha(0);         // Start invisible

         const upButton = document.getElementById('up');
         const downButton = document.getElementById('down');
         const leftButton = document.getElementById('left');
         const rightButton = document.getElementById('right');
         const plantButton = document.getElementById('plant');
         const interactButton = document.getElementById('interact');
         const undoButton = document.getElementById('undo');
         const redoButton = document.getElementById('redo');
         const saveButton = document.getElementById('save');
         const loadButton = document.getElementById('load');
         const selectOneButton = document.getElementById('selectOne');
         const selectTwoButton = document.getElementById('selectTwo');
         const selectThreeButton = document.getElementById('selectThree');
         const nextTurnButton = document.getElementById('nextTurn');
    
 
         // Event Listeners for Movement
         upButton.addEventListener('click', () => moveCharacter(0, -1));
         downButton.addEventListener('click', () => moveCharacter(0, 1));
         leftButton.addEventListener('click', () => moveCharacter(-1, 0));
         rightButton.addEventListener('click', () => moveCharacter(1, 0));
 
         // Event Listeners for Actions
         plantButton.addEventListener('click', () => plantAction());
         interactButton.addEventListener('click', () => interactAction());
 
         // Event Listeners for Additional Controls
         undoButton.addEventListener('click', () => this.undo());
         redoButton.addEventListener('click', () => this.redo());
         saveButton.addEventListener('click', () => this.gridState.saveGame(this.returnGameState(), this)); 
         loadButton.addEventListener('click', () => this.gridState.loadGame(this)); 
 
         // Event Listeners for Plant Selection
         selectOneButton.addEventListener('click', () => this.updateIndex(0));
         selectTwoButton.addEventListener('click', () => this.updateIndex(1));
         selectThreeButton.addEventListener('click', () =>this.updateIndex(2));
         nextTurnButton.addEventListener('click', () => this.nextTurn());
 
    }

    update() {
        const playerSpeed = this.gridSize;
        let newX = this.player.x;
        let newY = this.player.y;

        if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
            newY -= playerSpeed;
            this.saveState();
            this.updateFadingText(this.Translations.movedup); // Use the localized text
        } else if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
            newY += playerSpeed;
            this.saveState();
            this.updateFadingText(this.Translations.moveddown); // Use the localized text
        } else if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
            newX -= playerSpeed;
            this.saveState();
            this.updateFadingText(this.Translations.movedleft); // Use the localized text
        } else if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
            newX += playerSpeed;
            this.saveState();
            this.updateFadingText(this.Translations.movedright); // Use the localized text
        } else if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            this.nextTurn();
            return;
        }

        // Snap new position to grid
        const gridX = Math.floor(newX / this.gridSize);
        const gridY = Math.floor(newY / this.gridSize);

        // Check if the new grid cell is occupied by a plant
        const isOccupied = this.plantManager.getPlaced().some(plant => 
            plant.x === gridX && plant.y === gridY
        );

        // Only move if the cell is not occupied
        if (!isOccupied) {
            this.player.x = gridX * this.gridSize + this.gridSize / 2;
            this.player.y = gridY * this.gridSize + this.gridSize / 2;
        }

        // Plant Switch
        if (Phaser.Input.Keyboard.JustDown(this.oneKey)) {
            this.updateIndex(0)
        } else if (Phaser.Input.Keyboard.JustDown(this.twoKey)) {
            this.updateIndex(1)
        } else if (Phaser.Input.Keyboard.JustDown(this.threeKey)) {
            this.updateIndex(2)
        }
    
        // Snap player position to the center of the grid
        this.player.x = Math.floor(this.player.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        this.player.y = Math.floor(this.player.y / this.gridSize) * this.gridSize + this.gridSize / 2;
    }

    returnGameState(){
        return {
            gridState: Array.from(this.gridState.getGridState()), // Convert Uint8Array to normal array
            player: this.player,
            playerX: this.player.x,
            playerY: this.player.y,
            score: this.score,
            turn: this.currentTurn,
            placedDownPlants: this.plantManager.getPlaced()
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
            this.saveState();
            this.plantManager.reapPlant(plantToReap, this);
            
        } else {
            // If not reaping, try to place a plant
            this.saveState();
            this.plantManager.placePlant(pointer, this.plantIndex, this);
            
        }
    }

    
    
    updateHighlight(pointer) {
        // Snap highlight to the nearest grid space
        const highlightX = Math.floor(pointer.x / this.gridSize) * this.gridSize + this.gridSize / 2;
        const highlightY = Math.floor(pointer.y / this.gridSize) * this.gridSize + this.gridSize / 2;

        this.previewSprite.setPosition(highlightX, highlightY);
        this.previewSprite.setVisible(true);
    
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
            this.gridState.applyState(this, previousState);
        }else if(this.undoStack.length == 0){
            this.gridState.applyState(this, previousState);
        }
    }

    // Enhanced redo method
    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            this.gridState.applyState(this, nextState);
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
            }
        }
        
        // Grow plants from both placedPlants and plantManager
        [...this.placedPlants, ...this.plantManager.getPlaced()].forEach((plantObj) => {
            // Ensure each plant has a sprite and current stage
            if (plantObj.sprite && plantObj.currentStage !== undefined) {
                this.plantManager.growPlant(plantObj, this);
            }
        });

        this.plantManager.plantsPlacedThisTurn = 0;
    
        this.resetResources();
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
            console.log('Processing plant:', plant);

            const plantX = plant.location[0];
            const plantY = plant.location[1];
            const plantPixelX = plantX * this.gridSize + this.gridSize / 2;
            const plantPixelY = plantY * this.gridSize + this.gridSize / 2;

            // Add more detailed logging and error checking
            console.log('Growth Stage:', plant.growth_stage);
            console.log('Sprite Variation:', plant.sprite_variation);

            // Directly use numeric values instead of referencing PlantGrowthStage
            let spriteSet;
            switch(plant.growth_stage) {
                case 2: // Tree stage
                    spriteSet = this.plantManager.treeSprites;
                    break;
                case 1: // Shrub stage
                    spriteSet = this.plantManager.shrubSprites;
                    break;
                default: // Grass stage
                    spriteSet = this.plantManager.grassSprites;
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
                case 2: // Tree stage
                    spriteSet = this.plantManager.treeSprites;
                    break;
                case 1: // Shrub stage
                    spriteSet = this.plantManager.shrubSprites;
                    break;
                default: // Grass stage
                    spriteSet = this.plantManager.grassSprites;
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
    updateIndex(index){
        this.plantIndex = index;
        this.previewSprite.setTexture("tilemap", this.plantManager.grassSprites[this.plantIndex])
    }

    updateFadingText(message) {
        // Update text content and fade it in/out
        this.fadingText.setText(message);
        this.fadingText.setStyle({ fill: '#00ffff' });
        this.tweens.add({
            targets: this.fadingText,
            alpha: 1, // Fade in
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.tweens.add({
                        targets: this.fadingText,
                        alpha: 0, // Fade out
                        duration: 500,
                        ease: 'Linear'
                    });
                });
            }
        });
    }
}


