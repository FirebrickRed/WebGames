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

    scene.events.on('addTask', task => {
      if(task.isStandAbove) {
        task.y -= this.height/2;
      } else {
        task.x -= this.width * 2;
      }
      this.tasks.push(task);
    });

    scene.events.on('walkToBooth', booth => {
      let pointsToAdd = 0;
      if(this.leftHand && this.leftHand.name === 'Meal' && !this.leftHand.isDirty && this.leftHand.tableNumber === booth.tableNumber ) {
        this.leftHand = this.leftHand.droppedOff(booth.x, booth.y);
        pointsToAdd = 100;
      }
      if(this.rightHand && this.rightHand.name === 'Meal' && this.rightHand.tableNumber === booth.tableNumber) {
        this.rightHand = this.rightHand.droppedOff(booth.x, booth.y);
        pointsToAdd = 100;
      }
      this.finishedTask(pointsToAdd);
    });

    scene.events.on('walkToSink', () => {
      let pointsToAdd = 0;
      if(this.leftHand && this.leftHand.name === 'Meal' && this.leftHand.isDirty) {
        this.leftHand = this.leftHand.cleanDish();
        pointsToAdd = 20;
      }
      if(this.rightHand && this.rightHand.name === 'Meal' && this.rightHand.isDirty) {
        this.rightHand = this.rightHand.cleanDish();
        pointsToAdd = 20;
      }
      this.finishedTask(pointsToAdd);
    });

    scene.events.on('takeTicketFromTable', orderTicket => {
      if(!this.leftHand) {
        this.leftHand = orderTicket;
      } else if(!this.rightHand) {
        this.rightHand = orderTicket;
      }
      orderTicket.addToScene();
      this.finishedTask(50);
    });

    scene.events.on('ticketHolderTakesTicket', () => {
      if(this.leftHand && this.leftHand.name === 'OrderTicket') {
        this.leftHand = this.leftHand.droppedOff();
        this.scene.events.emit('startFurnace');
      }
      if(this.rightHand && this.rightHand.name === 'OrderTicket') {
        this.rightHand = this.rightHand.droppedOff();
        this.scene.events.emit('startFurnace');
      }
      this.finishedTask();
    });

    scene.events.on('pickUpMeal', meal => {
      if(!this.leftHand) {
        this.leftHand = meal;
        meal.setIsPickedUp(true);
      } else if(!this.rightHand) {
        this.rightHand = meal;
        meal.setIsPickedUp(true);
      }
      this.finishedTask();
    });

    scene.events.on('takeDirtyDishesFromTable', dirtyDishes => {
      if(!this.leftHand) {
        this.leftHand = dirtyDishes;
      } else if(!this.rightHand) {
        this.rightHand = dirtyDishes;
      }
      this.finishedTask();
    });

    scene.events.on('bringCheck', customerToDestroy => {
      this.finishedTask(100);
      scene.updateMoney(20);
      customerToDestroy.destroy();
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

  finishedTask(pointsToAdd) {
    this.currentTask = undefined;
    if(pointsToAdd > 0) {
      this.scene.updateScore(pointsToAdd);
    }
  }

  getTasks() {
    return this.tasks;
  }

  clearTasks() {
    this.tasks = [];
  }
}

export default Player;