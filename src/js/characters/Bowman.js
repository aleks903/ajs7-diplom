import Character from '../Character';

export default class Bowman extends Character {
  construcor(level) {
    super(level);
    this.level = level;
    this.type = 'bowman';
    this.attack = 25;
    this.defence = 25;
    this.distance = 2;
    this.distanceAttack = 2;
  }
}