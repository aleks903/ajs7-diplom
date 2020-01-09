import themese from './themes';
import {generateTeam} from './generators';
import {userTeam, enemyTeam} from './characters/arrCharacter';
import PositionedCharacter from './PositionedCharacter';
import showInfoCharacter from './characters/showInfoCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';
import allowedValues from './allowedValues';

const positionCharacter = [];
const userPositions = [];
const enemyPositions = [];

let selectedCharacterIndex = 0;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentMove = 'user';
    this.selectedCharacter = {};
  }

  init() {
    console.log('init GameControler');
    let userPosition = 0, enemyPosition = 0;
    const userTeams = generateTeam(userTeam, 1, 2);
    const enemyTeams = generateTeam(enemyTeam, 1, 2);

    this.gamePlay.drawUi(themese.prairie);
    this.mouseEvents();

    const characterPositions = this.positions(userTeam.length - 1);

    for(let i = 0; i < userTeam.length - 1; i += 1) {
      userPosition = characterPositions.user[i];
      enemyPosition = characterPositions.enemy[i];
      userPositions.push(new PositionedCharacter(userTeams[i], userPosition));
      enemyPositions.push(new PositionedCharacter(enemyTeams[i], enemyPosition));
    }
    //positionCharacter.push(...userPositions, ...enemyPositions);
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
//console.log(positionCharacter);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }
  
  positions(length) {
    const position = {user: [], enemy: []};
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.user.includes(random));
      position.user.push(random);

      do {
        random = this.randomPosition() + 6;
      } while (position.enemy.includes(random));
      position.enemy.push(random);
    }
    return position;
  }

  randomPosition() {
    return (Math.floor(Math.random() * 8) * 8) + (Math.floor(Math.random() * 2));
  }
  mouseEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
      GamePlay.showError('Не допустимое действие!');
    }

    for (const item of [...userPositions, ...enemyPositions]) {
      if(item.position === index) {
        const inTeamUser = userTeam.findIndex(items => items.name === item.character.constructor.name);
        if(inTeamUser === -1) {
          GamePlay.showError('Не ваш персонаж!');
        } else {
          this.gamePlay.deselectCell(selectedCharacterIndex);
          this.gamePlay.selectCell(index);
          selectedCharacterIndex = index;
          this.selectedCharacter = item;
        }
        //this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    console.log(userPositions);
    console.log(enemyPositions);
    console.log(this.selectedCharacter);
    
    for (const item of [...userPositions, ...enemyPositions]) {
      if(item.position === index) {
        this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }

    if (Object.keys(this.selectedCharacter).length !== 0) {
      const allowPositions = allowedValues(this.selectedCharacter.position, this.selectedCharacter.character.distance, this.gamePlay.boardSize);
      const allowAttack = allowedValues(this.selectedCharacter.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
      if (userPositions.findIndex(item => item.position === index) !== -1){
        this.gamePlay.setCursor(cursors.pointer);
      } else if (allowPositions.includes(index) && [...userPositions, ...enemyPositions].findIndex(item => item.position === index) === -1){
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
        console.log(index);
      } else if (allowAttack.includes(index) && enemyPositions.findIndex(item => item.position === index) !== -1){
        console.log('enemy');
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    //console.log('onCellLeave');
    this.gamePlay.setCursor(cursors.auto);
  }
}
