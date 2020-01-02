import Character from '../Character';

export default class Vampire extends Character {
  construcor(level) {
    super(level);
    this.level = level;
    this.type = 'vampire';
    this.attack = 40;
    this.defence = 10;
    this.distance = 2;
    this.distanceAttack = 2;
  }
}
