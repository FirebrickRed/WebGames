import {Scene, Math as pMath} from 'phaser';
const {Vector2} = pMath;

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  create() {
    // Set a nice background colour
    this.cameras.main.setBackgroundColor(0x3399FF);

    // Add and adjust our sprite
    this.cat = this.physics.add.sprite(10, 10, 'cat-like');
    this.cat.body.setAllowGravity(false);
    this.cat.setScale(0.5);

    // Adding an arrow is optional, but a nice touch
    this.arrow = this.physics.add.sprite(0, 0, 'arrow');
    this.arrow.body.setAllowGravity(false);
    this.arrow.setVisible(false);
    this.arrow.setScale(2);
    this.arrow.play({ key: 'arrow-osc', repeat: -1 });

    // Initialize our target position as a 2D vector
    this.target = new Vector2();
    
    // When the user releases the screen...
    this.input.on('pointerup', (pointer) => {
      // Get the WORLD x and y position of the pointer
      const {worldX, worldY} = pointer;
      
      // Assign the world x and y to our vector
      this.target.x = worldX;
      this.target.y = worldY;

      // Position the arrow at our world x and y
      this.arrow.body.reset(worldX, worldY);
      this.arrow.setVisible(true);

      // Start moving our cat towards the target
      this.physics.moveToObject(this.cat, this.target, 200);
    });
  }

  update() {
    // If the cat is moving...
    if (this.cat.body.speed > 0) {
      // Calculate it's distance to the target
      const d = pMath.Distance.Between(this.cat.x, this.cat.y, this.target.x, this.target.y);
      
      // If it's close enough,
      if (d < 4) {
        // Reset it's body so it stops, hide our arrow
        this.cat.body.reset(this.target.x, this.target.y);
        this.arrow.setVisible(false);
      }
    }
  }

}

export default GameScene;
