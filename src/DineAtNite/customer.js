class CustomerGroup extends Phaser.GameObjects.Container {
  constructor(scene, x, y, numberOfCustomers) {
    super(scene, x, y);
    this.numberOfCustomers = numberOfCustomers;
    this.customers = [];
    this.originalPointX = x;
    this.originalPointY = y;
    this.isSeated = false;
    this.isOverChair = false;
    this.booth = null;
    this.speed = 10000;
    
    for(let i = 0; i < this.numberOfCustomers; i++) {
      this.customers.push(new Customer(scene, i*50, 0));
    }
    
    this.add(this.customers);
    let width = this.customers.length === 1 ? this.customers[0].width : this.customers.reduce((prev, current) => prev.width+current.width);
    let height = this.customers[0].height;
    // console.log('Urhm ', width);
    this.setSize(width, height);
    this.setInteractive({ draggable: true });
    console.log(this);

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated && !this.isOverChair) {
        this.x = dragX;
        this.y = dragY;
      }
    });
    this.on('dragend', ()=> {
      if(!this.isSeated) {
        this.x = this.originalPointX;
        this.y = this.originalPointY;
      }
    });
    this.on('dragover', (pointer, target) => {
      this.isOverChair = true;
      this.x = target.x + target.parentContainer.x;
      this.y = target.parentContainer.y;
      // To do: for second customer have them sit on the other chair
    });
    this.on('dragleave', () => {
      this.isOverChair = false;
    });
    this.on('drop', (pointer, target) => {
      if(target.getIsOccupied()) {
        this.x = this.originalPointX;
        this.y = this.originalPointY
      } else {
        this.booth = target.parentContainer;
        this.isSeated = true;
        this.x = this.booth.x + target.x;
        this.y = this.booth.y;
        this.flipX = !target.isLeft;
        this.booth.setBoothOccupied(true);
        this.disableInteractive();
        this.scene.time.delayedCall(this.speed, () => {
          this.booth.readyToOrder();
        });
      }
    });

    this.scene.events.on('startEating', meal => {
      if(this.booth && this.booth.tableNumber === meal.tableNumber) {
        this.scene.time.delayedCall(this.speed, () => {
          this.booth.finishedEating(meal);
          this.destroy();
        });
      }
    });
  }
}

class Customer extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'customer');
    this.name = 'customer';
    this.setInteractive({ draggable: true });
    this.originalPointX = x;
    this.originalPointY = y;
    this.isSeated = false;
    this.isOverChair = false;
    this.booth = null;
    this.speed = 10000;

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated && !this.isOverChair) {
        this.x = dragX;
        this.y = dragY;
      }
    });
    this.on('dragend', ()=> {
      if(!this.isSeated) {
        this.x = this.originalPointX;
        this.y = this.originalPointY;
      }
    });
    this.on('dragover', (pointer, target) => {
      this.isOverChair = true;
      this.x = target.x + target.parentContainer.x;
      this.y = target.parentContainer.y;
      // To do: for second customer have them sit on the other chair
    });
    this.on('dragleave', () => {
      this.isOverChair = false;
    });
    this.on('drop', (pointer, target) => {
      if(target.getIsOccupied()) {
        this.x = this.originalPointX;
        this.y = this.originalPointY
      } else {
        this.booth = target.parentContainer;
        this.isSeated = true;
        this.x = this.booth.x + target.x;
        this.y = this.booth.y;
        this.flipX = !target.isLeft;
        this.booth.setBoothOccupied(true);
        this.disableInteractive();
        this.scene.time.delayedCall(this.speed, () => {
          this.booth.readyToOrder();
        });
      }
    });

    this.scene.events.on('startEating', meal => {
      if(this.booth && this.booth.tableNumber === meal.tableNumber) {
        this.scene.time.delayedCall(this.speed, () => {
          this.booth.finishedEating(meal);
          this.destroy();
        });
      }
    });
  }
}

export default Customer;