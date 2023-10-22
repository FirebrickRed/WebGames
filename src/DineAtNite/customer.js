import { GameConfig } from './config';

class CustomerGroup extends Phaser.GameObjects.Container {
  constructor(scene, x, y, numberOfCustomers) {
    super(scene, x, y);
    this.scene = scene;
    this.numberOfCustomers = numberOfCustomers;
    this.isDestroyed = false;
    this.isSeated = false;
    this.isOverChair = false;
    this.booth = null;
    this.speed = 10000;
    this.draggingCustomer;
    this.happiness = 10;
    this.patience = 15000;
    this.isWaiting = true;
    this.hearts = [];
    this.checkReady = false;

    this.customers = [];
    this.originalPointX = x;
    this.originalPointY = y;
    this.initializeCustomers();
    this.initializeHearts();

    this.setSize(this.customers[0].width * this.customers.length, this.customers[0].height);

    this.setInteractive({ draggable: true });

    this.handlePointerEvents();

    scene.add.existing(this);
  }

  initializeCustomers() {
    let totalWidth = 0;
    for(let i = 0; i < this.numberOfCustomers; i++) {
      const customer = new Customer(this.scene, i * 55, 0, `customer ${i}`, i);
      customer.setColor();
      this.customers.push(customer);
      totalWidth += customer.width;
    }
    this.add(this.customers);
    // this.setSize(totalWidth, this.customers[0].height);
  }

  initializeHearts() {
    for(let i = 0; i < 5; i++) {
      const heart = this.scene.add.image(-30, -30 + i * 15, 'Heart');
      heart.setScale(0.3);
      heart.setTint('0xff0000');
      this.hearts.push(heart);
      this.add(heart);
    }
  }

