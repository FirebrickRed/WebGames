export class HUD extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'buttonTexture');
    this.leftHand = null;
    this.rightHand = null;
  }

  setLeftHand(item) {
    this.leftHand = item;
  }

  getLeftHand() {
    return this.leftHand;
  }

  getRightHand() {
    return this.rightHand;
  }

  setRightHand(item) {
    this.rightHand = item;
  }
}