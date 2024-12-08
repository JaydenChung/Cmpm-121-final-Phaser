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

    applyState(game, state) {
        // Restore player position
        console.log(state);
        game.player.x = state.playerX;
        game.player.y = state.playerY;
        
        // Restore turn and resources
        game.currentTurn = state.currentTurn;
        game.sun = state.sun;
        game.water = state.water;
        game.turnText.setText(`Turn: ${game.currentTurn}`);
        game.sunText.setText(`Sun: ${game.sun}`);
        game.waterText.setText(`Water: ${game.water}`);
    
        // Clear existing plants
        game.placedPlants.forEach(plant => plant.sprite.destroy());
        game.placedPlants = [];
    
        // Restore placed plants
        state.placedPlants.forEach(plantData => {
            const newPlant = game.add.sprite(
                plantData.x * game.gridSize + game.gridSize / 2, 
                plantData.y * game.gridSize + game.gridSize / 2, 
                "tilemap", 
                plantData.spriteFrame
            );
            newPlant.scale = 4;
            game.placedPlants.push({
                sprite: newPlant,
                x: plantData.x,
                y: plantData.y,
                currentStage: plantData.currentStage,
                spriteSetIndex: plantData.spriteSetIndex
            });
        });
    
        // **Update the plantsPlacedThisTurn counter**
        game.plantsPlacedThisTurn = game.placedPlants.length;
    
        // Restore sun and water levels
        game.sunLevels = state.sunLevels.map(row => [...row]);
        game.waterLevels = state.waterLevels.map(row => [...row]);
    }


    saveGame(slotData, game) {
        if (game.undoStack.length > 0) {
            console.log(slotData);
            const saveData = {
                undoStack: game.undoStack,   // Save all undo states
                redoStack: game.redoStack,   // Save all redo states

                // Serialize placedPlants without the sprite reference
                placedPlants: slotData.placedDownPlants.map(plant => ({
                x: plant.x,
                y: plant.y,
                currentStage: plant.currentStage,
                spriteSetIndex: plant.spriteSetIndex
                }))
            };

            localStorage.setItem('saveGame', JSON.stringify(saveData));
            console.log('Game state (including undo/redo) saved to storage!');
            game.updateFadingText('Game state (including undo/redo) \nsaved to storage!');
            
            
        } else {
            console.log('No game state to save.');
        }
    }

    loadGame(game) { //passing game object ITSELF (this) into loadGame
                            //should never do normally
        const saveData = localStorage.getItem('saveGame');
        if (saveData) {
            const parsedData = JSON.parse(saveData);
                                
            // Restore undo and redo stacks
            game.undoStack = parsedData.undoStack || [];  // Fallback to empty array if undefined
            game.redoStack = parsedData.redoStack || [];  // Fallback to empty array if undefined
                            
            // Apply the latest state from the undoStack
            const latestState = game.undoStack[game.undoStack.length - 1];
            if (latestState) {
                this.applyState(game, latestState);
                console.log('Game state and undo/redo stacks restored from storage!');
            } else {
                console.log('No valid game state found in undo stack.');
            }              
        }
    }
}