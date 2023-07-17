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
    
    let totalWidth = 0;
    for(let i = 0; i < this.numberOfCustomers; i++) {
      // TODO have to adjust to accomidate for space between the characters
      const customer = new Customer(scene, i*34, 0, `customer ${i}`, i);
      totalWidth += customer.width;
      this.customers.push(customer);
    }
    
    this.add(this.customers);
    let width = 100;
    let height = this.customers[0].height;
    this.setSize(width, height);
    this.setInteractive({ draggable: true });
    console.log(this);

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated && !this.isOverChair) {
        console.log('in drag')
        this.setPosition(dragX, dragY);
      }
    });
    this.on('dragend', ()=> {
      if(!this.isSeated) {
        this.setPosition(this.originalPointX, this.originalPointY);
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
        console.log('in occupied table?', this)
        this.setPosition(this.originalPointX, this.originalPointY);
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
  constructor(scene, x, y, setName, setNumber) {
    super(scene, x, y, 'customer');
    this.name = setName;
    this.number = setNumber
  }
}

export default CustomerGroup;