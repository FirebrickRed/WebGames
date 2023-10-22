import { GameConfig } from "./config";
import { Weapon } from "./weapons";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, 400, 300, 'playerCircle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.health = GameConfig.PLAYER.INITIAL_HEALTH;
    this.playerSpeed = GameConfig.PLAYER.SPEED;
    this.playerDirection = new Phaser.Math.Vector2(0, 0);

    this.gracePeriod = false;
    this.graceDuration = GameConfig.PLAYER.GRACE_DURATION;
    // this.gracePeriodTimer = null;

    this.weapon = new Weapon(scene, this);
    this.shooting = false;
  }

  takeDamage(damage) {
    if(!this.gracePeriod) {
      this.health -= damage;
      console.log(this.health);
      if(this.health <= 0) {
        this.destroy();
      }
    } else {
      this.gracePeriod = true;
    }
  }

  update(cursors, wasdCursors) {
    this.playerDirection.set(0, 0);

    if(cursors.left.isDown || wasdCursors.left.isDown) {
      this.playerDirection.x = -1;
    } else if(cursors.right.isDown || wasdCursors.right.isDown) {
      this.playerDirection.x = 1;
    }

    if(cursors.up.isDown || wasdCursors.up.isDown) {
      this.playerDirection.y = -1;
    } else if(cursors.down.isDown || wasdCursors.down.isDown) {
      this.playerDirection.y = 1;
    }

    this.playerDirection.normalize().scale(this.playerSpeed);
    this.setVelocity(this.playerDirection.x, this.playerDirection.y);

    if(this.shooting) {
      this.weapon.shoot(this.x, this.y, this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
    }

    if(this.gracePeriod) {
      this.graceDuration  -= this.scene.time.deltaTime;
      if(this.graceDuration <= 0) {
        this.gracePeriod = false;
        this.graceDuration = GameConfig.PLAYER.GRACE_DURATION;
      }
    }
  }
}