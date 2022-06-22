import { GameObjects, Math as pMath } from 'phaser';
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
const game = new Phaser.Game(config);
const {Vector2} = pMath;

let player;
let target;
let tables;
let customers;
let chair;

function preload() {
  // this.load.setBaseURL('http://labs.phaser.io');
  // this.load.image('test', 'assets/sprites/car.png');
  this.load.image('background', './assets/bg.jpg');
  this.load.spritesheet('player', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('table', './assets/table.png');
  this.load.image('chair', './assets/chair.png');
}

function create() {
  this.add.image(0, 0, 'background').setOrigin(0, 0);
  // Disables right click
  this.input.mouse.disableContextMenu();

  player = this.physics.add.sprite(10, 10, 'player');
  player.body.setAllowGravity(false);

  
  let Table = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize: function Table(scene, x, y) {
      Phaser.GameObjects.Image.call(this, scene);
      this.setTexture('table');
      this.setPosition(x, y);
      this.setOrigin(0);
      this.setScale(0.1);
      this.name = 'table';
      scene.children.add(this);
    }
  });

  // {
  //   table: new Table(),
  //   leftChair: new Chair(),
  //   rightChair: new Chair(),
  // }

  let Chair = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize: function Chair(scene, x, y) {
      Phaser.GameObjects.Image.call(this, scene);
      this.setTexture('chair');
      this.setPosition(x, y);
      this.setOrigin(0);
      this.setScale(0.15);
      this.setInteractive({ dropZone: true });
      this.name = 'chair';
      scene.children.add(this);
    }
  })

  let Customer = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize: function Customer(scene, x, y) {
      Phaser.GameObjects.Image.call(this, scene);
      this.setTexture('player');
      this.setPosition(x, y);
      // this.setOrigin(0);
      this.setInteractive({ draggable: true });
      this.name = 'customer';
      this.originalPointX = x;
      this.originalPointY = y;
      this.isSeated = false;
      this.on('drag', (pointer, dragX, dragY) => {
        if(!this.isSeated) {
          this.x = dragX;
          this.y = dragY;
        }
      });
      this.on('drop', (pointer, target) => {
        console.log('in drop: ', pointer, target);
        this.x = target.x + 50;
        this.y = target.y + 20;
        this.isSeated = true;
      })
      this.on('dragend', () => {
        if(!this.isSeated) {
          this.x = this.originalPointX;
          this.y = this.originalPointY;
        }
      });
      scene.children.add(this);
    }
  });

  tables = new Table(this, 300, 400);
  chair = new Chair(this, 225, 385);
  customers = new Customer(this, 25, 525);
  console.log('chair', chair);
  // customers.setInteractive(new Phaser.Geom.Circle(45, 46, 45), Phaser.Geom.Circle.Contains);
  // customers.on('pointer')
  // this.input.setDraggable(customers, true);

  //#region commented out
  // target = new Vector2();
  
  // // tables = this.physics.add.staticGroup();
  // tables = this.add.image(400, 300, 'table').setScale(0.1);
  // // tables.create(400, 500, 'table');
  // // tables.create(600, 400, 'table');
  // tables.setInteractive();
  
  // // tables.on('pointerup', pointer => {
  // //   const { worldX, worldY } = pointer;

  // //   target.x = worldX;
  // //   target.y = worldY;

  // //   this.physics.moveToObject(player, target, 200);
  // // });

  // this.input.on('gameobjectup', (pointer, gameObject) => {
  //   console.log(`Clicked:`);
  //   console.log(pointer);
  //   console.log(gameObject);
  // }, this);

  // this.physics.add.collider(player, tables);

  // let test = this.add.sprite(0, 0, 'test').setOrigin(0, 0).setInteractive();

  // this.input.on('pointerup', pointer => {
  //   if(pointer.leftButtonReleased()) {
  //     console.log('left button was released');
  //   } else if(pointer.rightButtonReleased()) {
  //     console.log('right button was released');
  //   } else if(pointer.middleButtonReleased()) {
  //     console.log('middle button was released');
  //   } else if(pointer.backButtonReleased()) {
  //     console.log('back button was released');
  //   } else if(pointer.forwardButtonReleased()) {
  //     console.log('Forward button was released');
  //   }
  // });
  // test.on('pointerdown', pointer => {
  //   console.log('clicked!');
  // });
  // this.input.setDraggable(test);
  // this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
  //   gameObject.x = dragX;
  //   gameObject.y = dragY;
  // })
  //#endregion
}

function update() {
  // const pointer = this.input.activePointer;
  // console.log(pointer);

  if(player.body.speed > 0) {
    const distance = pMath.Distance.Between(player.x, player.y, target.x, target.y);

    if(distance < 4) {
      player.body.reset(target.x, target.y);
    }
  }
}