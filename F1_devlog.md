# F1.DevLog 

## How We Satisfied the Software Requirements  

### Previous F0 Requirements (7 Total)  
1. **Movement Across a 2D Grid:**  
   Players can move smoothly across a grid, snapping to grid cells using the WASD keys  

2. **Time Control Mechanic:**  
   Same as last week. Pressing the "O" key progresses the day, impacting plant growth and grid resources.  

3. **Plant Growth Mechanics:**  
   Plants grow through three stages influenced by grid cell sun and water levels.  

4. **Proximity-Based Interactions:**  
   Plants can only be placed adjacent to the player 

5. **Dynamic Grid Cell Properties:**  
   Sun and water levels are randomized daily and visualized on the grid.  

6. **Variety of Plants & Switching Mechanic:**  
   Players can select plant types using keybinds (1, 2, 3) and place them on the grid.  

7. **Win Condition:**  
   Players must meet the victory conditions, such as harvesting a specific number of trees.  

---

### New F1 Requirements (4 Total)  

1. **F1.a: Data Packing and Memory Strategy**  
   - **Implementation:** The grid-based system for managing environmental resources like sunlight and water levels is implemented using SoA, with separate 2D arrays (sunLevels and waterLevels) for each resource type. This enables efficient bulk updates and independent manipulation of each resource. Conversely, the placedPlants array employs an AoS structure, where each entry is a structured object containing fields such as grid coordinates (x, y), growth stage, and sprite information. 
   

2. **F1.b: Implicit Auto-Save System**  
   - **Implementation:** The game saves automatically every 60 seconds. This ensures the game state is preserved without explicit user input. The saveGameToStorage() method serializes critical game data, including the player's position, current turn, placed plants, and resource levels, and stores it in the browser's localStorage. This method is invoked automatically every 60 seconds using a timed event (Phaser.Time.addEvent) to ensure progress is consistently recorded. Additionally, significant player actions, such as movement or placing a plant, trigger state snapshots via the saveState() method, which updates an undo stack and prepares the game state for auto-saving. This dual approach ensures the system captures both regular intervals and important gameplay moments, providing robust data preservation without requiring explicit player input.

3. **F1.c: Explicit Save/Load with Multiple Slots**  
   - **Implementation:** The game uses the current state, undo/redo stacks, and stores it in localStorage under unique keys for each save entry. 
Players can save and load game states in up to three slots using the `K` (save) and `L` (load) keys. Each slot saves:  
     - Player position.  
     - Current turn.  
     - Placed plants (excluding sprite references).  
     - Sun and water levels.  

4. **F1.d: Infinite Undo/Redo**  
   - **Implementation:** Actions (e.g., movement, plant placement) are stored in `undoStack` and `redoStack`. Players can press `Z` (undo) and `X` (redo) to revert or reapply actions, even back to the initial game state.  

---

## Reflection  

This production cycle was filled with a lot of learning and implementation of data structures and other dynamic resources such as local web storage. We were able to successfully meet the F1.a requirements by working together and supporting each other to produce core features of the game.