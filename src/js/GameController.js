import themese from './themes';
import {generateTeam} from './generators';
import {userTeam, enemyTeam} from './characters/arrCharacter';
import PositionedCharacter from './PositionedCharacter';

const positionCharacter = [];
const icons = {
  level: '\u{1F396}',
  attack: '\u{2694}',
  defence: '\u{1F6E1}',
  health: '\u{2764}',
};
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
    this.displayInfo();

    for(let i = 0; i < userTeam.length - 1; i += 1) {
      userPosition = (Math.floor(Math.random() * 8) * 8) + (Math.floor(Math.random() * 2));
      enemyPosition = (Math.floor(Math.random() * 8) * 8) + (Math.floor(Math.random() * 2) + 6);
      positionCharacter.push(new PositionedCharacter(userTeams[i], userPosition));
      positionCharacter.push(new PositionedCharacter(enemyTeams[i], enemyPosition));
    }
    this.gamePlay.redrawPositions(positionCharacter);
console.log(positionCharacter);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  displayInfo() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    //console.log(index);
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    for (const item of positionCharacter) {
      // console.log(item);
      if(item.position === index) {
        const messageTooltip = `${icons.level}${item.character.level}${icons.attack}${item.character.attack}${icons.defence}${item.character.defence}${icons.health}${item.character.health}`;
        console.log(messageTooltip);
        this.gamePlay.showCellTooltip(messageTooltip, index);
      }
    }
    // console.log(index);
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
