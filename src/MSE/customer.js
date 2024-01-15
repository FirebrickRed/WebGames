export class Customer extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'customer');
    this.sprites = [];
    this.setOrigin(0.5, 0.5);
    scene.add.existing(this);

    this.drinkOrder = this.createRandomDrink();
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
  }

  updateSprites() {
    this.sprites.forEach(sprite => {
      sprite.setVisible(this.isVisible);
      sprite.setPosition(this.x, this.y);
    });
  }

  createRandomDrink() {
    const drinkSizes = ['Tall', 'Grande', 'Venti'];
    const drinkOptions = ['Drip'];
    const randomSize = drinkSizes[Math.floor(Math.random() * drinkSizes.length)];
    const randomDrink = drinkOptions[Math.floor(Math.random() * drinkOptions.length)];
    return { base: randomDrink, size: randomSize };
  }

  payForDrink() {

  }

  goWaitForDrink() {
    this.setPosition(0, 200);
  }

  collectDrink() {

  }
}