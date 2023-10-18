import { GameConfig } from "./config";

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
    this.gracePeriodDuration = GameConfig.PLAYER.GRACE_PERIOD_DURATION;
    this.gracePeriodTimer = null;
  }

  takeDamage(damage) {
    if(this.gracePeriod) {
      this.gracePeriodTimer = this.scene.time.delayedCall(this.gracePeriodDuration, () => {
        this.gracePeriod = false;
        this.gracePeriodTimer = null;
      });
    } else {
      this.health -= damage;
      this.gracePeriod = true;
      if(this.health <= 0) {
        this.destroy();
      }
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
  }
}