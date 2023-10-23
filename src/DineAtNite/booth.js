import { OrderTicket } from "./kitchen";
import { GameConfig } from './config';

class Booth extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y);
    this.name = 'booth';
    this.isActive = false;
    this.isOccupied = false;
    this.tableNumber = tableNumber;
    this.customerToDestroy;
    this.tableText = scene.add.text(x-50, y-20, '-$1000', { fontSize: '32px', fill: '#f00' }).setDepth(1);
    
    this.table = new Table(scene, 0, 0, this.tableText);
    this.chairs = [new Chair(scene, -80, 0, true, 0), new Chair(scene, 80, 0, false, 1)];
    this.add([this.table, ...this.chairs]);
  }

  setIsActive() {
    this.isActive = true;
    this.scene.updateMoney(-1000);
    this.table.setIsActive();
    this.chairs.forEach(chair => chair.setIsActive());
    this.tableText.destroy();
  }
  
  setBoothOccupied(isBoothOccupied) {
    this.isOccupied = isBoothOccupied;
  }

  readyToOrder() {
    this.orderTicket = new OrderTicket(this.scene, this.x, this.y - 20, this.tableNumber);
  }

  orderTaken() {
    this.orderTicket = null;
    this.scene.events.emit('orderTakenStartAnimation');
  }

  dishesTaken() {
    this.dirtyDishes = null;
    this.isOccupied = false;
  }

  finishedEating(meal, customers) {
    this.checkReady = true;
    meal.setDirtyDishes();
    this.dirtyDishes = meal;
    this.customerToDestroy = customers;
  }
}

class Table extends Phaser.GameObjects.Image {
  constructor(scene, x, y, tableText) {
    super(scene, x, y, 'table');
    this.name = 'table';
    this.isBuying = false;
    this.isActive = false;
    this.setInteractive();
    this.setTint('0x555555');
    this.tableText = tableText;
    this.resetTextEvent;

    this.on('pointerup', () => {
      if(this.isActive) {
        let task = {
          x: this.parentContainer.x,
          y: this.parentContainer.y,
          status: 'pending',
          isStandAbove: true,
          emit: () => this.scene.events.emit('walkToBooth', this.parentContainer)
        }
        if(this.parentContainer.orderTicket) {
          task.emit = () => {
            let isTicketTaken = this.scene.events.emit('takeTicketFromTable', this.parentContainer.orderTicket);
            if(isTicketTaken) {
              this.parentContainer.orderTaken();
            }
          }
        } else if(this.parentContainer.checkReady) {
          task.emit = () => {
            this.scene.events.emit('bringCheck', this.parentContainer.customerToDestroy);
          }
          this.parentContainer.checkReady = false;
        } else if(this.parentContainer.dirtyDishes) {
          task.emit = () => {
            let isDishesTaken = this.scene.events.emit('takeDirtyDishesFromTable', this.parentContainer.dirtyDishes);
            if(isDishesTaken) {
              this.parentContainer.dishesTaken();
            }
          }
        } 

        this.scene.events.emit('addTask', task);
      } else {
        if(this.isBuying) {
          if(scene.money >= 1000) {
            this.parentContainer.setIsActive();
          } else {
            this.tableText.setText('not enough\n$$');
            this.tableText.setStyle({ fill: '#f00' });
            this.resetTextEvent = scene.time.addEvent({
              delay: 2000,  // 2000 milliseconds = 2 seconds
              callback: () => {
                tableText.setText('-$1000');
                tableText.setStyle({ fill: '#f00' });
                this.isBuying = false;
              },
              loop: false,
            });
          }
        } else {
          this.tableText.setText('Confirm');
          this.tableText.setStyle({ fill: '#0f0' });
          this.isBuying = true;
          this.resetTextEvent = scene.time.addEvent({
            delay: 2000,  // 2000 milliseconds = 2 seconds
            callback: () => {
              tableText.setText('-$1000');
              tableText.setStyle({ fill: '#f00' });
              this.isBuying = false;
            },
            loop: false,
          });
        }
      }
    });
  }

  setIsActive() {
    this.clearTint();
    this.isActive = true;
    this.resetTextEvent.remove();
    this.tableText.destroy();
  }
}

class Chair extends Phaser.GameObjects.Container {
  constructor(scene, x, y, isLeft, setNumber) {
    super(scene, x, y);
    this.name = `${isLeft ? 'Left' : 'Right'}Chair`;
    this.isLeft = isLeft;
    this.number = setNumber;
    this.isActive = false;

    this.chairBase = scene.add.image(0, 0, 'ChairBase').setOrigin(0.5);
    this.chairColor = scene.add.image(0, 0, 'ChairColor').setOrigin(0.5);
    this.chairBase.setTint('0x555555');
    this.chairColor.setTint('0x555555');
    this.chairBase.flipX = !isLeft;
    this.chairColor.flipX = !isLeft;

    this.setSize(this.chairBase.width, this.chairBase.height);

    this.add([this.chairBase, this.chairColor]);
  }
  
  setColor(color) {
    this.chairColor.setTint(GameConfig.CUSTOMER_COLOR[color]);
  }
  
  getIsOccupied() {
    return this.parentContainer.isOccupied;
  }
  
  setIsActive() {
    this.setIsActive = true;
    this.chairBase.clearTint();
    this.chairColor.clearTint();
    this.setInteractive({ dropZone: true });
  }
}

export default Booth;