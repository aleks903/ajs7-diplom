import { allowedValues, allowedValuesAttack } from '../js/allowedValues.js';


test('Допустимые ячейки хода', () => {
  const expected = allowedValues(2, 2, 8);
  const received = [3, 1, 10, 11, 9, 4, 0, 18, 20, 16];
  expect(received).toEqual(expected);
});

test('Допустимые ячейки атаки', () => {
  const expected = allowedValuesAttack(2, 2, 8);
  const received = [0, 8, 16, 1, 9, 17, 2, 10, 18, 3, 11, 19, 4, 12, 20];
  expect(received).toEqual(expected);
});
