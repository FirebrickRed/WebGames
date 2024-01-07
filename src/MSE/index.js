
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.stations = [];
    this.cameraSpeed = 5;
    this.backgroundWidth = 0;
  }

  preload() {
    this.load.baseURL = 'assets/MSE/';
    this.load.image('RegisterStation', 'RegisterStation.jpg');
    this.load.image('BrewedCoffeeStation', 'BrewedCoffeeStation.jpg');
  }

  create() {
    const registerStation = this.textures.get('RegisterStation').getSourceImage();
    const brewedCoffeeStation = this.textures.get('BrewedCoffeeStation').getSourceImage();
    this.backgroundWidth = registerStation.width + brewedCoffeeStation.width;

    const stationsContainer = this.add.container(0, this.cameras.main.centerY);

    let xPosition = 0;
    stationsContainer.add(this.add.image(xPosition, 0, 'RegisterStation').setOrigin(0, 0.5));
    xPosition += registerStation.width;
    stationsContainer.add(this.add.image(xPosition, 0, 'BrewedCoffeeStation').setOrigin(0, 0.5));

    this.stations = [registerStation, brewedCoffeeStation];

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update() {
    let moved = false;

    if(this.keys.left.isDown) {
      this.cameras.main.scrollX -= this.cameraSpeed;
      moved = true;
    }

    if(this.keys.right.isDown) {
      this.cameras.main.scrollX += this.cameraSpeed;
      moved = true;
    }

    if(moved) {
      this.wrapCamera();
    }
  }
  
  // wrapCamera() {
  //   const maxScrollX = this.backgroundWidth - this.cameras.main.width;

  //   if(this.cameras.main.scrollX < 0) {
  //     this.cameras.main.scrollX = maxScrollX;
  //   } else if(this.cameras.main.scrollX > maxScrollX) {
  //     this.cameras.main.scrollX = 0;
  //   }
  // }

  wrapCamera() {
    const maxScrollX = this.backgroundWidth - this.cameras.main.width;
  
    // Check if the camera has moved past the beginning or the end of the scrollable area
    if (this.cameras.main.scrollX < 0) {
      // Smoothly move the camera to the end plus the overlap
      this.cameras.main.scrollX = maxScrollX + this.cameras.main.scrollX;
    } else if (this.cameras.main.scrollX > maxScrollX) {
      // Wrap around by adjusting the scroll position back to the beginning minus the overlap
      this.cameras.main.scrollX = this.cameras.main.scrollX - maxScrollX;
    }
  }
}

export function createMSE() {
  return new Phaser.Game({
    title: 'MSE',
    parent: 'gameCanvas',
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
      default: 'arcade'
    },
    scale: {},
    scene: [GameScene]
  });
}