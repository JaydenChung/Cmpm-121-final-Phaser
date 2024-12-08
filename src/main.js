

"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    render:{
        pixelArt: true
    },
    scene: [StartScene, PreloadScene, GameScene],
    width: window.innerWidth,
    height: window.innerHeight,
}

let game = new Phaser.Game(config);
