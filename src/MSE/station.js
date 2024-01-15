
export function createStation(scene, key, x, y, gameStateManager, hud) {
  switch(key) {
    case 'RegisterStation':
      return new RegisterStation(scene, x, y, key, gameStateManager, hud);
    case 'BrewedCoffeeStation':
      return new BrewedCoffeeStation(scene, x, y, key, gameStateManager, hud);
    default:
      console.warn(`No station found for key: ${key}`);
      return null;
  }
}

class Station extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, name, gameStateManager, hud) {
    super(scene, x, y, texture);
    this.stationName = name;
    this.gameStateManager = gameStateManager;
    this.setInteractive();
    this.scene.add.existing(this);
  }

  createButtons() {

  }
}

export class RegisterStation extends Station {
  constructor(scene, x, y, texture, gameStateManager, hud) {
    super(scene, x, y, texture, 'register', gameStateManager, hud);
    this.setOrigin(0.5, 0.5);
    this.selectedSize = '';
    this.selectedSizeButton = null;
    this.drinks = [];
    this.hud = hud;

    this.createButtons();

    this.gameStateManager.addListener(this.stationName, state => this.updateFromSharedState(state));
  }

  createButtons() {
    const sizeButtonConfigs = [
      { x: this.x - 550, y: this.y - 150, size: 'Short', callback: () => this.onSizeButtonPressed('Short') },
      { x: this.x - 450, y: this.y - 150, size: 'Tall', callback: () => this.onSizeButtonPressed('Tall') },
      { x: this.x - 350, y: this.y - 150, size: 'Grande', callback: () => this.onSizeButtonPressed('Grande') },
      { x: this.x - 250, y: this.y - 150, size: 'Venti', callback: () => this.onSizeButtonPressed('Venti') },
      { x: this.x - 150, y: this.y - 150, size: 'Trenta', callback: () => this.onSizeButtonPressed('Trenta') },
    ];

    const drinkButtonConfigs = [
      { x: this.x - 550, y: this.y - 50, drink: 'Drip', callback: () => this.onDrinkButtonPressed('Drip') }
    ]

    this.sizeButtons = sizeButtonConfigs.map(config => {
      const button = this.createButton(config.x, config.y, config.callback);
      button.size = config.size;
      return button;
    });

    this.drinkButtons = drinkButtonConfigs.map(config => {
      const button = this.createButton(config.x, config.y, config.callback);
      button.drink = config.drink;
      return button;
    });

    this.checkoutButton = this.createButton(this.x - 200, this.y + 150, this.onCheckoutButtonPressed.bind(this));

    const cupButtonConfigs = [
      { x: this.x - 450, y: this.y + 300, size: 'Tall', callback: () => this.onCupButtonPressed('Tall') }
    ];

    this.cupButtons = cupButtonConfigs.map(config => {
      const button = this.createButton(config.x, config.y, config.callback);
      button.size = config.size;
      return button;
    });
  }

  createButton(x, y, callback) {
    const button = this.scene.add.image(x, y, 'buttonTexture')
      .setInteractive()
      .on('pointerdown', callback);

    return button;
  }

  onSizeButtonPressed(size) {
    this.gameStateManager.setStationState(this.stationName, { selectedSize: size })
    if(this.selectedSizeButton) {
      this.selectedSizeButton.setTint(0xFFFFFF);
    }

    const newSelectedSizeButton = this.sizeButtons.find(button => button.size === size);
    if(newSelectedSizeButton) {
      newSelectedSizeButton.setTint(0xFFFF00);
      this.selectedSizeButton = newSelectedSizeButton;
    }

    this.selectedSize = size;
  }

  onDrinkButtonPressed(drink) {
    let price;
    switch(this.selectedSize) {
      case 'Tall':
        price = 1.75;
        break;
      case 'Grande':
        price = 2;
        break;
      case 'Venti':
        price = 2.3;
    }

    this.drinks.push({ drink, price, size: this.selectedSize });
    console.log(this.drinks);
  }

  onCheckoutButtonPressed() {
    let totalPrice = 0;
    this.drinks.forEach(drink => {
      totalPrice += drink.price;
    });

    totalPrice += totalPrice * 0.095;
    console.log('totalPrice? ', totalPrice);

    const currentCustomer = this.gameStateManager.getCustomerAtRegister();
    if (currentCustomer) {
      // if(currentCustomer.drink)
      currentCustomer.goWaitForDrink(); 
    }

    // Add the next customer to the queue
    // this.scene.addCustomerToQueue();
    this.drinks = [];
  }

  onCupButtonPressed(size) {
    if(!this.hud.getLeftHand()) {
      this.hud.setLeftHand(new HotCup(this.scene, this.x, this.y, size))
    } 
  }

  updateFromSharedState(state) {
    // this.updateCustomerDisplay(state.customerAtRegister);
    this.sizeButtons.forEach(button => button.setTint(0xFFFFFF)); // Reset tint to default

    // Highlight the button that matches the selected size in the shared state
    const selectedButton = this.sizeButtons.find(button => button.size === state.selectedSize);
    if (selectedButton) {
      selectedButton.setTint(0xFFFF00); // Set tint to yellow for the selected button
    }
  }
}

export class BrewedCoffeeStation extends Station {
  constructor(scene, x, y, texture, gameStateManager, hud) {
    super(scene, x, y, texture, 'brewedCoffee', gameStateManager, hud);
    this.setOrigin(0.5, 0.5);

    this.createButtons();
  }

  createButtons() {
    const addCoffeeToCup = this.scene.add.image(this.x - 525, this.y - 50, 'buttonTexture')
      .setInteractive()
      .on('pointerdown', () => this.onAddCoffeeToCupButtonPressed());

    this.buttons = [addCoffeeToCup];
  }

  onAddCoffeeToCupButtonPressed() {
    console.log('brew button pressed');
  }
}

class HotCup extends Phaser.GameObjects.Image {
  constructor(scene, x, y, size) {
    super(scene, x, y, 'buttonTexture');
    this.size = size;
    scene.add.existing(this);
  }
}
