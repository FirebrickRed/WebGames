
export class GameStateManager {
  constructor() {
    this.listeners = {};
    this.stationStates = {};
    this.customerAtRegister = null;
    this.customersWaitingForDrinks = [];
  }

  notifyListeners(stationKey) {
    if(this.listeners[stationKey]) {
      this.listeners[stationKey].forEach(listener => listener(this.getStationState(stationKey)));
    }
  }

  addListener(stationKey, callback) {
    if(!this.listeners[stationKey]) {
      this.listeners[stationKey] = [];
    }
    this.listeners[stationKey].push(callback);
  }

  setCustomerAtRegister(customer) {
    this.customerAtRegister = customer;
  }

  getCustomerAtRegister() {
    return this.customerAtRegister;
  }

  getCustomersWaitingForDrinks() {
    return this.customersWaitingForDrinks;
  }

  addCustomerToDrinkQueue(customer) {
    this.customersWaitingForDrinks.push(customer);
  }

  changeCustomerState(customerId, newState) {
    const customer = this.findCustomerById(customerId);
    if(customer) {
      customer.isVisible = newState.isVisible;
      customer.updateSprites();
    }
  }

  setStationState(stationKey, state) {
    this.stationStates[stationKey] = state;
    this.notifyListeners(stationKey);
  }

  getStationState(stationKey) {
    return this.stationStates[stationKey];
  }
}