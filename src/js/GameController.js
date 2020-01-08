import themese from './themes';
import {generateTeam} from './generators';
import {userTeam, enemyTeam} from './characters/arrCharacter';
import PositionedCharacter from './PositionedCharacter';
import showInfoCharacter from './characters/showInfoCharacter';
import GamePlay from './GamePlay';

const positionCharacter = [];
let selectedCharacter = 0;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    console.log('init GameControler');
    let userPosition = 0, enemyPosition = 0;
    const userTeams = generateTeam(userTeam, 1, 2);
    const enemyTeams = generateTeam(enemyTeam, 1, 2);

    this.gamePlay.drawUi(themese.prairie);
    this.mouseEvents();

    for(let i = 0; i < userTeam.length - 1; i += 1) {
      userPosition = (Math.floor(Math.random() * 8) * 8) + (Math.floor(Math.random() * 2));
      enemyPosition = (Math.floor(Math.random() * 8) * 8) + (Math.floor(Math.random() * 2) + 6);
      positionCharacter.push(new PositionedCharacter(userTeams[i], userPosition));
      positionCharacter.push(new PositionedCharacter(enemyTeams[i], enemyPosition));
    }
    this.gamePlay.redrawPositions(positionCharacter);
//console.log(positionCharacter);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  mouseEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    // console.log(index);
    for (const item of positionCharacter) {
      if(item.position === index) {
        const inTeamUser = userTeam.findIndex(items => items.name === item.character.constructor.name);
        if(inTeamUser === -1) {
          GamePlay.showError('Не ваш персонаж!');
        } else {
          this.gamePlay.deselectCell(selectedCharacter);
          this.gamePlay.selectCell(index);
          selectedCharacter = index;
        }
        //this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    for (const item of positionCharacter) {
      if(item.position === index) {
        this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
