import themese from './themes.js';
import {generateTeam} from './generators.js';
import {userTeam, enemyTeam} from './characters/arrCharacter.js';
import PositionedCharacter from './PositionedCharacter.js';
import showInfoCharacter from './characters/showInfoCharacter.js';
import GamePlay from './GamePlay.js';
import GameState from './GameState.js';
import cursors from './cursors.js';
import allowedValues from './allowedValues.js';

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
    this.selected = false;
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
    console.log(userPositions);
    console.log(enemyPositions);
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

  async onCellClick(index) {
    // TODO: react to click
    if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
      GamePlay.showError('Не допустимое действие!');
    } else if([...userPositions].findIndex(item => item.position === index) !== -1){
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.selectCell(index);
        selectedCharacterIndex = index;
        this.selectedCharacter = [...userPositions].find(item => item.position === index);
        this.selected = true;
    } else if (!this.selected && [...enemyPositions].findIndex(item => item.position === index) !== -1){
      GamePlay.showError('Не ваш персонаж!');
    } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'pointer'){
// ход
      this.selectedCharacter.position = index;
      this.gamePlay.deselectCell(selectedCharacterIndex);
      this.gamePlay.deselectCell(index);
      this.selected = false;
      this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      this.currentMove = 'enemy';
      this.enemyStrategy();
    } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair'){
// атака
      const thisAttackEnemy = [...enemyPositions].find(item => item.position === index);
      await this.characterAttacker(this.selectedCharacter.character, thisAttackEnemy);
      this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      this.currentMove = 'enemy';
      this.enemyStrategy();
    }
  }

  async characterAttacker(attacker, target) {
    const damage = Math.max(attacker.attack - target.character.defence, attacker.attack * 0.1);
    console.log(target.position);
    await this.gamePlay.showDamage(target.position, damage);
    target.character.health -= damage;
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    for (const item of [...userPositions, ...enemyPositions]) {
      if(item.position === index) {
        this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }

    if (this.selected) {
      const allowPositions = allowedValues(this.selectedCharacter.position, this.selectedCharacter.character.distance, this.gamePlay.boardSize);
      const allowAttack = allowedValues(this.selectedCharacter.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
      if (userPositions.findIndex(item => item.position === index) !== -1){
        this.gamePlay.setCursor(cursors.pointer);
      } else if (allowPositions.includes(index) && [...userPositions, ...enemyPositions].findIndex(item => item.position === index) === -1){
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else if (allowAttack.includes(index) && enemyPositions.findIndex(item => item.position === index) !== -1){
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

  async enemyStrategy(){
    if (this.currentMove === 'enemy'){
// attack
      for(const itemEnemy of this.enemyPositions){
        const allowAttack = allowedValues(itemEnemy.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
        const target = this.enemyAttack(allowAttack);
        if(target !== null) {
          await this.characterAttacker(itemEnemy, target);
          this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
          this.currentMove = 'user';
          return;
        }
      }

// move
      const randomIndex = Math.floor(Math.random() * this.enemyPositions.length);
      const randomEnemy = this.enemyPositions[randomIndex];
      //const allowPositions = allowedValues(randomEnemy.position, randomEnemy.character.distance, this.gamePlay.boardSize);
      this.enemyMove(randomEnemy);
      this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      this.currentMove = 'user';
    }
  }

  enemyMove(itemEnemy){
    const itemEnemyPosition = itemEnemy.position;
    const itemEnemyDistance = itemEnemy.character.distance;
    
    let stepRow, stepColumn, Steps;
    let itemEnemyRow = this.positionRow(itemEnemyPosition);
    let itemEnemyColumn = this.positionColumn(itemEnemyPosition);
    let nearUser = {
      steprow: 0,
      stepcolumn: 0,
      steps: 0,
      positionRow: 0,
      positionColumn: 0,
    };

    for(const itemUser of userPositions){
      let itemUserRow = this.positionRow(itemUser.positions);
      let itemUserColumn = this.positionColumn(itemUser.positions);
      stepRow = itemEnemyRow - itemUserRow;
      stepColumn = itemEnemyColumn - itemUserColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if(steps < nearUser.steps){
        nearUser = {
          steprow: stepRow,
          stepcolumn: stepColumn,
          steps: Steps,
          positionRow: itemUserRow,
          positionColumn: itemUserColumn,
        };
      }
    }
// по диагонали ход
    if(Math.abs(nearUser.steprow) === Math.abs(nearUser.stepcolumn)){
      if(Math.abs(nearUser.steprow) > itemEnemyDistance){
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.siqn(nearUser.steprow))), (itemEnemyColumn - (itemEnemyDistance * Math.siqn(nearUser.stepcolumn))));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow - (1 * Math.siqn(nearUser.steprow)))), (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.siqn(nearUser.steprow)))));
      }
    } else if(nearUser.stepcolumn === 0){
// по вертикали ход
      if(Math.abs(nearUser.steprow) > itemEnemyDistance){
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.siqn(nearUser.steprow))), (itemEnemyColumn));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow - (1 * Math.siqn(nearUser.steprow)))), (itemEnemyColumn));
      }
    } else if(nearUser.steprow === 0){
// по горизонтали ход
      if(Math.abs(nearUser.stepcolumn) > itemEnemyDistance){
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (itemEnemyDistance * Math.siqn(nearUser.stepcolumn))));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.siqn(nearUser.steprow)))));
      }
    } else {
      if(Math.abs(nearUser.steprow) > Math.abs(nearUser.stepcolumn)){
        if(Math.abs(nearUser.steprow) > itemEnemyDistance){
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.siqn(nearUser.steprow))), (itemEnemyColumn));
        } else {
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow)), (itemEnemyColumn));
        }
      } else {
        if(Math.abs(nearUser.stepcolumn) > itemEnemyDistance){
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (itemEnemyDistance * Math.siqn(nearUser.stepcolumn))));
        } else {
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn));
        }
      }
    }
  }

  positionRow(index){
    return Math.floor(index / this.gamePlay.boardSize);
  }
  
  positionColumn (index){
    return index % this.gamePlay.boardSize
  }

  rowColumnToIndex(row, column){
    return (row * 8) + column;
  }

  enemyAttack(allowAttack){
    for(const itemUser of this.userPositions){
      if(allowAttack.includes(itemUser.position)){
        return itemUser;
      }
    }
    return null;
  }
}
