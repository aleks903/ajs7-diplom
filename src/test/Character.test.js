import Character from '../js/Character';

test('Запрет создания объектов Character', () => {
  //const recived = new Character();
  expect(() => {new Character()}).toThrow();
});

test('Создание Bowman', () => {
  class Bowman extends Character {
    constructor(level) {
      super(level);
      this.level = level;
      this.attack = 25;
      this.defence = 25;
      this.distance = 4;
      this.distanceAttack = 1;
      this.health = 50;
      this.type = 'bowman';
    }
  }
  const expected = {
    level: 1,
    health: 50,
    type: 'bowman',
    attack: 25,
    defence: 25,
    distance: 4,
    distanceAttack: 1,
  };
  const received = new Bowman(1);
  expect(received).toEqual(expected);
});