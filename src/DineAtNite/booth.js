import { OrderTicket } from "./kitchen";

class Booth extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y);
    this.name = 'booth';
    this.isOccupied = false;
    this.isDirty = false;
    this.tableNumber = tableNumber

    this.table = new Table(scene, 0, 0);
    this.leftChair = new Chair(scene, -80, 0, true);
    this.rightChair = new Chair(scene, 80, 0, false);
    this.add([this.table, this.leftChair, this.rightChair]);
  }
  
  setBoothOccupied(isBoothOccupied) {
    this.isOccupied = isBoothOccupied;
  }

  readyToOrder() {
    this.orderTicket = new OrderTicket(this.scene, this.x, this.y - 20, this.tableNumber);
  }

  orderTaken() {
    console.log('in order taken');
    this.orderTicket = null;
  }
}

class Table extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'table');
    this.name = 'table';
    this.setInteractive();

    this.on('pointerup', () => {
      let pickup;

      if(this.parentContainer.orderTicket) {
        pickup = this.parentContainer.orderTicket;
      }
      if(this.parentContainer.dirtyDishes) {
        pickup = this.parentContainer.dirtyDishes;
      }

      this.scene.events.emit('addTask', {
        x: this.parentContainer.x,
        y: this.parentContainer.y,
        status: 'pending',
        pickUp: pickup,
        dropOff: 'Meal',
        tableNumber: this.parentContainer.tableNumber,
        object: this.parentContainer,
        afterPickup: () => {
          this.parentContainer.orderTaken();
        }
      });
    });
  }
}

class Chair extends Phaser.GameObjects.Image {
  constructor(scene, x, y, isLeft) {
    super(scene, x, y, 'chair');
    this.name = `${isLeft ? 'Left' : 'Right'}Chair`;
    this.isLeft = isLeft;
    this.flipX = !isLeft;
    this.setInteractive({ dropZone: true });
  }

  getIsOccupied() {
    return this.parentContainer.isOccupied;
  }
}

export default Booth;