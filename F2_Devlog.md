## How we satisfied the software requirements
### F0+F1

The satisfaction of meeting F0+F1 remained the same. All the mechanics remain the same and the code itself it relatively the same. 

However, F0+F1 have been upgraded by seperating the requirements in seperate files.
Instead of everything being sourced and managed by 1 file (GameScene.js), Plant logic has been seperated into its own dedicated file (PlantManagement.js) while save states, undo/redo & storing data as int arrays into another dedicated file (SaveState.js).

This frees up both code and space in GameScene.js, and allows the code to become both more organized and readable. 

### F2.C: Switch to Alternate Platform

In order to satisfy the requirements for F1, specifically storing data as a byte array, we had to make an early switch from our staring platform (Unity C#) to Phaser Javascript. After finishing F0, we quickly started working porting all our progress into Javascript before we could start
on F1.

Although our code structure and implimentation was similar, it was not as easy as copy/pasting our code from F0. It took extra time to transfer our progress from Unity to Phaser before starting on F1. 

Though because of this earlier switch, it not only opened up more freedom for us by replacing a more restrictive framework with something more open ended, but because it was done so early on it wasnt as stressful to accomplish.
If we had to switch now after completing F1, we maybe could have remained in Unity and used another language (ex, VisualScript), if we had to do a platform switch it would have taken much more time, effort and resources to work on. 

### F2.A: External DSL for Scenario Design

We decided to split our design for our DSL into 2 categories, the external infrastructure for map & level design (what this section is about) & internally adding & managing plants (next section). This decision was made due to comparing the difficulty of making new maps vs making
a new plant - a plant can be self-managed within PlantManagement and we can change its functionality or add new ones with some work but relaive ease. However, adding a level requires a bit more work. It requires laying out a map, identifying win conditions and over level mechanics
we would want to impliment.

If a new level could be added or pre-existing one could be modified in an easier manner, then it would probably be better to take that offer. Such a case can be found in (src/scenarios/tutorial.json). 
```
{
    "scenarios": {
      "tutorial": {
        "initial_conditions": {
          "player_start_position": [4, 5],
          "starting_resources": {
            "sun": 10,
            "water": 5
          }
        },
        "events": [
          {
            "time": "turn_1",
            "type": "spawn_plant",
            "location": [5, 5],
            "plant_type": "grass"
          },
          {
            "time": "turn_3",
            "type": "randomize_resources",
            "intensity": "low"
          }
        ],
        "victory_conditions": {
          "grow_trees": 2,
          "turns_limit": 10
        },
        "narrative": {
          "intro": "Welcome to the plant growing tutorial! Learn to manage your plants and resources.",
          "tips": [
            "Use WASD to move",
            "Place plants adjacent to your character",
            "Manage sun and water to help plants grow"
          ]
        }
      }
    }
  }test
```
With an external DSL, we were able to easily create a new tutorial level to help ease new players into the game. With this structure, we can set already existing plants, set the state of the grid, change victory conditions, or add custom events (randomize_resources).
In our DSL, we define the level "tutorial" with initialization paramaters. Afterwards, we can define events within an array that trigger on specific turns, whether its force spawning a plant or changing the state of the grid. Afterwards, we can set how you can clear the level and 
create the text that the user would see.

### F2.B: Internal DSL for Plants and Growth Conditions

The team decided to use and internal Javascript DSL design to impliment plant creation. Rather than being difficult to impliment plant creation in an external design, its easier and more efficent to use an internal design. 

More specifically, by creating an internal file (src/PlantDSL.js), it allowed quick and easy implimentation for PlantManagement.js to use. If we used an external DSL, we would have to find a way to have our
JS file that manages our plants communicate and take information from a JSON file. 

```
class PlantType {
    constructor(name) {
        this.name = name;
        this.growthConditions = [];
        this.sprites = {
            grass: null,
            shrub: null,
            tree: null
        };
    }
//further code bellow
.....
........
class PlantRegistry {
    constructor() {
        this.plantTypes = new Map();
    }
    define(name) {
        const plantType = new PlantType(name);
        this.plantTypes.set(name, plantType);
        return plantType;
    }
    get(name) {
        return this.plantTypes.get(name);
    }
}
```
In this code snipped, we can quickly and easily make a new plant type with this constructor object. This includes setting sprites, its growth condition and name. While excluded from the snipped, there are various functions that check the conditions whether the plant can grow or not
(ex, checkWater). 

To do one last thing, we made it so that each PlantType goes into a dictionary that can be referenced to at any time: PlantRegistry

At the bottom of PlantManager.js, we initialize this registry and define the 3 intitial base plants. 
```
this.plantRegistry = new PlantRegistry();

//further code bellow
.....
........
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
```

## Reflection
This production cycle required a lot more hands on deck and active participation from the whole team. Although our roles did not change, some roles didnt end up having to do as their namesake implied (ex, Design Lead, Format Lead). Instead, as one team pushed out new changes,
others whose roles werent as prominent stepped up by focusing on Quality Assurance testing and refactoring old code. Every time a change was made, people took a step backwards towards a previously implimented step to try and make sure things our code base was stable and
could work with easier. 
