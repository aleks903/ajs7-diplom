// import GamePlay from '../js/GamePlay';
// import GameController from '../js/GameController';
//import '../js/app';
import GameStateService from '../js/GameStateService';

// const mockLoad = jest.fn();
// jest.mock('../js/GameStateService', () => {
//   return jest.fn().mockImplementation(() => {
//     return {load: mockLoad};
//   });
// });

// const gamePlay = new GamePlay();
const stateService = new GameStateService(localStorage);
// const gameCtrl = new GameController(gamePlay, stateService);

//jest.mock('../js/GameStateService');

jest.mock('../js/GameStateService', () => {
  return () => {
    //default: jest.fn(() => 412),
    return {load: jest.fn(() => 42)}
  };
});

const state = {
  point: 10,
  maxPoint: 10,
  level: 1,
  currentThem: 'prairie',
  userPositions: [],
};

beforeEach(() => {
  jest.resetAllMocks();
});

test('load data', () => {

  
  //GameStateService.load.mockReturnValue('test');
  //gameCtrl.loadGame();
  // mMock.mock.calls
  //stateService.load();
  //GameStateService.mock.instances[0].load.mock.calls;


  //stateService.load()
  expect(stateService.load()).toBe(4);

  //expect(GameStateService.mock.instances[0].load).toHaveBeenCalledTimes(2);
  // expect(gameCtrl.loadGame()).toBe('4');
});

// test('load error', () => {
//   gameController.loadGame().mockRejectedValue('Invalid state');

//   gameController.loadGame().catch((err) => {
//     expect(err).toThrow();
//   });
// });