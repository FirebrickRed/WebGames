
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.centerX;
    this.centerY;
    this.cameraSpeed = 4;
    this.backgroundWidth = 2560;
  }

  preload() {
    this.load.baseURL = 'assets/MSE/';
    this.load.image('background', 'CoffeeShop.jpg');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0);
    this.centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    this.centerY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.cameras.main.setBounds(0, 0, this.backgroundWidth, 720);

    this.cameras.main.setScroll(this.centerX, this.centerY);

    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update() {
    if(this.keys.a.isDown) {
      this.cameras.main.scrollX -= this.cameraSpeed;
      this.wrapCamera();
    }
    if(this.keys.d.isDown) {
      this.cameras.main.scrollX += this.cameraSpeed;
      this.wrapCamera();
    }
  }
  
  wrapCamera() {
    if(this.cameras.main.scrollX < 0) {
      this.cameras.main.scrollX = this.backgroundWidth - this.cameras.main.width;
    } else if(this.cameras.main.scrollX > this.backgroundWidth - this.cameras.main.width) {
      this.cameras.main.scrollX = 0;
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