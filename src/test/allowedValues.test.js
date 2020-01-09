import allowedValues from '../js/allowedValues';


test('Допустимые ячейки хода или атаки', () => {
  const expected = allowedValues(2, 2, 8);
  const received = [3, 1, 10, 11, 9, 4, 0, 18, 20, 16];
  expect(received).toEqual(expected);
});
