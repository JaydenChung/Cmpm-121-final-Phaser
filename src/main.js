

"use strict"

let config = {
    type: Phaser.AUTO,
    render:{
        pixelArt: true
    },
    scene: [PreloadScene, GameScene],
    width: 1000,
    height: 900,
}

let game = new Phaser.Game(config);
