import GamePlay from '../js/GamePlay';
import GameController from '../js/GameController';
import GameStateService from '../js/GameStateService';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));
const stateService = new GameStateService(localStorage);
const gameController = new GameController(gamePlay, stateService);
jest.mock('../js/GameStateService', function() {jest.fn();});

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

  GameStateService.mockImplementation(() => {
    load: () => {return state;};
  });
  //const retLoad = gameController.loadGame();
  //GameStateService.mockReturnValue('state');
  // const mockLoadInstance = GameStateService.mock.instances[0];
  // const mockLoad = mockLoadInstance.load;
  // mockLoad.mockReturnValue('state');
  //const spy = jest.spyOn(GameStateService, 'load').mockImplementation(() => 'hello');
  
  const expected = '{"level": 1, "turn": "user", "user": {"attack": 10, "defence": 40, "distance": 1, "health": 50}, "score": 30}';
  //gameController.loadGame();
  expect(gameController.loadGame()).toBe(1);
  //spy.mockRestore();
});

// test('load error', () => {
//   gameController.loadGame().mockRejectedValue('Invalid state');

//   gameController.loadGame().catch((err) => {
//     expect(err).toThrow();
//   });
// });