import showInfoCharacter from '../js/characters/showInfoCharacter';

test('Проверка вывод краткого состояния Bowman', () => {
  const characters = {
    name: 'Лучник',
    type: 'Bowman',
    health: 50,
    level: 1,
    attack: 40,
    defence: 10,
  };
  const received = showInfoCharacter(characters);
  const expected = '\u{1F396}1\u{2694}40\u{1F6E1}10\u{2764}50';

  expect(received).toBe(expected);
});