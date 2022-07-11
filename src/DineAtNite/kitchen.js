export class Kitchen extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.name = 'Kitchen';
    this.ticketHolder = new TicketHolder(scene, -150, 50);
    this.sink = new Sink(scene, 300, 75);
    this.meals = [];

    this.add([this.ticketHolder, this.sink]);

    this.scene.events.on('startMeal', tableNumber => {
      this.scene.time.delayedCall(5000, () => {
        let mealCount = this.meals.length+1;
        console.log(mealCount)
        let mealX = 350;
        let mealY = 75;
        if(mealCount % 2 === 0) {
          mealX += 75;
        } else if (mealCount % 3 === 0) {
          mealX += 150;
        }
        this.meals.push(new Meal(this.scene, mealX, mealY, tableNumber));
      });
    });
  }

  orderTaken(tableNumber) {
    this.meals.filter(meal => meal.tableNumber !== tableNumber);
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
    this.setScale(0.25);
    this.setInteractive();
    scene.children.add(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  droppedOff() {
    this.scene.events.emit('startMeal', this.tableNumber);
    this.destroy();
    return null;
  }
}

export class Meal extends Phaser.GameObjects.Image {
  constructor(scene, x, y, tableNumber) {
    super(scene, x, y, 'Meal');
    this.name = 'Meal';
    this.tableNumber = tableNumber;
    this.setInteractive();
    scene.children.add(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
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
    this.setTexture('dirtyDishes');
    this.isDirty = true;
  }

  droppedOff(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.scene.events.emit('startEating', this);
    return null;
  }

  cleanDish() {
    this.destroy();
    return null;
  }
}