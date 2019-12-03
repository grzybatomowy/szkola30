import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
  constructor() {
    super("bootGame");
    this.sceneWidth = 256;
    this.sceneHeight = 272;
  }

  preload() {
    this.load.image("background", "assets/bg.png");
    this.load.spritesheet("ship", "assets/hawk.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image("ship2", "assets/ship2.png");
    this.load.image("ship3", "assets/ship3.png");

    this.load.spritesheet("power-up", "assets/power-up.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet("explosion", "assets/explosion.png", {
      frameWidth: 48,
      frameHeight: 48
    });
  }

  create() {
    this.lives = 3;
    this.background = this.physics.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);

    this.scoreText = this.add.text(3, 3, `Lives: ${this.lives}`, {
      fontSize: "15px",
      fill: "#000"
    });

    this.createPlayer();
    this.createEnemies(3);
    this.createPowerUps(5);
    this.createExplosion();
    this.keys = this.input.keyboard.createCursorKeys();

    this.physics.world.setBoundsCollision();
  }

  playExplosion(x, y) {
    this.explosion.x = x;
    this.explosion.y = y;
    this.explosion.play("explosion_anim");
  }

  createExplosion() {
    this.explosion = this.add.sprite(0, 0, "explosion");
    this.anims.create({
      key: "explosion_anim",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 7
      }),
      frameRate: 2,
      repeat: 0,
      hideOnComplete: true
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(
      this.sceneWidth / 2 - 50,
      this.sceneHeight / 2,
      "ship"
    );
    this.anims.create({
      key: "ship_anim",
      frames: this.anims.generateFrameNumbers("ship"),
      frameRate: 20,
      repeat: -1
    });

    this.player.play("ship_anim");
  }

  createEnemies(count) {
    this.enemies = [];

    for (let i = 0; i < count; i++) {
      let enemyShip = this.physics.add.image(
        this.sceneWidth / 2,
        this.sceneHeight / 2,
        "ship2"
      );
      enemyShip.speed = Math.random() * 3 + 1;

      this.physics.add.overlap(
        this.player,
        enemyShip,
        this.onShipsCollide,
        null,
        this
      );

      this.resetEnemyPosition(enemyShip);
      this.enemies.push(enemyShip);
    }
  }

  createPowerUps(count) {
    this.powerUps = [];

    for (let i = 0; i < count; i++) {
      var powerUp = this.physics.add.sprite(16, 16, "power-up");
      powerUp.setRandomPosition(0, 0, this.sceneWidth, this.sceneHeight);

      powerUp.setVelocity(100, 100);
      powerUp.setCollideWorldBounds(true);
      powerUp.setBounce(1);

      this.physics.add.overlap(
        this.player,
        powerUp,
        this.onPowerUpCollide,
        null,
        this
      );

      this.powerUps.push(powerUp);
    }
  }

  update() {
    let speed = 2;

    if (this.keys.left.isDown && this.player.x > 0) {
      this.player.x = this.player.x - speed;
    } else if (this.keys.right.isDown && this.player.x < this.sceneWidth) {
      this.player.x = this.player.x + speed;
    }

    if (this.keys.up.isDown && this.player.y > 0) {
      this.player.y = this.player.y - speed;
    } else if (this.keys.down.isDown && this.player.y < this.sceneHeight) {
      this.player.y = this.player.y + speed;
    }

    for (let i = 0; i < this.enemies.length; i++) {
      let enemy = this.enemies[i];

      enemy.y = enemy.y + enemy.speed;
      if (enemy.y > this.sceneHeight) {
        this.resetEnemyPosition(enemy);
      }
    }
  }

  // dodanie metody z resetowaniem pozycji przeciwnikow
  resetEnemyPosition(enemyShip) {
    enemyShip.y = 0;
    enemyShip.x = Math.random() * this.sceneWidth;
  }

  // dodanie metody z kolizja
  onShipsCollide(player, enemyShip) {
    enemyShip.y = 0;
    enemyShip.x = Math.random() * this.sceneWidth;
    this.playExplosion(enemyShip.x, enemyShip.y);
    this.lives = this.lives - 1;
    this.updateText();
    if (this.lives <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.scene.start("endgame");
  }

  updateText() {
    this.scoreText.setText(`Lives: ${this.lives}`);
  }

  onPowerUpCollide(player, powerUp) {
    this.lives = this.lives + 1;
    this.updateText();

    powerUp.disableBody(true, true);
  }
}
