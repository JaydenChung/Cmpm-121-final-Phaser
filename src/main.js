

"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    render:{
        pixelArt: true
    },
    scene: [StartScene, PreloadScene, GameScene],
    width: 1000,
    height: 900,
}

let game = new Phaser.Game(config);
