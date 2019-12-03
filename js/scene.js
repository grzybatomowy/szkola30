import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
  constructor() {
    super("bootGame");
    this.sceneWidth = 256;
    this.sceneHeight = 272;
  }

  // ladowanie assetow do pamieci
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

    // dodaj tlo gry
    this.background = this.physics.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);

    // dodaj licznik punktow zycia
    this.scoreText = this.add.text(3, 3, `Lives: ${this.lives}`, {
      fontSize: "15px",
      fill: "#000"
    });

    // dodaj gracza
    this.createPlayer();

    // dodaj przeciwnikow
    this.createEnemies(3);

    // dodaj powerupy
    this.createPowerUps(5);

    // dodaj sterowanie
    this.keys = this.input.keyboard.createCursorKeys();

    // dodaj kolizje na granicy planszy
    this.physics.world.setBoundsCollision();
  }

  // funkcja odpalajaca eksplozje w wybranym punkcie
  playExplosion(x, y) {
    // dodaj obiekt eksplozji do planszy
    this.createExplosion();

    // ustaw pozycje eksplozji
    this.explosion.x = x;
    this.explosion.y = y;

    // odpal animacje
    this.explosion.play("explosion_anim");
  }

  // funkcja dodajaca obiekt eksplozji do planszy
  createExplosion() {
    // dodaj eksplozje do planszy
    this.explosion = this.physics.add.sprite(0, 0, "explosion");

    // dodaj animacje
    this.anims.create({
      key: "explosion_anim",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 7
      }),
      frameRate: 16,
      repeat: 0,
      hideOnComplete: true
    });
  }

  // funkcja dodajaca obiekt gracza do planszy
  createPlayer() {
    // dodaj gracza do planszy
    this.player = this.physics.add.sprite(
      this.sceneWidth / 2 - 50,
      this.sceneHeight / 2,
      "ship"
    );

    // dodaj animacje
    this.anims.create({
      key: "ship_anim",
      frames: this.anims.generateFrameNumbers("ship", {}),
      frameRate: 20,
      repeat: -1
    });

    // odpal animacje
    this.player.play("ship_anim");
  }

  // funkcja dodajaca obiekty wrogow do planszy
  createEnemies(count) {
    // aby nie tworzyc osobnych zmiennych dla kazdego przeciwnika uzyjemy tablicy
    this.enemies = [];

    // aby stworzyc wybrana ilosc przeciwnikow uzywamy petli
    for (let i = 0; i < count; i++) {
      // dodajemy przeciwnika do planszy
      let enemyShip = this.physics.add.image(
        this.sceneWidth / 2,
        this.sceneHeight / 2,
        "ship2" // TODO: losowe tekstury przeciwnkow
      );

      // dodajemy animacje
      this.physics.add.overlap(
        this.player,
        enemyShip,
        this.onShipsCollide,
        null,
        this
      );

      // resetujemy pozycje przeciwnika
      this.resetEnemyPosition(enemyShip);

      // dodajemy przeciwnika do tablicy przeciwnikow
      this.enemies.push(enemyShip);
    }
  }

  // funkcja dodajaca obiekty power-upow do planszy
  createPowerUps(count) {
    // podobnie jak z przeciwnikami - uzyjemy tablicy aby nie trudzic sie z wymyslaniem nazw zmiennych
    this.powerUps = [];

    // petla wykonwyana count-razy
    for (let i = 0; i < count; i++) {
      // dodajemy obiekt power-upa do planszy
      let powerUp = this.physics.add.sprite(16, 16, "power-up");

      // ustawiamy losowa pozycje
      powerUp.setRandomPosition(0, 0, this.sceneWidth, this.sceneHeight);
      // ... oraz predkosc
      powerUp.setVelocity(100, 100);

      // ponizsze dwie linijki powoduja ze power-upy beda odbijac sie od krawedzi sceny
      powerUp.setCollideWorldBounds(true);
      powerUp.setBounce(1);

      // dodajemy kolizje power-upa
      this.physics.add.overlap(
        this.player, // z jakim obiektem - w tym przypadku z graczem
        powerUp, // co takiego - w tym przypadku power-up
        this.onPowerUpCollide, // co sie stanie - przy kolizji odpali sie metoda onPowerUpCollide()
        null,
        this
      );

      // dodajemy nasz obiekt power-upa do tablicy
      this.powerUps.push(powerUp);
    }
  }

  update() {
    // zmienna trzymajaca informacje jak szybko ma poruszac sie gracz
    let speed = 2;

    // detekcja ruchu w osi x
    if (this.keys.left.isDown && this.player.x > 0) {
      this.player.x = this.player.x - speed;
    } else if (this.keys.right.isDown && this.player.x < this.sceneWidth) {
      this.player.x = this.player.x + speed;
    }

    // detekcja ruchu w osi y
    if (this.keys.up.isDown && this.player.y > 0) {
      this.player.y = this.player.y - speed;
    } else if (this.keys.down.isDown && this.player.y < this.sceneHeight) {
      this.player.y = this.player.y + speed;
    }

    // petla ktora powoduje poruszanie sie przeciwnikow:
    // dla kazdego przeciwnika w tablicy
    for (let i = 0; i < this.enemies.length; i++) {
      // przypisz wybranego przeciwnka do zmiennej
      let enemy = this.enemies[i];

      // przesun przeciwnika na osi y
      enemy.y = enemy.y + (i + 1);

      // sprawdz czy przeciwik nie wyszedl za plansze
      // jezeli wyszedl - zresetuj jego pozycje
      if (enemy.y > this.sceneHeight) {
        this.resetEnemyPosition(enemy);
      }
    }
  }

  // funkcja resetujaca pozycje wybranego statku przeciwnika
  resetEnemyPosition(enemyShip) {
    enemyShip.y = 0;
    enemyShip.x = Math.random() * this.sceneWidth;
  }

  // funkcja opisujaca co ma zdazyc sie w momencie kolizji gracza oraz przeciwnka
  onShipsCollide(player, enemyShip) {
    // utworz animacje eksplozji w miejscu przeciwnika
    this.playExplosion(enemyShip.x, enemyShip.y);

    // zresetuj pozycje przeciwnkia
    this.resetEnemyPosition(enemyShip);

    // odejmij zycie graczowi
    this.lives = this.lives - 1;
    // odswiez tekst z liczba zyc
    this.updateText();

    // sprawdz czy graczowi nie skonczyly sie zycia
    // jezeli tak to:
    if (this.lives <= 0) {
      // utworz animacje eksplozji w miejscu gracza
      this.playExplosion(player.x, player.y);
      // zakoncz gre
      this.endGame();
    }
  }

  // funkcja opisujaca co ma zdazyc sie w momencie kolizji gracza oraz power-upa
  onPowerUpCollide(player, powerUp) {
    // dodaj zycie graczowi
    this.lives = this.lives + 1;

    // odswiez tekst z liczba zyc
    this.updateText();

    // schowaj obiekt power-upa z planszy
    powerUp.disableBody(true, true);
  }

  // funkcja konczaca gre
  endGame() {
    this.scene.start("endgame");
  }

  // funkcja odswiezajaca tekst z liczba zyc
  updateText() {
    this.scoreText.setText(`Lives: ${this.lives}`);
  }
}
