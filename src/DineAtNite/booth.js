import { OrderTicket } from "./kitchen";
import { GameConfig } from './config';

class Booth extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y);
    this.initializeProperties(x, y, tableNumber)
    
    this.add([this.table, ...this.chairs]);
  }

  initializeProperties(x, y, tableNumber) {
    this.name = 'booth';
    this.isActive = false;
    this.isOccupied = false;
    this.tableNumber = tableNumber;
    this.customerToDestroy;
    this.tableText = this.scene.add.text(x-50, y-20, '-$1000', { fontSize: '32px', fill: '#f00' }).setDepth(1);
    this.table = new Table(this.scene, 0, 0, this.tableText, this.tableNumber);
    this.chairs = [new Chair(this.scene, -80, 0, true, 0), new Chair(this.scene, 80, 0, false, 1)];
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
    this.initializeProperties(tableText);
    this.on('pointerup', this.handlePointerUp.bind(this));
  }

  initializeProperties(tableText) {
    this.name = 'table';
    this.isBuying = false;
    this.isActive = false;
    this.setInteractive();
    this.setTint('0x555555');
    this.tableText = tableText;
    this.resetTextEvent;
  }

  handlePointerUp() {
    if(this.isActive) {
      this.handleActiveTable();
    } else {
      this.handleBuyingProcess();
    }
  }

  handleActiveTable() {
    let task = this.createBaseTask();

    if(this.parentContainer.orderTicket) {
      this.modifyTaskForOrderTicket(task);
    } else if(this.parentContainer.checkReady) {
      this.modifyTaskForCheckReady(task);
    } else if(this.parentContainer.dirtyDishes) {
      this.modifyTaskForDirtyDishes(task);
    }

    this.scene.events.emit('addTask', task);
  }

  createBaseTask() {
    return {
      x: this.parentContainer.x,
      y: this.parentContainer.y,
      status: 'pending',
      isStandAbove: true,
      emit: () => this.scene.events.emit('walkToBooth', this.parentContainer)
    };
  }

  modifyTaskForOrderTicket(task) {
    task.emit = () => {
      let isTicketTaken = this.scene.events.emit('takeTicketFromTable', this.parentContainer.orderTicket);
      if(isTicketTaken) {
        this.parentContainer.orderTaken();
      }
    };
  }

  modifyTaskForCheckReady(task) {
    task.emit = () => {
      this.scene.events.emit('bringCheck', this.parentContainer.customerToDestroy);
    };
    this.parentContainer.checkReady = false;
  }

  modifyTaskForDirtyDishes(task) {
    task.emit = () => {
      let isDishesTaken = this.scene.events.emit('takeDirtyDishesFromTable', this.parentContainer.dirtyDishes);
      if(isDishesTaken) {
        this.parentContainer.dishesTaken();
      }
    };
  }

  handleBuyingProcess() {
    if(this.isBuying) {
      this.handleBuying();
    } else {
      this.startBuyingProcess();
    }
  }

  handleBuying() {
    if(this.scene.money >= 1000) {
      this.parentContainer.setIsActive();
    } else {
      this.showInsufficientFundsMessage();
    }
  }

  startBuyingProcess() {
    this.tableText.setText('Confirm');
    this.tableText.setStyle({ fill: '#0f0' });
    this.isBuying = true;
    this.scheduleResetTextEvent();
  }

  showInsufficientFundsMessage() {
    this.tableText.setText('not enough\n$$');
    this.tableText.setStyle({ fill: '#f00' });
    this.isBuying = false;
    this.scheduleResetTextEvent();
  }

  scheduleResetTextEvent() {
    this.resetTextEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.tableText.setText('-$1000');
        this.tableText.setStyle({ fill: '#f00' });
        this.isBuying = false;
      },
      loop: false
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
    this.initializeProperties(isLeft, setNumber);
  }

  initializeProperties(isLeft, setNumber) {
    this.name = `${isLeft ? 'Left' : 'Right'}Chair`;
    this.isLeft = isLeft;
    this.number = setNumber;
    this.isActive = false;

    this.chairBase = this.scene.add.image(0, 0, 'ChairBase').setOrigin(0.5);
    this.chairColor = this.scene.add.image(0, 0, 'ChairColor').setOrigin(0.5);
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