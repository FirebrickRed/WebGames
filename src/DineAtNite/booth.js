import { OrderTicket } from "./kitchen";
import { colors } from './constants';

class Booth extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y);
    this.name = 'booth';
    this.isOccupied = false;
    this.tableNumber = tableNumber;

    this.table = new Table(scene, 0, 0);
    this.chairs = [new Chair(scene, -80, 0, true, 0), new Chair(scene, 80, 0, false, 1)];
    this.add([this.table, ...this.chairs]);
  }
  
  setBoothOccupied(isBoothOccupied) {
    this.isOccupied = isBoothOccupied;
  }

  readyToOrder() {
    this.orderTicket = new OrderTicket(this.scene, this.x, this.y - 20, this.tableNumber);
  }

  orderTaken() {
    this.orderTicket = null;
  }

  dishesTaken() {
    this.dirtyDishes = null;
    this.isOccupied = false;
  }

  finishedEating(meal) {
    meal.setDirtyDishes();
    this.dirtyDishes = meal;
  }
}

class Table extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'table');
    this.name = 'table';
    this.setInteractive();

    this.on('pointerup', () => {
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
      } else if(this.parentContainer.dirtyDishes) {
        task.emit = () => {
          let isDishesTaken = this.scene.events.emit('takeDirtyDishesFromTable', this.parentContainer.dirtyDishes);
          if(isDishesTaken) {
            this.parentContainer.dishesTaken();
          }
        }
      }

      this.scene.events.emit('addTask', task);
    });
  }
}

class Chair extends Phaser.GameObjects.Container {
  constructor(scene, x, y, isLeft, setNumber) {
    super(scene, x, y);
    this.name = `${isLeft ? 'Left' : 'Right'}Chair`;
    this.isLeft = isLeft;
    this.number = setNumber;

    this.chairBase = scene.add.image(0, 0, 'ChairBase').setOrigin(0.5);
    this.chairColor = scene.add.image(0, 0, 'ChairColor').setOrigin(0.5);
    this.chairBase.flipX = !isLeft;
    this.chairColor.flipX = !isLeft;

    this.setSize(this.chairBase.width, this.chairBase.height);
    this.setInteractive({ dropZone: true });
    this.add([this.chairBase, this.chairColor]);
  }

  setColor(color) {
    this.chairColor.setTint(colors[color]);
  }

  getIsOccupied() {
    return this.parentContainer.isOccupied;
  }
}

export default Booth;