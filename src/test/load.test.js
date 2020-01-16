// import GamePlay from '../js/GamePlay.js';
// import GameController from '../js/GameController.js';
import GameStateService from '../js/mockGameStateService.js';
import tempData from '../js/tempDataForMockGss.js';

jest.mock('../js/tempDataForMockGss');
beforeEach(() => {
  jest.resetAllMocks();
});

test('Проверка GameSavingLoader', async () => {
  const expected = `{"point":10,"maxPoint":10,"level":1,"currentThem":"prairie","userPositions":[]}`;
  // const gamePlay = new GamePlay();
  const stateService = new GameStateService(localStorage);
  // const gameCtrl = new GameController(gamePlay, stateService);
  tempData.mockReturnValue(expected);
  const recived = stateService.load();
  expect(JSON.stringify(recived)).toBe(expected);
});

test('Проверка GameSavingLoader = null', async () => {
  const expected = '';
  const stateService = new GameStateService(localStorage);
  tempData.mockReturnValue(expected);

  expect(() => {
    stateService.load();
  }).toThrow();
});
