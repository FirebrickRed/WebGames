import { OrderTicket } from "./kitchen";
import { GameConfig } from './config';

class Booth extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tableNumber, tablePrice) {
    super(scene, x, y);
    this.initializeProperties(tableNumber, tablePrice)
    
    this.add([this.table, ...this.chairs]);
  }

  initializeProperties(tableNumber, tablePrice) {
    this.name = 'booth';
    this.isActive = false;
    this.isOccupied = false;
    this.tableNumber = tableNumber;
    this.occupyingCustomerGroup;
    this.table = new Table(this.scene, 0, 0, tableNumber, tablePrice);
    this.chairs = [new Chair(this.scene, -80, 0, true, 0), new Chair(this.scene, 80, 0, false, 1)];
  }

  setIsActive() {
    this.isActive = true;
    this.scene.updateMoney(-this.table.tablePrice);
    this.table.setIsActive();
    this.chairs.forEach(chair => chair.setIsActive());
  }

  updateTablePrice(newTablePrice) {
    this.table.updateTablePrice(newTablePrice);
  }
  
  setBoothOccupied(isBoothOccupied, customerGroup) {
    this.isOccupied = isBoothOccupied;
    this.occupyingCustomerGroup = customerGroup;
  }

  readyToOrder() {
    this.orderTicket = new OrderTicket(this.scene, this.x, this.y - 20, this.tableNumber);
  }

  orderTaken() {
    this.orderTicket = null;
    this.occupyingCustomerGroup.customers.forEach(customer => {customer.playCustomerAnimation('SitWait');});
  }

  dishesTaken() {
    this.dirtyDishes.setDirtyDishes();
    this.dirtyDishes = null;
    this.isOccupied = false;
  }

  finishedEating(meal) {
    this.dirtyDishes = meal;
    this.checkReady = true;
  }
}

class Table extends Phaser.GameObjects.Image {
  constructor(scene, x, y, tableNumber, tablePrice) {
    super(scene, x, y, 'table');
    this.initializeProperties(tableNumber, tablePrice);
    this.on('pointerup', this.handlePointerUp.bind(this));
  }

  initializeProperties(tableNumber, tablePrice) {
    this.name = 'table';
    this.isBuying = false;
    this.isActive = false;
    this.setInteractive();
    this.setTint('0x555555');
    this.tableText = this.scene.add.text(GameConfig.BOOTHS.PROPERTIES[tableNumber].X-50, GameConfig.BOOTHS.PROPERTIES[tableNumber].Y-30, `-$${tablePrice}`, { fontSize: '32px', fill: '#f00' }).setDepth(1);
    this.tablePrice = tablePrice;
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
      this.scene.events.emit('bringCheck', this.parentContainer.occupyingCustomerGroup);
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
    if(this.scene.money >= this.tablePrice) {
      this.parentContainer.setIsActive();
      this.scene.updateActiveTables();
    } else {
      this.showInsufficientFundsMessage();
    }
  }

  startBuyingProcess() {
    this.setTableText('Confirm', '#0f0');
    this.isBuying = true;
    this.scheduleResetTextEvent();
  }

  showInsufficientFundsMessage() {
    this.setTableText('not enough\n$$', '#f00');
    this.isBuying = false;
    this.scheduleResetTextEvent();
  }

  scheduleResetTextEvent() {
    this.resetTextEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.setTableText(`-$${this.tablePrice}`, '#f00');
        this.isBuying = false;
      },
      loop: false
    });
  }

  updateTablePrice(newTablePrice) {
    this.tablePrice = newTablePrice;
    this.setTableText(`-$${this.tablePrice}`, '#f00');
  }

  setTableText(text, fill) {
    if(this.tableText) {
      this.tableText.setText(text);
      this.tableText.setStyle({ fill: fill });
    }
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
    this.chairColor.setTint(GameConfig.CUSTOMER.CUSTOMER_COLOR[color]);
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