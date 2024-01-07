
export function createStation(scene, key, x, y) {
  switch(key) {
    case 'RegisterStation':
      return new RegisterStation(scene, x, y, key);
    case 'BrewedCoffeeStation':
      return new BrewedCoffeeStation(scene, x, y, key);
    default:
      console.warn(`No station found for key: ${key}`);
      return null;
  }
}

class Station extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, name) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.stationName = name;

    this.setInteractive();
    this.scene.add.existing(this);
  }

  createButtons() {

  }
}

export class RegisterStation extends Station {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 'register');
    this.setOrigin(0.5, 0.5);

    this.createButtons();
  }

  createButtons() {
    const tallButton = this.scene.add.image(this.x + 100, this.y, 'buttonTexture')
      .setInteractive()
      .on('pointerdown', () => this.onTallButtonPressed());
    
    this.buttons = [tallButton];
  }

  onTallButtonPressed() {
    console.log('tall button pressed');
  }
}

export class BrewedCoffeeStation extends Station {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 'brewedCoffee');
    this.setOrigin(0.5, 0.5);

    this.createButtons();
  }

  createButtons() {
    const addCoffeeToCup = this.scene.add.image(this.x + 100, this.y, 'buttonTexture')
      .setInteractive()
      .on('pointerdown', () => this.onAddCoffeeToCupButtonPressed());

    this.buttons = [addCoffeeToCup];
  }

  onAddCoffeeToCupButtonPressed() {
    console.log('brew button pressed');
  }
}
