
class Customer extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'customer');
    this.setInteractive({ draggable: true });

    this.name = 'customer';
    this.originalPointX = x;
    this.originalPointY = y;
    this.isSeated = false;
    this.booth = null;
    this.speed = 10000;

    this.on('drag', (pointer, dragX, dragY) => {
      if(!this.isSeated) {
        this.x = dragX;
        this.y = dragY;
      }
    });
    this.on('drop', (pointer, target) => {
      if(!target.getIsOccupied()) {
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
      } else {
        this.x = this.originalPointX;
        this.y = this.originalPointY;
      }
    });
    this.on('dragend', () => {
      if(!this.isSeated) {
        this.x = this.originalPointX;
        this.y = this.originalPointY;
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