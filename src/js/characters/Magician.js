import Character from '../Character';

export default class Magician extends Character {
  construcor(level) {
    super(level);
    this.level = level;
    this.type = 'magician';
    this.attack = 10;
    this.defence = 40;
    this.distance = 1;
    this.distanceAttack = 4;
  }
}