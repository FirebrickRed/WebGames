import { colors } from './constants';

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
    this.draggingCustomer;
    
    let totalWidth = 0;
    // Render all customers and put them in a variable array
    for(let i = 0; i < this.numberOfCustomers; i++) {
      // TODO have to adjust to accomidate for space between the characters
      const customer = new Customer(scene, i*55, 0, `customer ${i}`, i);
      totalWidth += customer.width;
      customer.setColor();
      this.customers.push(customer);
    }
    this.add(this.customers);

    this.setSize(totalWidth, this.customers[0].height);
    this.setInteractive({ draggable: true });

    this.on('pointerdown', (pointer, localX, localY, event) => {
      // Gets which customer is being dragged
      let topMostChild = null;
      let topMostDepth = -1;
      this.list.forEach(child => {
        if (child.getBounds().contains(pointer.x, pointer.y)) {
          if (child.depth > topMostDepth) {
            topMostChild = child;
            topMostDepth = child.depth;
          }
        }
      });
      if (topMostChild) {
        console.log('Clicked child: ' + topMostChild.name + ' ' + topMostChild.color);
        this.draggingCustomer = topMostChild;
      }
    });

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated && !this.isOverChair) {
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
      const table = target.parentContainer;
      this.setPosition(table.x, table.y);

      for (let i = 0; i < this.customers.length; i++) {
        const currentCustomerIndex = (this.draggingCustomer.number + i) % this.customers.length;
        const currentChairIndex = (target.number + i) % target.parentContainer.chairs.length;
        const chair = target.parentContainer.chairs[currentChairIndex];
        this.customers[currentCustomerIndex].flipX = !chair.isLeft;
        this.customers[currentCustomerIndex].chair = chair;

        console.log({customer: this.customers[currentCustomerIndex].color, customerX: this.customers[currentCustomerIndex].x, customerY: this.customers[currentCustomerIndex].y, chair: chair.name, chairX: chair.x, chairY: chair.y})

        this.customers[currentCustomerIndex].setPosition(chair.x, chair.y);
        // this.customers[currentCustomerIndex].setPosition(0, 0);
      }
    });
    this.on('dragleave', (pointer) => {
      this.isOverChair = false;
      console.log('in dragleave', {pointer})
      // this.setPosition(pointer.x, pointer.y);
      this.draggingCustomer.setPosition(0, 0);
    });
    this.on('drop', (pointer, target) => {
      if(target.getIsOccupied()) {
        // TODO need to make customer draggable again not sure why broken
        console.log('in occupied table?', this)
        this.setPosition(this.originalPointX, this.originalPointY);
      } else {
        this.booth = target.parentContainer;
        this.isSeated = true;
        this.setPosition(this.booth.x, this.booth.y);
        this.booth.setBoothOccupied(true);
        this.customers.forEach(customer => customer.chair.setColor(customer.color));
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

class Customer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, setName, setNumber) {
    super(scene, x, y);
    this.name = setName;
    this.number = setNumber
    this.color;
    this.chair;

    this.customerBase = scene.add.image(0, 0, 'IaniteBase').setOrigin(0.5);
    this.customerColor = scene.add.image(0, 0, 'IaniteColor').setOrigin(0.5);
    
    this.setSize(this.customerBase.width, this.customerBase.height);
    this.add([this.customerBase, this.customerColor]);
  }

  setColor() {
    const colorKey = Object.keys(colors);
    const randomIndex = Math.floor(Math.random() * colorKey.length);
    const randomColor = colorKey[randomIndex]
    this.color = randomColor;
    this.customerColor.setTint(colors[this.color])
    console.log(`${this.name} ${this.color}`)
  }
}

export default CustomerGroup;