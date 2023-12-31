class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.initializeProperties();
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.initializeEventListeners(scene);
  }
  
  initializeProperties() {
    this.name = 'player';
    this.currentTask;
    this.tasks = [];
    this.leftHand = null;
    this.rightHand = null;
    this.walkSpeed = 250;
    this.setInteractive();
  }

  initializeEventListeners(scene) {
    scene.events.on('addTask', this.handleAddTask.bind(this));
    scene.events.on('walkToBooth', this.handleWalkToBooth.bind(this));
    scene.events.on('walkToSink', this.handleWalkToSink.bind(this));
    scene.events.on('takeTicketFromTable', this.handleTakeTicketFromTable.bind(this));
    scene.events.on('ticketHolderTakesTicket', this.handleTicketHolderTakesTicket.bind(this));
    scene.events.on('pickUpMeal', this.handlePickUpMeal.bind(this));
    scene.events.on('takeDirtyDishesFromTable', this.handleTakeDirtyDishesFromTable.bind(this));
    scene.events.on('bringCheck', this.handleBringCheck.bind(this));
  }

  handleAddTask(task) {
    if(task.isStandAbove) {
      task.y -= this.height/2;
    } else {
      task.x -= this.width * 2;
    }
    this.tasks.push(task);
  }

  handleWalkToBooth(booth) {
    let pointsToAdd = 0;
    if(this.leftHand && this.leftHand.name === 'Meal' && !this.leftHand.isDirty && this.leftHand.tableNumber === booth.tableNumber) {
      this.leftHand = this.leftHand.droppedOff(booth.x, booth.y);
      pointsToAdd = 100;
    }
    if(this.rightHand && this.rightHand.name === 'Meal' && this.rightHand.tableNumber === booth.tableNumber) {
      this.rightHand = this.rightHand.droppedOff(booth.x, booth.y);
      pointsToAdd = 100;
    }
    this.finishedTask(pointsToAdd);
  }

  handleWalkToSink() {
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
  }

  handleTakeTicketFromTable(orderTicket) {
    if(!this.leftHand) {
      this.leftHand = orderTicket;
    } else if(!this.rightHand) {
      this.rightHand = orderTicket;
    }
    orderTicket.addToScene();
    this.finishedTask(50);
  }

  handleTicketHolderTakesTicket() {
    if(this.leftHand && this.leftHand.name === 'OrderTicket') {
      this.leftHand = this.leftHand.droppedOff();
      this.scene.events.emit('startFurnace');
    }
    if(this.rightHand && this.rightHand.name === 'OrderTicket') {
      this.rightHand = this.rightHand.droppedOff();
      this.scene.events.emit('startFurnace');
    }
    this.finishedTask();
  }

  handlePickUpMeal(meal) {
    if(!this.leftHand) {
      this.leftHand = meal;
      meal.setIsPickedUp(true);
    } else if(!this.rightHand) {
      this.rightHand = meal;
      meal.setIsPickedUp(true);
    }
    this.finishedTask();
  }

  handleTakeDirtyDishesFromTable(dirtyDishes) {
    if(!this.leftHand) {
      this.leftHand = dirtyDishes;
    } else if(!this.rightHand) {
      this.rightHand = dirtyDishes;
    }
    this.finishedTask();
  }

  handleBringCheck(customerToDestroy) {
    this.finishedTask(100);
    this.scene.updateMoney(20);
    customerToDestroy.destroy();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.handleMovement();
    this.updateItemPositions();
  }

  handleMovement() {
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
  }

  updateItemPositions() {
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
      // after game over scene
      console.log('properties undefined: ', this.scene);
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