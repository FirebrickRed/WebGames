export class Kitchen extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.name = 'Kitchen';
    this.ticketHolder = new TicketHolder(scene, 815, 175);
    this.sink = new Sink(scene, 815, 650);
    this.furnace = scene.add.sprite(815, 275, 'Furnace');
    this.meals = [];

    this.add([this.ticketHolder, this.sink, this.furnace]);

    scene.events.on('startMeal', tableNumber => {
      scene.time.delayedCall(5000, () => {
        let mealCount = this.meals.length+1;
        let mealX = 1215;
        let mealY = 350;
        if(mealCount % 2 === 0) {
          mealX += 75;
        } else if (mealCount % 3 === 0) {
          mealX += 150;
        }
        this.meals.push(new Meal(this.scene, mealX, mealY, tableNumber));
      });
    });

    scene.events.on('startFurnace', () => {
      this.furnace.play('FurnaceAnimation');
      scene.time.delayedCall(5000, () => {
        this.furnace.setTexture('Furnace');
      });
    });
  }

  orderTaken(tableNumber) {
    this.meals.forEach((meal, index) => {
      if(meal.tableNumber === tableNumber) {
        meal.destroy();
        this.meals.splice(index, 1);
      }
    });
  }
}

export class TicketHolder extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'TicketHolder');
    this.name = 'TicketHolder';
    this.setInteractive();

    this.on('pointerup', () => {
      this.scene.events.emit('addTask', {
        x: this.parentContainer.x + this.x,
        y: this.parentContainer.y + this.y,
        status: 'pending',
        emit: () => {
          this.scene.events.emit('ticketHolderTakesTicket');
        }
      });
    });
  }
}

export class Sink extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'cleanSink');
    this.name = 'Sink';
    this.setInteractive();

    this.on('pointerup', () => {
      this.scene.events.emit('addTask', {
        x: this.parentContainer.x + this.x,
        y: this.parentContainer.y + this.y,
        status: 'pending',
        emit: () => this.scene.events.emit('walkToSink', this)
      });
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
    this.name = 'Meal';
    this.tableNumber = tableNumber;
    this.setInteractive();
    scene.children.add(this);
    this.isPickedUp = false;
    this.isDirty = false;

    this.on('pointerup', () => {
      if(!this.isPickedUp) {
        this.scene.events.emit('addTask', {
          x: this.x,
          y: this.y,
          status: 'pending',
          emit: () => this.scene.events.emit('pickUpMeal', this)
        });
      }
    });
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