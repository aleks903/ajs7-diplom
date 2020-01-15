import themese from './themes';
import {generateTeam} from './generators';
import {userTeam, enemyTeam, userTeamLevel1} from './characters/arrCharacter';
import PositionedCharacter from './PositionedCharacter';
import showInfoCharacter from './characters/showInfoCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';
import {allowedValues, allowedValuesAttack} from './allowedValues';

let userPositions = [];
let enemyPositions = [];
let selectedCharacterIndex = 0;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentMove = 'user';
    this.selectedCharacter = {};
    this.selected = false;
    this.point = 0;
    this.level = 1;
    this.currentThem = themese.prairie;
    this.blockedBoard = false;
  }

  init() {
    this.mouseEvents();
    this.nextLevel();
  }
  
  mouseEvents() {
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  saveGame(){
    const maxPoint = this.maxPoints();

    const currentGameState = {
      point: this.point,
      maxPoint,
      level: this.level,
      currentThem: this.currentThem,
      userPositions,
      enemyPositions,
    };
    this.stateService.save(GameState.from(currentGameState));
  }

  loadGame(){
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState){
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentThem = loadGameState.currentThem;
        userPositions = loadGameState.userPositions;
        enemyPositions = loadGameState.enemyPositions;

        this.gamePlay.drawUi(this.currentThem);
        this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
        return loadGameState;
      }
    } catch (e) {
      return e;
      console.log(e);
    }
  }

  maxPoints() {
    let maxPoint = 0;
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState){
        maxPoint = Math.max(loadGameState.maxPoint, this.point);
      }
    }
    catch (e) {
      maxPoint = this.point;
      console.log(e);
    }
    return maxPoint;
  }

  async onCellClick(index) {
    // TODO: react to click
    if (!this.blockedBoard){
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
      this.gamePlay.deselectCell(selectedCharacterIndex);
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
      this.selected = false;
      await this.characterAttacker(this.selectedCharacter.character, thisAttackEnemy);
      // this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      this.currentMove = 'enemy';
      this.enemyStrategy();
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if(!this.blockedBoard){
    for (const item of [...userPositions, ...enemyPositions]) {
      if(item.position === index) {
        this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
      }
    }

    if (this.selected) {
      const allowPositions = allowedValues(this.selectedCharacter.position, this.selectedCharacter.character.distance, this.gamePlay.boardSize);
      const allowAttack = allowedValuesAttack(this.selectedCharacter.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
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
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getPositions(length) {
    const position = {user: [], enemy: []};
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.user.includes(random));
      position.user.push(random);

      do {
        random = this.randomPosition(6);
      } while (position.enemy.includes(random));
      position.enemy.push(random);
    }
    return position;
  }

  randomPosition(columnEnemy = 0) {
    return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + columnEnemy));
  }

  newGame(){
    const maxPoint = this.maxPoints();
    const currentGameState = {
      maxPoint,
    };
    this.stateService.save(GameState.from(currentGameState));

    userPositions = [];
    enemyPositions = [];
    this.level = 1;
    this.point = 0;
    this.currentMove = 'user';
    this.currentThem = themese.prairie;
    this.nextLevel();
  }
  
  levelUp(){
    for(const item of userPositions) {
      item.character.level += 1;
      item.character.attack = this.upAttackDefence(item.character.attack, item.character.health);
      item.character.defence = this.upAttackDefence(item.character.defence, item.character.health);
      item.character.health = (item.character.health + 80) < 100 ? item.character.health + 80 : 100;
    }
  }
  
  upAttackDefence(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - life / 100)));
  }

  nextLevel(){
    let userTeams = [], enemyTeams = [];
    if (this.level === 1) {
      userTeams = generateTeam(userTeamLevel1, 1, 2);
      enemyTeams = generateTeam(enemyTeam, 1, 2);
      this.addPositionCharacter(userTeams, enemyTeams);
    } else if (this.level === 2){
      this.currentThem = themese.desert;
      userTeams = generateTeam(userTeam, 1, 1);
      enemyTeams = generateTeam(enemyTeam, 2, (userTeams.length + userPositions.length));
      this.addPositionCharacter(userTeams, enemyTeams);
    } else if (this.level === 3){
      this.currentThem = themese.arctic;
      userTeams = generateTeam(userTeam, 2, 2);
      enemyTeams = generateTeam(enemyTeam, 3, (userTeams.length + userPositions.length));
      this.addPositionCharacter(userTeams, enemyTeams);
    } else if (this.level === 4){
      this.currentThem = themese.mountain;
      userTeams = generateTeam(userTeam, 3, 2);
      enemyTeams = generateTeam(enemyTeam, 4, (userTeams.length + userPositions.length));
      this.addPositionCharacter(userTeams, enemyTeams);
    } else {
      this.blockedBoard = true;
    }
    
    const characterPositions = this.getPositions(userPositions.length);
    for (let i = 0; i < userPositions.length; i += 1) {
      userPositions[i].position = characterPositions.user[i];
      enemyPositions[i].position = characterPositions.enemy[i];
    }
    
    this.gamePlay.drawUi(this.currentThem);
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  }

  addPositionCharacter(userTeams, enemyTeams){
    for(let i = 0; i < userTeams.length; i += 1) {
      userPositions.push(new PositionedCharacter(userTeams[i], 0));
    }
    for(let i = 0; i < enemyTeams.length; i += 1) {
      enemyPositions.push(new PositionedCharacter(enemyTeams[i], 0));
    }
  }

  async characterAttacker(attacker, target) {
    const damage = Math.floor(Math.max(attacker.attack - target.character.defence, attacker.attack * 0.1));
    await this.gamePlay.showDamage(target.position, damage);
    target.character.health -= damage;
    if(target.character.health - damage <= 0) {
      userPositions = userPositions.filter(item => item.position !== target.position);
      enemyPositions = enemyPositions.filter(item => item.position !== target.position);
      if (userPositions.length === 0){
        console.log('user Game over');
        this.blockedBoard = true;
      }
      if(enemyPositions.length === 0) {
        console.log('enemy game over');
        this.currentMove = 'user';
        for(const item of userPositions) {
          this.point += item.character.health;
        }
        console.log(this.point);
        this.levelUp();
        this.level += 1;
        this.nextLevel();
      }
    }
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  }

  async enemyStrategy(){
    if (this.currentMove === 'enemy'){
// attack
      for(const itemEnemy of [...enemyPositions]){
        const allowAttack = allowedValuesAttack(itemEnemy.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
        const target = this.enemyAttack(allowAttack);
        if(target !== null) {
          await this.characterAttacker(itemEnemy.character, target);
          this.currentMove = 'user';
          return;
        }
      }
// move
      const randomIndex = Math.floor(Math.random() * [...enemyPositions].length);
      const randomEnemy = [...enemyPositions][randomIndex];
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
    let nearUser = {};

    for(const itemUser of [...userPositions]){
      
      let itemUserRow = this.positionRow(itemUser.position);
      let itemUserColumn = this.positionColumn(itemUser.position);
      stepRow = itemEnemyRow - itemUserRow;
      stepColumn = itemEnemyColumn - itemUserColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if(nearUser.steps === undefined || Steps < nearUser.steps){
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
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow))), (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn))));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow)))), (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.sign(nearUser.steprow)))));
      }
    } else if(nearUser.stepcolumn === 0){
// по вертикали ход
      if(Math.abs(nearUser.steprow) > itemEnemyDistance){
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow))), (itemEnemyColumn));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow)))), (itemEnemyColumn));
      }
    } else if(nearUser.steprow === 0){
// по горизонтали ход
      if(Math.abs(nearUser.stepcolumn) > itemEnemyDistance){
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn))));
      } else {
        itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.sign(nearUser.steprow)))));
      }
    } else {
      if(Math.abs(nearUser.steprow) > Math.abs(nearUser.stepcolumn)){
        if(Math.abs(nearUser.steprow) > itemEnemyDistance){
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow))), (itemEnemyColumn));
        } else {
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow - (nearUser.steprow)), (itemEnemyColumn));
        }
      } else {
        if(Math.abs(nearUser.stepcolumn) > itemEnemyDistance){
          itemEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn))));
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
    for(const itemUser of [...userPositions]){
      if(allowAttack.includes(itemUser.position)){
        return itemUser;
      }
    }
    return null;
  }
}
