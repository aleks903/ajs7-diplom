import Character from '../Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level);
    this.type = 'magician';
    this.attack = 10;
    this.defence = 40;
    this.distance = 1;
    this.distanceAttack = 4;
  }
}
