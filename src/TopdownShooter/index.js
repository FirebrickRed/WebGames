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
      this.scene.start('GameScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player;
    this.background;
    this.enemies;
    this.isGameOver = false;
    this.cursors;
  }

  preload() {
    this.load.baseURL = 'assets/TopDownShooter/';
    // this.load.image('background', 'MererIslad.png');
    this.load.image('background', 'MererIsladHeavy.jpg');
    this.load.image('playerCircle', 'Player.svg');
    this.load.image('enemyCircle', 'Enemy.svg');
    this.load.image('bulletCircle', 'Bullet.svg');
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
    this.background.setTint('#000');
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
        this.player.shooting = true;
        // this.player.handleShooting(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', pointer => {
      this.player.shooting = false;
    });

    this.input.setHitArea(this.background);
  }

  update(time, delta) {
    if(this.isGameOver) { return; }

    this.enemies.children.iterate(enemy => {
      enemy.update();
    });

    this.player.update(this.cursors, this.wasdCursors);
    this.player.weapon.update(delta);

    this.physics.overlap(this.player.weapon.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.takeDamage(bullet.damage);

      if(!enemy.active) {
        enemy.destroy();
      }
    });

    this.physics.collide(this.player, this.enemies, (player, enemy) => {
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
  });
}