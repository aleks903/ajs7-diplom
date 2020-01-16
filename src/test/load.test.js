import GameStateService from '../js/mockGameStateService.js';
import tempData from '../js/tempDataForMockGss.js';

jest.mock('../js/tempDataForMockGss');
beforeEach(() => {
  jest.resetAllMocks();
});

test('Проверка Load', () => {
  const expected = `{"point":10,"maxPoint":10,"level":1,"currentThem":"prairie","userPositions":[]}`; // eslint-disable-line quotes
  tempData.mockReturnValue(expected);
  const recived = GameStateService.load();
  expect(JSON.stringify(recived)).toBe(expected);
});

test('Проверка Load = error', () => {
  const expected = '';
  tempData.mockReturnValue(expected);

  expect(() => {
    GameStateService.load();
  }).toThrow();
});
