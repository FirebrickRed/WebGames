
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
    const registerStationImage = this.textures.get('RegisterStation').getSourceImage();
    const brewedCoffeeStationImage = this.textures.get('BrewedCoffeeStation').getSourceImage();

    const stationImages = [
      { key: 'RegisterStation', image: registerStationImage },
      { key: 'BrewedCoffeeStation', image: brewedCoffeeStationImage }
    ];

    let xPosition = 0;

    stationImages.forEach(station => {
      const image = this.add.image(xPosition, this.cameras.main.centerY, station.key).setOrigin(0, 0.5);
      const width = station.image.width;

      this.stations.push(image);
      xPosition += width;
    });

    this.backgroundWidth = xPosition;

    const firstStationDuplicate = this.add.image(xPosition, this.cameras.main.centerY, stationImages[0].key).setOrigin(0, 0.5);
    this.backgroundWidth += firstStationDuplicate.width;
    this.stations.push(firstStationDuplicate);

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

  wrapCamera() {
    // The maximum x position the camera can scroll to, not including the duplicated wrap image
    const maxScrollX = this.backgroundWidth - this.cameras.main.width;
  
    // When wrapping to the left, ensure we land on the last unique image.
    if (this.cameras.main.scrollX < 0) {
      this.cameras.main.scrollX = maxScrollX + this.cameras.main.scrollX;
    }
  
    // When wrapping to the right, reset to the beginning to show the first image.
    else if (this.cameras.main.scrollX >= maxScrollX) {
      this.cameras.main.scrollX -= maxScrollX;
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