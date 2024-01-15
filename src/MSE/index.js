import { createStation } from "./station";
import { Customer } from "./customer";
import { GameStateManager } from "./gameStateManager";
import { HUD } from "./hud";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.gameStateManager = new GameStateManager();
    this.stations = [];
    this.cameraSpeed = 5;
    this.backgroundWidth = 0;
  }

  preload() {
    this.load.baseURL = 'assets/MSE/';
    this.load.image('RegisterStation', 'RegisterStation.jpg');
    this.load.image('BrewedCoffeeStation', 'BrewedCoffeeStation.jpg');

    // Temp
    this.load.image('buttonTexture', 'buttonTexture.png');
    this.load.image('customer', 'customer.png');
  }

  create() {
    this.hud = new HUD(this);
    this.createStations();
    this.backgroundWidth = this.stations.reduce((width, station) => width + station.width, 0);

    this.spawnCustomer();

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

      const station = createStation(this, key, x, this.scale.height / 2, this.gameStateManager, this.hud);
      if(station) {
        this.stations.push(station);
        this.add.existing(station);
      }
    });

    if (this.stations.length > 0) {
      const firstStation = this.stations[0];
      const duplicateStation = createStation(this, firstStation.texture.key, currentPosition + firstStation.width / 2, this.scale.height / 2, this.gameStateManager, this.hud);
      if (duplicateStation) {
        this.stations.push(duplicateStation);
        this.add.existing(duplicateStation);
        currentPosition += firstStation.width;
      }
    }
  
    this.backgroundWidth = currentPosition;
  }

  spawnCustomer() {
    const xPosition = 600;
    const yPosition = 200;
    console.log(this.backgroundWidth)
    const copiedXPosition = (xPosition + this.backgroundWidth) % this.backgroundWidth;
    console.log(copiedXPosition);
    // console.log(copiedXPosition % this.backgroundWidth);
    const customer = new Customer(this, 0, 0);

    const spriteOriginal = this.createCustomerSprite(customer, xPosition, yPosition, 'original');
    const spriteCopy = this.createCustomerSprite(customer, this.backgroundWidth - xPosition, yPosition, 'copy');

    customer.addSprite(spriteOriginal);
    customer.addSprite(spriteCopy);

    this.gameStateManager.setCustomerAtRegister(customer);
    console.log(`New customer wants a ${customer.drinkOrder.size} ${customer.drinkOrder.base} drink`);
  }

  createCustomerSprite(customer, x, y, type) {
    const sprite = this.add.sprite(x, y, 'customer');
    sprite.setData('type', type);
    sprite.setData('customer', customer);
    return sprite;
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