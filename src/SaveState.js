class gridStateManager{
    constructor(width, height){
        this.gridState = new Uint8Array(width * height);
    }
    getGridState(){
        return this.gridState;
    }
    getGridIndex(i){
        return this.gridState[i];
    }
    setGridValue(x, y, value) {
        const index = y * this.gridWidth + x;
        this.gridState.getGridIndex(index) = value;
    }
    updateGridState(state){
        this.gridState = state;
    }


    saveGame(slot, slotData) {
        const saveData = {
            gridState: Array.from(slotData.gridState), // Convert Uint8Array to normal array
            playerX: slotData.playerX,
            playerY: slotData.playerY,
            score: slotData.score,
            turn: slotData.turn,

            // Serialize placedPlants without the sprite reference
            placedPlants: slotData.placedDownPlants.map(plant => ({
                x: plant.x,
                y: plant.y,
                currentStage: plant.currentStage,
                spriteSetIndex: plant.spriteSetIndex
            }))
        };

        localStorage.setItem(`saveSlot${slot}`, JSON.stringify(saveData));
        console.log(`Game saved in slot ${slot}`);
    }
    loadGame(slot, game) { //passing game object ITSELF (this) into loadGame
                            //should never do normally
        const saveData = JSON.parse(localStorage.getItem(`saveSlot${slot}`));
    
        if (!saveData) {
            console.error(`No save data found in slot ${slot}`);
            return;
        }
        console.log(game);
        // Restore grid state
        this.updateGridState(Uint8Array.from(saveData.gridState));
    
        // Restore player position
        game.player.setPosition(saveData.playerX, saveData.playerY);
    
        // Restore score and turn
        game.score = saveData.score;
        game.currentTurn = saveData.turn;
    
        // Update displayed score and turn
        console.log(saveData);
        game.scoreText.setText(`Score: ${saveData.score}`);
        game.turnText.setText(`Turn: ${saveData.turn}`);
    
        // Restore placed plants
        game.placedPlants = saveData.placedPlants.map(plant => {
            // Determine the correct sprite set based on the saved growth stage
            let spriteSet;
            switch (plant.currentStage) {
                case game.PlantGrowthStage.Grass:
                    spriteSet = game.grassSprites;
                    break;
                case game.PlantGrowthStage.Shrub:
                    spriteSet = game.shrubSprites;
                    break;
                case game.PlantGrowthStage.Tree:
                    spriteSet = game.treeSprites;
                    break;
                default:
                    console.error(`Unknown growth stage: ${plant.currentStage}`);
                    return null;
            }
    
            // Create a new sprite with the correct texture
            const newPlantSprite = game.add.sprite(
                plant.x * game.gridSize + game.gridSize / 2,
                plant.y * game.gridSize + game.gridSize / 2,
                "tilemap",
                spriteSet[plant.spriteSetIndex]
            );
            newPlantSprite.scale = 4;
            let copyX = plant.x;
            let copyY = plant.y;

            return {
                sprite: newPlantSprite,
                x: plant.x,
                y: plant.y,
                currentStage: plant.currentStage,
                spriteSetIndex: plant.spriteSetIndex
            };
            
        });
    
        console.log(`Game loaded from slot ${slot}`);
    }
}