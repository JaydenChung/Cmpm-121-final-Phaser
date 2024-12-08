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

    requiresSunlight(min, max) {
        this.growthConditions.push((game, x, y) => {
            const sunLevel = game.sunLevels[x][y];
            return sunLevel >= min && sunLevel <= max;
        });
        return this;
    }

    requiresWater(min, max) {
        this.growthConditions.push((game, x, y) => {
            const waterLevel = game.waterLevels[x][y];
            return waterLevel >= min && waterLevel <= max;
        });
        return this;
    }

    
    requiresNeighborType(plantTypeName, exactly = false) {
        this.growthConditions.push((game, x, y) => {
            const neighbors = this.getNeighborPlants(game, x, y);
            const matchingNeighbors = neighbors.filter(n => n.plantTypeName === plantTypeName).length;
            return exactly ? matchingNeighbors === 1 : matchingNeighbors >= 1;
        });
        return this;
    }

    avoidNeighborType(plantTypeName) {
        this.growthConditions.push((game, x, y) => {
            const neighbors = this.getNeighborPlants(game, x, y);
            return !neighbors.some(n => n.plantType.name === plantTypeName);
        });
        return this;
    }

    requiresSeasonalCondition(condition) {
        this.growthConditions.push((game, x, y) => condition(game.currentTurn));
        return this;
    }

    withSprites(grassSprite, shrubSprite, treeSprite) {
        this.sprites = { grass: grassSprite, shrub: shrubSprite, tree: treeSprite };
        return this;
    }

    getNeighborPlants(game, x, y) {
        const neighbors = [];
        const directions = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            const plant = game.plantManager.getPlaced().find(p => p.x === newX && p.y === newY);
            if (plant) neighbors.push(plant);
        }
        return neighbors;
    }

    canGrow(game, x, y) {
        return this.growthConditions.every(condition => condition(game, x, y));
    }
}

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