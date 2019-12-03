import Phaser from "phaser";

export default class EndGameScene extends Phaser.Scene {
  constructor() {
    super("endgame");
    this.sceneWidth = 256;
    this.sceneHeight = 272;
  }

  create() {
    this.add.text(this.sceneWidth / 3, this.sceneHeight / 2, "Game over");
  }
}
