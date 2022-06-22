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
      if(task.object && task.object.name === 'booth') {
        task.y -= this.height/2;
      } else {
        task.y += this.height/2;
      }
      this.tasks.push(task);
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
    // if(this.currentTask && this.currentTask.status === 'arrived') {
    //   // console.log(this.currentTask);
    //   // Pick up order
    //   // Drop off order to window
    //   // Pick up food
    //   // Drop off food
    //   // Pick up dirty dishes
    //   // Drop off dirty dishes
    //   if(this.currentTask.pickUp) {
    //     if(!this.leftHand) {
    //       this.leftHand = this.currentTask.pickUp;
    //       this.currentTask.afterPickup();
    //     } else if(!this.rightHand) {
    //       this.rightHand = this.currentTask.pickUp;
    //       this.currentTask.afterPickup();
    //     }
    //   }
    //   if(this.currentTask.dropOff) {
    //     console.log('left hand: ', this.leftHand);
    //     if(this.leftHand && this.leftHand.name === this.currentTask.dropOff) {
    //       this.leftHand = this.leftHand.droppedOff();
    //     }
    //     if(this.rightHand && this.rightHand.name === this.currentTask.dropOff) {
    //       this.rightHand = this.rightHand.droppedOff();
    //     }
    //   }
    //   this.currentTask.status = 'finished';
    // }
    // if(this.currentTask && this.currentTask.status === 'finished') {
    //   this.currentTask = undefined;
    // }
    // if(this.leftHand) {
    //   this.leftHand.x = this.x - 20;
    //   this.leftHand.y = this.y;
    // }
    // if(this.rightHand) {
    //   this.rightHand.x = this.x + 20;
    //   this.rightHand.y = this.y;
    // }
  }

  getTasks() {
    return this.tasks;
  }

  clearTasks() {
    this.tasks = [];
  }
}

export default Player;