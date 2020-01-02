import Character from '../Character';

export default class Undead extends Character {
  construcor(level) {
    super(level);
    this.level = level;
    this.type = 'undead';
    this.attack = 25;
    this.defence = 25;
    this.distance = 4;
    this.distanceAttack = 1;
  }
}