import CustomerGroup from "./customer";
import Booth from "./booth";
import Player from "./player";
import { Kitchen } from "./kitchen";



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
    this.customerGroups = [];
    this.nextCustomerTime = Phaser.Math.Between(15000, 30000);
    this.initialCustomerX = 50;
    this.initialCustomerY = 525;
    this.spacingY = 100;
    this.currentY = this.initialCustomerY;
  }

  preload() {
    this.load.baseURL = 'assets/DineAtNite/';
    this.load.image('background', 'bg.jpg');
    // this.load.spritesheet('player', './dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('player', 'Sparx.png');
    this.load.image('IaniteBase', 'IaniteBase.png');
    this.load.image('IaniteColor', 'IaniteColor.png');
    this.load.image('table', 'table.png');
    this.load.image('ChairBase', 'ChairBase.png');
    this.load.image('ChairColor', 'ChairColor.png');
    this.load.image('OrderTicket', 'orderTicket.jpg');
    this.load.image('TicketHolder', 'orderticketholder.jpg');
    this.load.image('cleanSink', 'cleanSink.jpg');
    this.load.image('Meal', 'meal.png');
    this.load.image('dirtyDishes', 'dirtyDishes.png');
    this.load.image('Heart', 'heart.svg');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0);
    this.input.mouse.disableContextMenu();

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    let kitchen = new Kitchen(this, 400, 0);
    this.add.existing(kitchen);

    let player = new Player(this, 150, 175);
    this.add.existing(player);

    let booth1 = new Booth(this, 250, 400, 1);
    let booth2 = new Booth(this, 550, 400, 2);
    this.add.existing(booth1);
    this.add.existing(booth2);

    this.input.on('pointerdown', pointer => {
      if(pointer.rightButtonDown()) {
        player.clearTasks();
      }
    })
  }

  updateScore(points) {
    this.score += points;
    console.log('Score: ', this.score);
    this.scoreText.setText('Score: ' + this.score);
  }

  update(time, delta) {
    this.customerGroups.forEach(customerGroup => {
      customerGroup.update(time, delta);
    });

    if (this.score < 0) {
      this.scene.start('GameOverScene');
    }

    if (time > this.nextCustomerTime) {
      const groupSize = Phaser.Math.Between(1, 2);

      const customerGroup = new CustomerGroup(this, this.initialCustomerX, this.currentY, groupSize);
      this.customerGroups.push(customerGroup);
      this.add.existing(customerGroup);

      this.currentY -= this.spacingY;
      this.nextCustomerTime = time + Phaser.Math.Between(15000, 25000);
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
  const gameConfig = {
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
  };

  return new Phaser.Game(gameConfig);
}



/*

To Do:
- Add in score

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
  - Kitchen animation 
  - Customers
    - Frustration animation
    - Happy animation
    - Eating animation
    - menu animation
    - ready to order animation
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