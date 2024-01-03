export class Kitchen extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.initializeComponents();
    this.initializeEventListeners();
  }
  
  initializeComponents() {
    this.name = 'Kitchen';
    this.ticketHolder = new TicketHolder(this.scene, 815, 175);
    this.sink = new Sink(this.scene, 815, 650);
    this.furnace = this.scene.add.sprite(815, 275, 'Furnace');
    this.meals = [];
    this.add([this.ticketHolder, this.sink, this.furnace]);
  }

  initializeEventListeners() {
    this.scene.events.on('startMeal', this.handleStartMeal.bind(this));
    this.scene.events.on('startFurnace', this.handleStartFurnace.bind(this));
  }

  handleStartMeal(tableNumber) {
    this.scene.time.delayedCall(5000, () => {
      let mealCount = this.meals.length+1;
      let mealX = 1215;
      let mealY = 350;
      if(mealCount % 2 === 0) {
        mealY += 75;
      } else if (mealCount % 3 === 0) {
        mealY += 150;
      }
      this.meals.push(new Meal(this.scene, mealX, mealY, tableNumber));
    });
  }

  handleStartFurnace() {
    this.furnace.play('FurnaceAnimation');
    this.scene.time.delayedCall(5000, () => {
      this.furnace.setTexture('Furnace');
    });
  }
}

export class TicketHolder extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'TicketHolder');
    this.name = 'TicketHolder';
    this.setInteractive();

    this.on('pointerup', this.handleClickEvent.bind(this));
  }

  handleClickEvent() {
    this.scene.events.emit('addTask', {
      x: this.parentContainer.x + this.x,
      y: this.parentContainer.y + this.y,
      status: 'pending',
      emit: () => {
        this.scene.events.emit('ticketHolderTakesTicket');
      }
    });
  }
}

export class Sink extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'cleanSink');
    this.name = 'Sink';
    this.setInteractive();

    this.on('pointerup', this.handleClickEvent.bind(this));
  }

  handleClickEvent() {
    this.scene.events.emit('addTask', {
      x: this.parentContainer.x + this.x,
      y: this.parentContainer.y + this.y,
      status: 'pending',
      emit: () => this.scene.events.emit('walkToSink', this)
    });
  }
}

export class OrderTicket extends Phaser.GameObjects.Image {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y, 'OrderTicket');
    this.name = 'OrderTicket';
    this.tableNumber = tableNumber;
  }
  
  addToScene() {
    this.scene.children.add(this);
  }

  droppedOff() {
    this.scene.events.emit('startMeal', this.tableNumber);
    this.destroy();
    return null;
  }
}

export class Meal extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y, 'ServingTray');
    this.initializeProperties(tableNumber);
    scene.children.add(this);
    
    this.on('pointerup',  this.handleClickEvent.bind(this));
  }
  
  initializeProperties(tableNumber) {
    this.name = 'Meal';
    this.tableNumber = tableNumber;
    this.isPickedUp = false;
    this.isDirty = false;
    // this.scene.add.text(0, 0, `#${this.tableNumber}`, { fontSize: '24px', fill: '#fff' });
    this.setInteractive();
  }

  handleClickEvent() {
    if(!this.isPickedUp) {
      this.scene.events.emit('addTask', {
        x: this.x,
        y: this.y,
        status: 'pending',
        emit: () => this.scene.events.emit('pickUpMeal', this)
      });
    }
  }

  setIsPickedUp(pickedUp) {
    this.isPickedUp = pickedUp
  }

  setDirtyDishes() {
    // this.setTexture('dirtyDishes');
    // this.setInteractive(false);  
    this.isDirty = true;
  }

  droppedOff(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.setTexture('DeliveredFood');
    // this.scene.anims.play('FoodToEat');
    this.scene.events.emit('startEating', this);
    return null;
  }

  cleanDish() {
    this.destroy();
    return null;
  }
}