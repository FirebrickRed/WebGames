import Phaser from 'phaser';
import { GameConfig } from './config';
import Enemy from './enemy';
import Player from './player';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.add.text(200, 250, 'Game Over!', { fontSize: '32px', fill: '#fff' });

    this.restartButton = this.add.text(300, 350, 'Return to Menu', { fontSize: '24px', fill: '#fff' });
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player;
    this.background;
    this.bullets;
    this.enemies;
    this.isGameOver = false;
    this.cursors;
  }

  preload() {
    // this.load.baseURL = 'assets/TopDownShooter/';
    // this.load.image('background', 'MererIslad.png');
    this.load.image('background', 'assets/TopDownShooter/MererIslad.png');

    const graphics = this.add.graphics();
    //player
    graphics.fillStyle(0x0000FF, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('playerCircle', 50, 50);

    //enemies
    graphics.clear();
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('enemyCircle', 40, 40);

    //bullet
    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(0, 0, 10);
    graphics.generateTexture('bulletCircle', 20, 20);
  }

  create() {
    if(navigator.getGamepads) {
      console.log('Gamepad support is available.');
      // setupControllers();
    } else {
      console.log('Gamepad support is not available in this browser');
    }

    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    // this.background.setTint('#000');
    this.player = new Player(this);

    this.cameras.main.setBounds(0, 0, this.background.width, this.background.height);
    this.physics.world.setBounds(0, 0, this.background.width, this.background.height);
    this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdCursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.time.addEvent({
      delay: GameConfig.MELEE_ENEMY.SPAWN_INTERVAL,
      callback: () => {
        if(this.isGameOver) { return; }
        Enemy.spawn(this, 'enemyCircle', GameConfig.MELEE_ENEMY.INITIAL_HEALTH, GameConfig.MELEE_ENEMY.DAMAGE, this.background, this.player);
      },
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: GameConfig.RANGED_ENEMY.SPAWN_INTERVAL,
      callback: () => {
        if(this.isGameOver) { return; }
        Enemy.spawn(this, 'enemyCircle', GameConfig.RANGED_ENEMY.INITIAL_HEALTH, GameConfig.RANGED_ENEMY.DAMAGE, this.background, this.player);
      },
      callbackScope: this,
      loop: true
    });

    this.input.on('pointerdown', pointer => {
      if(!this.isGameOver) {
        this.shootBullet(this.player.x, this.player.y, pointer.x, pointer.y);
      }
    });

    this.input.setHitArea(this.background);
  }

  update() {
    if(this.isGameOver) { return; }

    this.bullets.children.iterate(bullet => {
      bullet.rotation = Phaser.Math.Angle.Between(bullet.x, bullet.y, bullet.destinationX, bullet.destinationY);
    });

    this.enemies.children.iterate(enemy => {
      enemy.update();
    })

    this.player.update(this.cursors, this.wasdCursors);

    this.physics.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.takeDamage(bullet.damage);

      if(!enemy.active) {
        enemy.destroy();
      }
    });

    this.physics.overlap(this.player, this.enemies, (player, enemy) => {
      if(this.isGameOver) return;

      if(!player.gracePeriod) {
        player.takeDamage(enemy.damage);
  
        // if(player.health <= 0) {
        //   player.health = 0;
        //   this.playerHealthText.setText('Player Health: 0');
        //   // this.gameOver();
        // }
      }
    }, null, this);
  }

  shootBullet(x, y, targetX, targetY) {
    if(this.isGameOver) return;
    console.log('1', {x, y, targetX, targetY})
    const bullet = this.physics.add.sprite(x, y, 'bulletCircle');
    bullet.damage = GameConfig.BULLET.DAMAGE;
    console.log('2', bullet);
    
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.physics.moveTo(bullet, targetX, targetY, GameConfig.BULLET.SPEED);
    bullet.rotation = angle;
    console.log('3', {angle, bullet});

    // if(!this.bullets) {
    //   this.bullets = this.physics.add.group();
    // }

    // const bullet = this.add.graphics();
    // bullet.fillStyle(0xffff00, 1);
    // bullet.fillCircle(0, 0, 5);
    // bullet.setPosition(x, y);
    // bullet.damage = GameConfig.BULLET.DAMAGE;

    // const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    // this.physics.velocityFromRotation(angle, GameConfig.BULLET.SPEED, bullet.body.velocity);
    // bullet.rotation = angle;

    this.bullets.add(bullet);
    console.log('4', this.bullets);
  }

  gameOver() {
    this.isGameOver = true;
    gameOver.scene.switch('GameOverScene');
  }

  setupControllers() {
    window.addEventListener('gamepadconnected', e => {
      const gamepad = e.gamepad;
      console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}`);
    });
  
    window.addEventListener('gamepaddisconnected', e => {
      const gamepad = e.gamepad;
      console.log(`Gamepad disconnected from index ${gamepad.index}`);
    });
  
    this.input.on('pointerdown', pointer => {
      if(!this.isGameOver) {
        this.shootBullet(this.player.x, this.player.y, pointer.x, pointer.y);
      }
    });
  
    this.input.setHitArea(this.background);
    // this.input.enableDebug();
  }
}

export function createTopDownShooter() {
  return new Phaser.Game({
    title: 'TopDownShooter',
    parent: 'gameCanvas',
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
      default: 'arcade'
    },
    scale: {},
    scene: [GameScene, GameOverScene]
  })
}