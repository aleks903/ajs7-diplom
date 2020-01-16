import tempData from './tempDataForMockGss.js';

export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  static load() {
    try {
      const data = tempData();
      return JSON.parse(data);
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
