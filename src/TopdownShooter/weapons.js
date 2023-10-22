import { GameConfig } from './config';

export class Weapon {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    // Create a group for bullets
    this.bullets = this.scene.physics.add.group();

    // Set the bullet speed and damage
    this.bulletSpeed = GameConfig.BULLET.SPEED;
    this.bulletDamage = GameConfig.BULLET.DAMAGE;

    // Create a bullet cooldown timer
    this.fireCooldown = 0;
  }

  // Function to shoot a bullet
  shoot(x, y, targetX, targetY) {
    if (this.fireCooldown <= 0) {
      const bullet = this.bullets.create(x, y, 'bulletCircle');
      bullet.damage = this.bulletDamage;

      const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
      const velocityX = Math.cos(angle) * this.bulletSpeed;
      const velocityY = Math.sin(angle) * this.bulletSpeed;

      bullet.body.setVelocity(velocityX, velocityY);
      bullet.rotation = angle;

      this.fireCooldown = GameConfig.BULLET.COOLDOWN;
    }
  }

  // Update function to handle firing cooldown
  update(delta) {
    if (this.fireCooldown > 0) {
      this.fireCooldown -= delta;

      if(this.fireCooldown < 0) this.fireCooldown = 0;
    }
  }
}