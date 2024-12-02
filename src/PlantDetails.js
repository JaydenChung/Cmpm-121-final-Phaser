//base class, shouldnt use
class Plants{
    constructor(){
        this.sunLevel = 1;
        this.waterLevel = 1;
        this.plantStage = 1; //1 = seed, 3 = max, 0 = ded

        this.plantID = -11111; //should never actually be this value
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
        this.plantID = Math.floor(342 * generateRandom()) + Math.floor(generateRandom()*2/342); //creates a random ID
        this.updateCondition = false;

        this.DEAD = 261;
        this.STAGE1 = 343;
        this.STAGE2 = 339;
        this.STAGE3 = 304;
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
