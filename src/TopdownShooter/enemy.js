import { GameConfig } from "./config";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, initialHealth, damage) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.health = initialHealth;
    this.damage = damage;
    this.player = scene.player;
    this.moveSpeed = GameConfig.MELEE_ENEMY.MOVE_SPEED;
  }
  
  static spawn(scene, textureKey, initialHealth, damage, background) {
    const enemyX = Phaser.Math.Between(0, background.width);
    const enemyY = Phaser.Math.Between(0, background.height);

    const enemy = new Enemy(scene, enemyX, enemyY, textureKey, initialHealth, damage, this.player);
    scene.enemies.add(enemy);
  }

  takeDamage(damage) {
    this.health -= damage;
    if(this.health <= 0) {
      this.destroy();
    }
  }

  attackPlayer() {
    if(this.player.health > 0) {
      this.player.takeDamge(this.damage);
    }
  }

  update() {
    let directionX = this.player.x - this.x;
    let directionY = this.player.y - this.y;

    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    directionX /= length;
    directionY /= length;

    this.setVelocity(directionX * this.moveSpeed, directionY * this.moveSpeed);
  }
}
