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
    this.score = GameConfig.SCORE_VALUES.STARTING_SCORE;
    this.scoreText;
    this.money = GameConfig.BOOTHS.COST.BASE;
    this.moneyText;
    this.customerGroups = [];
    this.nextCustomerTime = Phaser.Math.Between(GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MIN, GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MAX);
    this.initialCustomerX = GameConfig.CUSTOMER.INITIAL_CUSTOMER.X;
    this.initialCustomerY = GameConfig.CUSTOMER.INITIAL_CUSTOMER.Y;
    this.spacingY = GameConfig.SPACING_Y;
    this.currentY = this.initialCustomerY;
    this.activeTables = 0;
    this.booths = [];
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

  createAnimation(key, spriteSheet, startFrame, endFrame, frameRate, repeat) {
    if(!this.anims.exists(key)) {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers(spriteSheet, { start: startFrame, end: endFrame }),
        frameRate: frameRate,
        repeat: repeat
      });
    }
  }

  create() {
    // Animations
    //#region 
    this.createAnimation('baseWait', 'IaniteBase', 1, 2, 10, -1);
    this.createAnimation('baseMenu', 'IaniteBase', 5, 5, 10, -1);
    this.createAnimation('baseReadyToOrder', 'IaniteBase', 6, 8, 5, -1);
    this.createAnimation('baseSitWait', 'IaniteBase', 9, 9, 5, -1);
    this.createAnimation('baseEat', 'IaniteBase', 10, 13, 5, -1);
    this.createAnimation('colorWait', 'IaniteColor', 1, 2, 10, -1);
    this.createAnimation('colorMenu', 'IaniteColor', 5, 5, 10, -1);
    this.createAnimation('colorReadyToOrder', 'IaniteColor', 6, 8, 5, -1);
    this.createAnimation('colorSitWait', 'IaniteColor', 9, 9, 5, -1);
    this.createAnimation('colorEat', 'IaniteColor', 10, 13, 5, -1);
    this.createAnimation('FoodToEat', 'DeliveredFood', 0, 3, 5, 1);
    this.createAnimation('FurnaceAnimation', 'FurnaceAnimation', 0, 4, 1, 0);
    //#endregion

    this.add.image(0, 0, 'background').setOrigin(0);
    this.input.mouse.disableContextMenu();

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#fff' });
    this.moneyText = this.add.text(16, 45, `$${this.money}`, { fontSize: '32px', fill: '#0f0' });

    this.nextCustomerTime = Phaser.Math.Between(GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MIN, GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MAX);
    this.initialCustomerX = GameConfig.CUSTOMER.INITIAL_CUSTOMER.X;
    this.initialCustomerY = GameConfig.CUSTOMER.INITIAL_CUSTOMER.Y;
    this.spacingY = GameConfig.SPACING_Y;
    this.currentY = this.initialCustomerY;
    
    let kitchen = new Kitchen(this, 400, 0);
    this.add.existing(kitchen);

    let player = new Player(this, 150, 175);
    this.add.existing(player);

    this.customerGroups = [];

    const boothConfigs = Object.values(GameConfig.BOOTHS.PROPERTIES);
    for(let i = 0; i < boothConfigs.length; i++) {
      let boothConfig = boothConfigs[i];
      let newBooth = new Booth(this, boothConfig.X, boothConfig.Y, i, this.getTableCost());
      this.booths.push(newBooth);
      this.add.existing(newBooth);
    }

    this.input.on('pointerdown', pointer => {
      if(pointer.rightButtonDown()) {
        player.clearTasks();
      }
    })
  }

  getTableCost() {
    // console.log('base: ', GameConfig.BOOTHS.COST.BASE, this.activeTables);
    let pow = Math.pow(GameConfig.BOOTHS.COST.GROWTH_RATE, this.activeTables);
    // console.log('pow: ', pow);
    // let pow = Math.pow(GameConfig.BOOTHS.COST.GROWTH_RATE, this.activeTables);
    // console.log('pow: ', pow);
    // console.log('result: ', GameConfig.BOOTHS.COST.BASE * pow);
    return GameConfig.BOOTHS.COST.BASE * pow;
    // return GameConfig.BOOTHS.COST.BASE * Math.pow(GameConfig.BOOTHS.COST.GROWTH_RATE, this.activeTables);
  }

  updateActiveTables() {
    this.activeTables++;
    this.booths.forEach(booth => {
      if(!booth.isActive) {
        booth.updateTablePrice(this.getTableCost());
      }
    });
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
      this.nextCustomerTime = time + Phaser.Math.Between(GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MIN, GameConfig.CUSTOMER.NEXT_CUSTOMER_TIME.MAX);
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

TODO: fix customer hover when table is taken
TODO: fix taking order from customers while hands full

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