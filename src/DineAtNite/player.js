class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.name = 'player';
    this.currentTask;
    this.tasks = [];
    this.leftHand = null;
    this.rightHand = null;
    this.walkSpeed = 250;
    this.setInteractive();
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);

    this.scene.events.on('addTask', task => {
      if(task.isStandAbove) {
        task.y -= this.height/2;
      } else {
        task.y += this.height/2;
      }
      this.tasks.push(task);
    });

    this.scene.events.on('walkToBooth', booth => {
      if(this.leftHand && this.leftHand.name === 'Meal' && !this.leftHand.isDirty && this.leftHand.tableNumber === booth.tableNumber ) {
        this.leftHand = this.leftHand.droppedOff(booth.x, booth.y);
      }
      if(this.rightHand && this.rightHand.name === 'Meal' && this.rightHand.tableNumber === booth.tableNumber) {
        this.rightHand = this.rightHand.droppedOff(booth.x, booth.y);
      }
      this.finishedTask();
    });

    this.scene.events.on('walkToSink', () => {
      if(this.leftHand && this.leftHand.name === 'Meal' && this.leftHand.isDirty) {
        this.leftHand = this.leftHand.cleanDish();
      }
      if(this.rightHand && this.rightHand.name === 'Meal' && this.rightHand.isDirty) {
        this.rightHand = this.rightHand.cleanDish();
      }
      this.finishedTask();
    });

    this.scene.events.on('takeTicketFromTable', orderTicket => {
      let score = 0;
      if(!this.leftHand) {
        this.leftHand = orderTicket;
        score = 20;
      } else if(!this.rightHand) {
        this.rightHand = orderTicket;
        score = 20;
      }
      this.finishedTask(score);
    });

    this.scene.events.on('ticketHolderTakesTicket', () => {
      if(this.leftHand && this.leftHand.name === 'OrderTicket') {
        this.leftHand = this.leftHand.droppedOff();
      }
      if(this.rightHand && this.rightHand.name === 'OrderTicket') {
        this.rightHand = this.rightHand.droppedOff();
      }
      this.finishedTask();
    });

    this.scene.events.on('pickUpMeal', meal => {
      if(!this.leftHand) {
        this.leftHand = meal;
        meal.setIsPickedUp(true);
      } else if(!this.rightHand) {
        this.rightHand = meal;
        meal.setIsPickedUp(true);
      }
      this.finishedTask();
    });

    this.scene.events.on('takeDirtyDishesFromTable', dirtyDishes => {
      if(!this.leftHand) {
        this.leftHand = dirtyDishes;
      } else if(!this.rightHand) {
        this.rightHand = dirtyDishes;
      }
      this.finishedTask();
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if(this.tasks.length > 0 && this.currentTask === undefined) {
      this.currentTask = this.tasks.shift();
      this.scene.physics.moveToObject(this, this.currentTask, this.walkSpeed);
    }
    if(this.body.speed > 0) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTask.x, this.currentTask.y);
      if(distance < 10) {
        this.body.reset(this.currentTask.x, this.currentTask.y);
        this.currentTask.status = 'arrived';
        this.currentTask.emit();
      }
    }
    if(this.leftHand) {
      this.leftHand.x = this.x - 20;
      this.leftHand.y = this.y;
    }
    if(this.rightHand) {
      this.rightHand.x = this.x + 20;
      this.rightHand.y = this.y;
    }
  }

  finishedTask() {
    this.currentTask = undefined;
    console.log('in finished task');
  }

  getTasks() {
    return this.tasks;
  }

  clearTasks() {
    this.tasks = [];
  }
}

export default Player;