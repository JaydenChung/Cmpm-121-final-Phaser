class PlantManager {
    constructor(g, m) {
        this.placedPlants = [];
        this.GridSize = g;
        this.plantsPlacedThisTurn = 0;
        this.maxPlantsPerTurn = m;

        //plant growth stages
        this.PlantGrowthStage = {
            Grass: 0,
            Shrub: 1,
            Tree: 2
        };

        // Sprite sets for different plant types
        this.grassStage1 = 294;
        this.grassStage2 = 340;
        this.grassStage3 = 338;

        this.shrubStage1 = 290;
        this.shrubStage2 = 341;
        this.shrubStage3 = 303;

        this.treeStage1 = 285;
        this.treeStage2 = 342;
        this.treeStage3 = 306;

        this.grassSprites = [this.grassStage1, this.grassStage2, this.grassStage3];
        this.shrubSprites = [this.shrubStage1, this.shrubStage2, this.shrubStage3];
        this.treeSprites = [this.treeStage1, this.treeStage2, this.treeStage3];

        // Initialize plant registry
        this.plantRegistry = new PlantRegistry();
        this.initializePlantTypes();
    }

    initializePlantTypes() {
        // Basic Plant - Balanced growth requirements
        this.plantRegistry.define('BasicPlant')
            .requiresSunlight(3, 7)
            .requiresWater(2, 6)
            .withSprites(this.grassSprites[0], this.shrubSprites[0], this.treeSprites[0]);

        // Desert Plant - Needs lots of sun, little water
        this.plantRegistry.define('DesertPlant')
            .requiresSunlight(6, 10)
            .requiresWater(1, 4)
            .withSprites(this.grassSprites[1], this.shrubSprites[1], this.treeSprites[1]);

        // Jungle Plant - Needs lots of water, moderate sun, grows better near others
        this.plantRegistry.define('JunglePlant')
            .requiresSunlight(2, 6)
            .requiresWater(5, 10)
            .requiresNeighborType('JunglePlant')
            .withSprites(this.grassSprites[2], this.shrubSprites[2], this.treeSprites[2]);
    }

    // Rest of your existing methods...
    getPlaced() {
        return this.placedPlants;
    }

    placePlant(pointer, plantIndex, game) {
        if (this.plantsPlacedThisTurn >= this.maxPlantsPerTurn) {
            game.updateFadingText('Maximum of 3 plants \ncan be placed per turn.');
            return;
        }
        
        const plantX = Math.floor(pointer.x / this.GridSize) * this.GridSize + this.GridSize / 2;
        const plantY = Math.floor(pointer.y / this.GridSize) * this.GridSize + this.GridSize / 2;
    
        const playerX = Math.floor(game.player.x / this.GridSize) * this.GridSize + this.GridSize / 2;
        const playerY = Math.floor(game.player.y / this.GridSize) * this.GridSize + this.GridSize / 2;
    
        const isAdjacent = (
            (Math.abs(plantX - playerX) === this.GridSize && plantY === playerY) ||
            (Math.abs(plantY - playerY) === this.GridSize && plantX === playerX)
        );

        const gridX = Math.floor(plantX / this.GridSize);
        const gridY = Math.floor(plantY / this.GridSize);

        const isOccupied = this.placedPlants.some(plant => 
            plant.x === gridX && plant.y === gridY
        );
    
        if (isAdjacent && !isOccupied) {
            // Map plantIndex to plant type
            const plantTypes = ['BasicPlant', 'DesertPlant', 'JunglePlant'];
            const plantType = this.plantRegistry.get(plantTypes[plantIndex]);
            
            const newPlant = game.add.sprite(plantX, plantY, "tilemap", this.grassSprites[plantIndex]);
            newPlant.scale = 4;

            this.placedPlants.push({
                sprite: newPlant,
                x: gridX,
                y: gridY,
                currentStage: this.PlantGrowthStage.Grass,
                spriteSetIndex: plantIndex,
                plantTypeName: plantTypes[plantIndex]
            });

            this.plantsPlacedThisTurn++;
        } else if (isOccupied) {
            game.updateFadingText("Cannot place a plant on an\n already occupied grid cell.");
        } else {
            game.updateFadingText("You can only place plants\n adjacent to the player.");
        }
    }

    growPlant(plantObj, game) {
        const { x, y, currentStage, spriteSetIndex, plantTypeName } = plantObj;
        
        if (x < 0 || x >= game.sunLevels.length || y < 0 || y >= game.sunLevels[0].length) {
            console.error(`Invalid grid coordinates: (${x}, ${y})`);
            return;
        }

        const plantType = this.plantRegistry.get(plantTypeName);
        
        if (plantType && plantType.canGrow(game, x, y)) {
            if (currentStage < this.PlantGrowthStage.Tree) {
                let nextSprite;
                if (currentStage === this.PlantGrowthStage.Grass) {
                    nextSprite = this.shrubSprites[spriteSetIndex];
                } else if (currentStage === this.PlantGrowthStage.Shrub) {
                    nextSprite = this.treeSprites[spriteSetIndex];
                }
                
                plantObj.sprite.setTexture("tilemap", nextSprite);
                plantObj.currentStage++;
                console.log(`${plantTypeName} at (${x},${y}) has grown to stage ${plantObj.currentStage}`);
            }
        }
    }

    reapPlant(plantObj, game) {
        if (plantObj.currentStage === this.PlantGrowthStage.Tree) {
            game.score++;
            game.scoreText.setText(`Score: ${game.score}`);
            game.sowedPlants++;

            plantObj.sprite.destroy();
            this.placedPlants = this.placedPlants.filter(plant => plant !== plantObj);

            if (game.sowedPlants === 5) {
                game.showWinScreen();
            } else if (game.sowedPlants === game.maxSowedPlants) {
                game.updateFadingText(`Game is finished, \ntotal plants sowed: ${game.sowedPlants}`);
            }
        } else {
            game.updateFadingText("You can only sow \nfinal stage plants (trees).");
        }
    }

    getPlacedTurn() {
        return this.plantsPlacedThisTurn;
    }

    resetPlacedTurn() {
        this.plantsPlacedThisTurn = 0;
    }
}