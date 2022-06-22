import Customer from "./customer";
import Booth from "./booth";
import Player from "./player";
import { Kitchen } from "./kitchen";

const game = new Phaser.Game({
  title: 'DineAtNite',
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
});

let player;

function preload() {
  this.load.image('background', './assets/bg.jpg');
  // this.load.spritesheet('player', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('player', './assets/penguin.png');
  this.load.image('customer', './assets/crab.png');
  this.load.image('table', './assets/table.png');
  this.load.image('chair', './assets/chair.png');
  this.load.image('OrderTicket', './assets/orderTicket.jpg');
  this.load.image('TicketHolder', './assets/orderticketholder.jpg');
  this.load.image('cleanSink', './assets/cleanSink.jpg');
  this.load.image('Meal', './assets/meal.png');
  this.load.image('dirtyDishes', './assets/dirtyDishes.png');
}

function create() {
  this.add.image(0, 0, 'background').setOrigin(0);
  this.input.mouse.disableContextMenu();


  let kitchen = new Kitchen(this, 400, 0);
  this.add.existing(kitchen);
  
  player = new Player(this, 150, 175);
  this.add.existing(player);

  let booth1 = new Booth(this, 250, 400, 1);
  let booth2 = new Booth(this, 550, 400, 2);
  this.add.existing(booth1);
  this.add.existing(booth2);
  this.add.existing(new Customer(this, 50, 525));
  this.add.existing(new Customer(this, 50, 425));

  this.input.on('pointerdown', pointer => {
    if(pointer.rightButtonDown()) {
      player.clearTasks();
    }
  })

  // this.input.on('gameobjectup', (pointer, gameObject, event) => {
    // console.log(gameObject)
    // switch(gameObject.name) {
    //   case 'table':
    //     player.addTask({
    //       x: gameObject.parentContainer.x,
    //       y: gameObject.parentContainer.y - player.height,
    //       status: 'pending',
    //       isPickUp: true,
    //       object: gameObject.parentContainer
    //     });
    //     break;
    //   case 'TicketHolder':
    //     player.addTask({
    //       x: gameObject.parentContainer.x + gameObject.x,
    //       y: gameObject.parentContainer.y + gameObject.y + player.height,
    //       status: 'pending',
    //       isPickUp: false,
    //       object: gameObject.parentContainer
    //     });
    //     break;
    //   case 'Sink':
    //     player.addTask({
    //       x: gameObject.parentContainer.x + gameObject.x,
    //       y: gameObject.parentContainer.y + gameObject.y + player.height,
    //       status: 'pending',
    //       isPickUp: false,
    //       object: gameObject.parentContainer
    //     });
    //     break;
    //   case 'meal':
    //     player.addTask({
    //       x: gameObject.x,
    //       y: gameObject.y,
    //       status: 'pending',
    //       isPickUp: true,
    //       object: gameObject
    //     });
    //     break;
    // }
  // });
}

function update() {
}