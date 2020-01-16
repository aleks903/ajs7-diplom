import Character from '../Character.js';

export default class Undead extends Character {
  constructor(level) {
    super(level);
    this.type = 'undead';
    this.attack = 25;
    this.defence = 25;
    this.distance = 4;
    this.distanceAttack = 1;
  }
}
