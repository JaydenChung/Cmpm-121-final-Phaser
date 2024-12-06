//base class, shouldnt use
class PlantManager{
    constructor(g, m){
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
    }

    getPlaced(){
        return this.placedPlants;

    }

    placePlant(pointer, plantIndex, game) {
        if (this.plantsPlacedThisTurn >= this.maxPlantsPerTurn) {
            console.log("Maximum of 3 plants can be placed per turn.");
            return;
        }
        
        // Get the grid position where the user clicked
        const plantX = Math.floor(pointer.x / this.GridSize) * this.GridSize + this.GridSize / 2;
        const plantY = Math.floor(pointer.y / this.GridSize) * this.GridSize + this.GridSize / 2;
    
        // Get the player's current grid position
        const playerX = Math.floor(game.player.x / this.GridSize) * this.GridSize + this.GridSize / 2;
        const playerY = Math.floor(game.player.y / this.GridSize) * this.GridSize + this.GridSize / 2;
    
        // Check if the clicked position is adjacent to the player's position
        const isAdjacent = (
            (Math.abs(plantX - playerX) === this.GridSize && plantY === playerY) || // Left or right
            (Math.abs(plantY - playerY) === this.GridSize && plantX === playerX)   // Up or down
        );

        // Determine grid coordinates
        const gridX = Math.floor(plantX / this.GridSize);
        const gridY = Math.floor(plantY / this.GridSize);

        // Check if the grid cell is already occupied by a plant
        const isOccupied = this.placedPlants.some(plant => 
            plant.x === gridX && plant.y === gridY
        );
    
        if (isAdjacent && !isOccupied) {
            // Create a new plant
            const newPlant = game.add.sprite(plantX, plantY, "tilemap", this.grassSprites[plantIndex]);
            newPlant.scale = 4;

            // Store plant with its growth information
            this.placedPlants.push({
                sprite: newPlant,
                x: gridX,
                y: gridY,
                currentStage: this.PlantGrowthStage.Grass,
                spriteSetIndex: plantIndex
            });

            this.plantsPlacedThisTurn++;
        } else if (isOccupied) {
            console.log("Cannot place a plant on an already occupied grid cell.");
        } else {
            console.log("You can only place plants adjacent to the player.");
        }
    }

    reapPlant(plantObj, game) {
        // Check if the plant is at the final stage (Tree)
        if (plantObj.currentStage === this.PlantGrowthStage.Tree) {
            // Increment score
            game.score++;
            game.scoreText.setText(`Score: ${game.score}`);

            // Increment sowed plants
            game.sowedPlants++;

            // Remove the plant from the scene and placedPlants array
            plantObj.sprite.destroy();
            game.placedPlants = game.placedPlants.filter(plant => plant !== plantObj);

            // Check if player has won
            if (game.sowedPlants === 5) {
                game.showWinScreen();
            } else if (this.sowedPlants === game.maxSowedPlants) {
                console.log(`Game is finished, total plants sowed: ${game.sowedPlants}`);
                // Previous end game logic remains
            }
        } else {
            console.log("You can only sow final stage plants (trees).");
        }
    }

    growPlant(plantObj, game) {
        const { sprite, x, y, currentStage, spriteSetIndex } = plantObj;
        // Add bounds checking before accessing sun and water levels
        if (x < 0 || x >= game.sunLevels.length || 
            y < 0 || y >= game.sunLevels[0].length) {
            console.log(x>=game.sunLevels.length, y >= game.sunLevels[0].length);
            console.error(`Invalid grid coordinates: (${x}, ${y})`);
            return;
        }

        // Get the sun and water levels for the current grid cell
        const sunLevel = game.sunLevels[x][y];
        const waterLevel = game.waterLevels[x][y];

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

    getPlacedTurn(){
        return this.plantsPlacedThisTurn;
    }
    resetPlacedTurn(){
        this.plantsPlacedThisTurn = 0;
    }


}


class Plants{
    constructor(){
        this.sunLevel = 1;
        this.waterLevel = 1;
        this.plantStage = 1; //1 = seed, 3 = max, 0 = ded

        //creates a random ID
        this.plantID = Math.floor(342 * generateRandom()) + Math.floor(generateRandom()*2/342); 
    }

    getWater(){return this.waterLevel;}
    setWater(water){this.water = water;}

    getSun(){return this.sunLevel;}
    setSun(){return this.sunLevel;}

    getPlantStage(){return this.plantStage;}
    setPlantStage(stage){
        if (stage > 4 || stage < 0){
            console.warn("setPlantStage() error: stage = ", stage, ", must be between 0 & 3");
        }
        this.plantStage = stage;
    }

    getID(){return this.plantID;}
    setID(ID){this.plantID = ID;}
}



//use bellow instead

function generateRandom(){
    return Math.random() * (1 - 1000) + 1;
}

class PlantA extends Plants{
    constructor(sprite){
        super();
        this.plantObject = sprite;
        this.updateCondition = false;
    }

    setIfUpdate(){ //checks if the plant can be updated or not

        if (true){ //to add conditions l8r, plant specific
            this.updateCondition = true;
        } else {
            this.updateCondition = false;
        }
    }

    updatePlant(){

        if (this.updateCondition){
            this.setPlantStage(this.getPlantStage + 1);
        } else {
            this.setPlantStage(this.getPlantStage - 1);
        }

    }
}
