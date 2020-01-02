import Character from '../Character';

export default class Swordsman extends Character {
  construcor(level) {
    super(level);
    this.level = level;
    this.type = 'swordsman';
    this.attack = 40;
    this.defence = 10;
    this.distance = 4;
    this.distanceAttack = 1;
  }
}