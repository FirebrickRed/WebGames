import { createStation } from "./station";

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
    this.load.image('buttonTexture', 'buttonTexture.png');
  }

  create() {
    this.createStations();
    this.backgroundWidth = this.stations.reduce((width, station) => width + station.width, 0);

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  createStations() {
    const stationKeys = ['RegisterStation', 'BrewedCoffeeStation'];
    let currentPosition = 0;

    stationKeys.forEach(key => {
      const stationWidth = this.textures.get(key).getSourceImage().width;
      const x = currentPosition + stationWidth / 2;
      currentPosition += stationWidth;

      const station = createStation(this, key, x, this.scale.height / 2);
      if(station) {
        this.stations.push(station);
        this.add.existing(station);
      }
    });

    if (this.stations.length > 0) {
      const firstStation = this.stations[0];
      const duplicateStation = createStation(this, firstStation.texture.key, currentPosition + firstStation.width / 2, this.scale.height / 2);
      if (duplicateStation) {
        this.stations.push(duplicateStation);
        this.add.existing(duplicateStation);
        currentPosition += firstStation.width;
      }
    }
  
    this.backgroundWidth = currentPosition;
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
    const maxScrollX = this.backgroundWidth - this.cameras.main.width;
  
    if (this.cameras.main.scrollX < 0) {
      this.cameras.main.scrollX = maxScrollX + this.cameras.main.scrollX;
    } else if (this.cameras.main.scrollX >= maxScrollX) {
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