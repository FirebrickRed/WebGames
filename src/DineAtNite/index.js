import CustomerGroup from "./customer";
import Booth from "./booth";
import Player from "./player";
import { Kitchen } from "./kitchen";
import { GameConfig } from "./config";



class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {}

  create() {
    this.add.text(200, 250, 'Welcome to Dine-At-Nite!', { fontSize: '32px', fill: '#fff' });
    this.startButton = this.add.text(300, 350, 'Endless Mode!', { fontSize: '24px', fill: '#fff' });
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', () => { this.scene.start('GameScene'); });
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.add.text(200, 250, 'Game Over!', { fontSize: '32px', fill: '#fff' });

    this.restartButton = this.add.text(300, 350, 'Return to Menu', { fontSize: '24px', fill: '#fff' });
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.scoreText;
    this.money = 1000;
    this.moneyText;
    this.customerGroups = [];
    this.nextCustomerTime = Phaser.Math.Between(GameConfig.NEXT_CUSTOMER_TIME.MIN, GameConfig.NEXT_CUSTOMER_TIME.MAX);
    this.initialCustomerX = GameConfig.INITIAL_CUSTOMER.X;
    this.initialCustomerY = GameConfig.INITIAL_CUSTOMER.Y;
    this.spacingY = GameConfig.SPACING_Y;
    this.currentY = this.initialCustomerY;
  }

  preload() {
    this.load.baseURL = 'assets/DineAtNite/';
    this.load.image('background', 'bg.jpg');
    this.load.image('player', 'Sparx.png');
    this.load.spritesheet('IaniteBase', 'IaniteBase.png', { frameWidth: 40, frameHeight: 100 });
    this.load.spritesheet('IaniteColor', 'IaniteColor.png', { frameWidth: 40, frameHeight: 100 });
    this.load.image('table', 'table.png');
    this.load.image('ChairBase', 'ChairBase.png');
    this.load.image('ChairColor', 'ChairColor.png');
    this.load.image('OrderTicket', 'orderTicket.jpg');
    this.load.image('Heart', 'heart.svg');
    this.load.spritesheet('DeliveredFood', 'DeliveredFood.png', { frameWidth: 30, frameHeight: 30 });
    this.load.image('ServingTray', 'Plater.png');
    this.load.image('Furnace', 'Furnace.jpg');
    this.load.spritesheet('FurnaceAnimation', 'FurnaceAnimation.png', { frameWidth: 86, frameHeight: 86 });
    this.load.image('cleanSink', 'cauldron.png');
    this.load.image('TicketHolder', 'orderticketholder.png');
  }

  create() {
    // Animations
    //#region 
    if(!this.anims.exists('baseWait')) {
      this.anims.create({
        key: 'baseWait',
        frames: this.anims.generateFrameNumbers('IaniteBase', { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if(!this.anims.exists('baseMenu')) {
      this.anims.create({
        key: 'baseMenu',
        frames: this.anims.generateFrameNumbers('IaniteBase', { start: 5, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('baseReadyToOrder')) {
      this.anims.create({
        key: 'baseReadyToOrder',
        frames: this.anims.generateFrameNumbers('IaniteBase', { start: 6, end: 8 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('baseSitWait')) {
      this.anims.create({
        key: 'baseSitWait',
        frames: this.anims.generateFrameNumbers('IaniteBase', { start: 9, end: 9 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('baseEat')) {
      this.anims.create({
        key: 'baseEat',
        frames: this.anims.generateFrameNumbers('IaniteBase', { start: 10, end: 13 }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if(!this.anims.exists('colorWait')) {
      this.anims.create({
        key: 'colorWait',
        frames: this.anims.generateFrameNumbers('IaniteColor', { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('colorMenu')) {
      this.anims.create({
        key: 'colorMenu',
        frames: this.anims.generateFrameNumbers('IaniteColor', { start: 5, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('colorReadyToOrder')) {
      this.anims.create({
        key: 'colorReadyToOrder',
        frames: this.anims.generateFrameNumbers('IaniteColor', { start: 6, end: 8 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('colorSitWait')) {
      this.anims.create({
        key: 'colorSitWait',
        frames: this.anims.generateFrameNumbers('IaniteColor', { start: 9, end: 9 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    
    if(!this.anims.exists('colorEat')) {
      this.anims.create({
        key: 'colorEat',
        frames: this.anims.generateFrameNumbers('IaniteColor', { start: 10, end: 13 }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if(!this.anims.exists('FoodToEat')) {
      this.anims.create({
        key: 'FoodToEat',
        frames: this.anims.generateFrameNumbers('DeliveredFood', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: 1
      });
    }

    if(!this.anims.exists('FurnaceAnimation')) {
      this.anims.create({
        key: 'FurnaceAnimation',
        frames: this.anims.generateFrameNumbers('FurnaceAnimation'),
        frameRate: 1,
        repeat: 0
      });
    }
    //#endregion

    this.add.image(0, 0, 'background').setOrigin(0);
    this.input.mouse.disableContextMenu();

    this.score = 0;
    this.money = 1000;
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#fff' });
    this.moneyText = this.add.text(16, 45, `$${this.money}`, { fontSize: '32px', fill: '#0f0' });

    this.nextCustomerTime = Phaser.Math.Between(GameConfig.NEXT_CUSTOMER_TIME.MIN, GameConfig.NEXT_CUSTOMER_TIME.MAX);
    this.initialCustomerX = GameConfig.INITIAL_CUSTOMER.X;
    this.initialCustomerY = GameConfig.INITIAL_CUSTOMER.Y;
    this.spacingY = GameConfig.SPACING_Y;
    this.currentY = this.initialCustomerY;
    
    let kitchen = new Kitchen(this, 400, 0);
    this.add.existing(kitchen);

    let player = new Player(this, 150, 175);
    this.add.existing(player);

    this.customerGroups = [];

    let booth1 = new Booth(this, 900, 500, 1);
    let booth2 = new Booth(this, 900, 300, 2);
    let booth3 = new Booth(this, 600, 500, 3);
    let booth4 = new Booth(this, 600, 300, 4);
    let booth5 = new Booth(this, 300, 500, 5);
    let booth6 = new Booth(this, 300, 300, 6);
    this.add.existing(booth1);
    this.add.existing(booth2);
    this.add.existing(booth3);
    this.add.existing(booth4);
    this.add.existing(booth5);
    this.add.existing(booth6);

    this.input.on('pointerdown', pointer => {
      if(pointer.rightButtonDown()) {
        player.clearTasks();
      }
    })
  }

  updateScore(points) {
    this.score += points;
    this.scoreText.setText('Score: ' + this.score);
  }

  updateMoney(moneyToAdd) {
    this.money += moneyToAdd;
    this.moneyText.setText(`$${this.money}`);
  }

  update(time, delta) {
    if (this.score < 0) {
      this.scene.start('GameOverScene');
    }

    if (time > this.nextCustomerTime) {
      const groupSize = Phaser.Math.Between(1, 2);

      const customerGroup = new CustomerGroup(this, this.initialCustomerX, this.currentY, groupSize);
      this.customerGroups.push(customerGroup);
      this.add.existing(customerGroup);
      this.customerGroups = this.customerGroups.filter(customerGroup => !customerGroup.isDestroyed);
      this.customerGroups.forEach(customerGroup => {
        customerGroup.update(time, delta, this);
      });

      this.currentY -= this.spacingY;
      this.nextCustomerTime = time + Phaser.Math.Between(GameConfig.NEXT_CUSTOMER_TIME.MIN, GameConfig.NEXT_CUSTOMER_TIME.MAX);
    }
  }

  moveUpLine() {
    this.currentY = this.initialCustomerY;
    this.customerGroups.forEach(customerGroup => {
      if(!customerGroup.isSeated) {
        customerGroup.setY(this.currentY);
        this.currentY -= this.spacingY;
      }
    });
  }
}

export function createDineAtNiteGame() {
  return new Phaser.Game({
    title: 'DineAtNite',
    parent: 'gameCanvas',
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
      // mode: Phaser.Scale.RESIZE,
      // autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 }
      }
    },
    scene: [MenuScene, GameScene, GameOverScene]
  });
}



/*

To Do:
- Add in levels

- Ability to save scores and level status

- Add in endless mode
  - 5 star resturant mode
    - when customer finishes eating gain stars towards 5 stars
    - when customer leaves unhappily lose stars towards 5 stars
    - when lose enough stars game over

- Reset game button?

- Add in animations
  - Player walking animations
  - Player holding animations
  - TicketHolder spin animation?? Not sure how ticket holder is going to look
  - Sink animation
  - Customers
    - Frustration animation
    - Happy animation
    - Leaving animation

- Customers
  - Have different customer types
  - more than 2 customers?

- Tables
  - Add in score multiplier for same colors
  - Add bigger colors
  - Number signs for tables

- Meals
  - Number sign for corrisponding table
  - Different meal types?? Randomly assigns?
*/