  handlePointerEvents() {
    this.on('pointerdown', (pointer, localX, localY, event) => {
      let topMostChild = null;
      let topMostDepth = -1;
      this.customers.forEach(customer => {
        if(customer.getBounds().contains(pointer.x, pointer.y)) {
          if(customer.depth > topMostDepth) {
            topMostChild = customer;
            topMostDepth = customer.depth;
          }
        }
      });
      if(topMostChild) {
        this.draggingCustomer = topMostChild;
      }
    });

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated && !this.isOverChair) {
        this.setPosition(dragX, dragY);
      }
    });

    this.on('dragend', () => {
      if(!this.isSeated) {
        this.setPosition(this.originalPointX, this.originalPointY);
        this.customers.forEach(customer => customer.resetPosition());
        this.shiftHeartsVertically();
      }
    });

    this.on('dragover', (pointer, target) => {
      this.isOverChair = true;
      const table = target.parentContainer;
      this.setPosition(table.x, table.y);

      for(let i = 0; i < this.customers.length; i++) {
        const currentCustomerIndex = (this.draggingCustomer.number + i) % this.customers.length;
        const currentChairIndex = (target.number + i) % target.parentContainer.chairs.length;
        const chair = target.parentContainer.chairs[currentChairIndex];
        this.customers[i].flipCustomer(!chair.isLeft);
        this.customers[currentCustomerIndex].chair = chair;
        this.customers[currentCustomerIndex].setPosition(chair.x, chair.y - 15);
      }

      this.shiftHeartsHorizontally(target.parentContainer);
    });

    this.on('dragleave', () => {
      this.isOverChair = false;
      this.customers.forEach(customer => customer.resetPosition());
      this.shiftHeartsVertically();
    });

    this.on('drop', (pointer, target) => {
      if(target.getIsOccupied()) {
        this.isOverChair = false;
        this.setPosition(this.originalPointX, this.originalPointY);
      } else {
        this.isWaiting = false;
        this.booth = target.parentContainer;
        this.isSeated = true;
        this.setPosition(this.booth.x, this.booth.y);
        this.booth.setBoothOccupied(true);
        this.customers.forEach(customer => {
          customer.chair.setColor(customer.color);
          customer.playCustomerAnimation('Menu');
        });
        this.disableInteractive();
        this.scene.updateScore(20 * this.customers.length);
        this.scene.moveUpLine();
        this.shiftHeartsHorizontally(this.booth);
        this.scene.time.delayedCall(this.speed, () => {
          this.booth.readyToOrder();
          this.isWaiting = true;
          this.customers.forEach(customer => customer.playCustomerAnimation('ReadyToOrder'));
        });
      }
    });

    this.scene.events.on('startEating', meal => {
      if(this.scene) {
        if(this.booth && this.booth.tableNumber === meal.tableNumber) {
          this.isWaiting = false;
          this.customers.forEach(customer => customer.playCustomerAnimation('Eat'));
          this.scene.time.delayedCall(this.speed, () => {
            this.booth.finishedEating(meal, this);
            this.checkReady = true;
            this.customers.forEach(customer => customer.playCustomerAnimation('ReadyToOrder'));
          });
        }
      }
    });

    this.scene.events.on('orderTakenStartAnimation', () => {
      // causes every customer on screen to sitWait
      // this.customers.forEach(customer => customer.playCustomerAnimation('SitWait'));
    });
  }

  setY(y) {
    this.setPosition(this.x, y);
    this.originalPointY = y;
  }

  shiftHeartsHorizontally(booth) {
    this.hearts.forEach((heart, index) => {
      heart.setPosition((booth.table.width * -1 + booth.chairs[0].width *2) + index * (booth.table.width / 6), this.height / 2);
    });
  }

  shiftHeartsVertically() {
    this.hearts.forEach((heart, index) => {
      heart.setPosition(-30, -30 + index * 15);
    });
  }

  destroyCustomer() {
    this.customers.forEach(customer => customer.destroy());
    this.isDestroyed = true;
    this.scene.moveUpLine();
    this.destroy();
  }

  update(time, delta, scene) {
    if(!this.isWaiting) {
      this.patience = time + 15000;
    }
    if(time > this.patience) {
      this.happiness--;
      this.patience = time + 15000;
      if(this.happiness % 2 === 0) {
        this.hearts.forEach((heart, i) => {
          heart.setTint(i < this.happiness/2 ? '0xff0000' : '0xffffff');
        });
      }
    }
    if (this.happiness <= 0) {
      console.log('before error ', {scene, this: this});
      console.log(-480 -20 * this.customers.length);
      scene.updateScore(-480 - 20 * this.customers.length);
      this.destroyCustomer();
    }
  }
}

class Customer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, setName, setNumber) {
    super(scene, x, y);
    this.name = setName;
    this.number = setNumber;
    this.originalPosition = {x, y};
    this.color;
    this.chair;

    this.customerBase = scene.add.sprite(0, 0, 'IaniteBase').setOrigin(0.5);
    this.customerColor = scene.add.sprite(0, 0, 'IaniteColor').setOrigin(0.5);

    // this.customerBase = scene.add.image(0, 0, 'IaniteBase').setOrigin(0.5);
    // this.customerColor = scene.add.image(0, 0, 'IaniteColor').setOrigin(0.5);
    
    // this.setSize(this.customerBase.width, this.customerBase.height);
    this.setSize(40, 100);
    this.add([this.customerBase, this.customerColor]);
    this.playCustomerAnimation('Wait');
  }

  setColor() {
    const colorKey = Object.keys(GameConfig.CUSTOMER_COLOR);
    const randomIndex = Math.floor(Math.random() * colorKey.length);
    const randomColor = colorKey[randomIndex];
    this.color = randomColor;
    this.customerColor.setTint(GameConfig.CUSTOMER_COLOR[this.color]);
  }

  resetPosition() {
    this.setPosition(this.originalPosition.x, this.originalPosition.y);
  }

  playCustomerAnimation(animationToPlay) {
    this.customerBase.play(`base${animationToPlay}`);
    this.customerColor.play(`color${animationToPlay}`);
  }

  flipCustomer(flipStatus) {
    this.customerBase.setFlip(flipStatus, false);
    this.customerColor.setFlip(flipStatus, false);
  }
}

export default CustomerGroup;