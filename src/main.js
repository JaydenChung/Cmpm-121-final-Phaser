

"use strict"

let config = {
    type: Phaser.AUTO,
    render:{
        pixelArt: true
    },
    scene: [PreloadScene, GameScene]
}

let game = new Phaser.Game(config)