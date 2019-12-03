import Scene from "/js/scene.js";
import EndGameScene from "/js/endgame-scene.js";
import Phaser from "phaser";

let config = {
  width: 256,
  height: 272,
  backgroundColor: 0x000000,
  scene: [Scene, EndGameScene],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
};

var game = new Phaser.Game(config);
