import themese from './themes.js';
import { generateTeam } from './generators.js';
import { userTeam, enemyTeam, userTeamLevel1 } from './characters/arrCharacter.js';
import PositionedCharacter from './PositionedCharacter.js';
import showInfoCharacter from './characters/showInfoCharacter.js';
import GamePlay from './GamePlay.js';
import GameState from './GameState.js';
import cursors from './cursors.js';
import { allowedValues, allowedValuesAttack } from './allowedValues.js';

let userPositions = [];
let enemyPositions = [];
let selectedCharacterIndex = 0;
let allowDistance;
let allowPosition;
let boardSize;

/* eslint-disable class-methods-use-this */
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
    this.userTeams = [];
    this.enemyTeams = [];
    this.index = 0;
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

  saveGame() {
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

  loadGame() {
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentThem = loadGameState.currentThem;
        userPositions = loadGameState.userPositions;
        enemyPositions = loadGameState.enemyPositions;
        this.gamePlay.drawUi(this.currentThem);
        this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      }
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Не удалось загрузить игру');
      this.newGame();
    }
  }

  maxPoints() {
    let maxPoint = 0;
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        maxPoint = Math.max(loadGameState.maxPoint, this.point);
      }
    } catch (e) {
      maxPoint = this.point;
      console.log(e);
    }
    return maxPoint;
  }

  async onCellClick(index) {
    this.index = index;
    // TODO: react to click
    if (!this.blockedBoard) {
      if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
        GamePlay.showError('Не допустимое действие!');
      } else if (this.funcFindIndex([...userPositions]) !== -1) {
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.selectCell(index);
        selectedCharacterIndex = index;
        this.selectedCharacter = [...userPositions].find((item) => item.position === index);
        this.selected = true;
      } else if (!this.selected
      && this.funcFindIndex([...enemyPositions]) !== -1) {
        GamePlay.showError('Не ваш персонаж!');
      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'pointer') {
        // ход
        this.selectedCharacter.position = index;
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.selected = false;
        this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
        this.currentMove = 'enemy';
        this.enemyStrategy();
      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair') {
        // атака
        const thisAttackEnemy = [...enemyPositions].find((item) => item.position === index);
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        this.selected = false;
        await this.characterAttacker(this.selectedCharacter.character, thisAttackEnemy);
        if (enemyPositions.length > 0) {
          this.enemyStrategy();
        }
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.index = index;
    if (!this.blockedBoard) {
      for (const item of [...userPositions, ...enemyPositions]) {
        if (item.position === index) {
          this.gamePlay.showCellTooltip(showInfoCharacter(item.character), index);
        }
      }

      if (this.selected) {
        allowPosition = this.selectedCharacter.position;
        allowDistance = this.selectedCharacter.character.distance;
        boardSize = this.gamePlay.boardSize;

        const allowPositions = allowedValues(allowPosition, allowDistance, boardSize);
        allowDistance = this.selectedCharacter.character.distanceAttack;

        const allowAttack = allowedValuesAttack(allowPosition, allowDistance, boardSize);

        if (this.funcFindIndex(userPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (allowPositions.includes(index)
        && this.funcFindIndex([...userPositions, ...enemyPositions]) === -1) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (allowAttack.includes(index)
        && this.funcFindIndex(enemyPositions) !== -1) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  funcFindIndex(arr) {
    return arr.findIndex((item) => item.position === this.index);
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
    const position = { user: [], enemy: [] };
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

  newGame() {
    this.blockedBoard = false;
    const maxPoint = this.maxPoints();
    const currentGameState = {
      maxPoint,
    };
    this.stateService.save(GameState.from(currentGameState));

    userPositions = [];
    enemyPositions = [];
    this.level = 1;
    this.point = 0;
    this.currentThem = themese.prairie;
    this.nextLevel();
  }

  levelUp() {
    for (const item of userPositions) {
      const current = item.character;
      current.level += 1;
      current.attack = this.upAttackDefence(current.attack, current.health);
      current.defence = this.upAttackDefence(current.defence, current.health);
      current.health = (current.health + 80) < 100 ? current.health + 80 : 100;
    }
  }

  upAttackDefence(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - life / 100)));
  }

  nextLevel() {
    this.currentMove = 'user';
    if (this.level === 1) {
      this.userTeams = generateTeam(userTeamLevel1, 1, 2);
      this.enemyTeams = generateTeam(enemyTeam, 1, 2);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
    } else if (this.level === 2) {
      this.currentThem = themese.desert;
      this.userTeams = generateTeam(userTeam, 1, 1);
      this.enemyTeams = generateTeam(enemyTeam, 2, (this.userTeams.length + userPositions.length));
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
    } else if (this.level === 3) {
      this.currentThem = themese.arctic;
      this.userTeams = generateTeam(userTeam, 2, 2);
      this.enemyTeams = generateTeam(enemyTeam, 3, (this.userTeams.length + userPositions.length));
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
    // снято ограничение в 4 уровня
    } else if (this.level >= 4) {
    // } else if (this.level === 4) {
      this.currentThem = themese.mountain;
      this.userTeams = generateTeam(userTeam, 3, 2);
      this.enemyTeams = generateTeam(enemyTeam, 4, (this.userTeams.length + userPositions.length));
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
    } else {
      this.blockedBoard = true;
      GamePlay.showMessage(`Игра окончена! Вы набрали ${this.point} очков.`);
      return;
    }

    const characterPositions = this.getPositions(userPositions.length);
    for (let i = 0; i < userPositions.length; i += 1) {
      userPositions[i].position = characterPositions.user[i];
      enemyPositions[i].position = characterPositions.enemy[i];
    }

    this.gamePlay.drawUi(this.currentThem);
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  }

  addPositionCharacter(userTeams, enemyTeams) {
    for (let i = 0; i < userTeams.length; i += 1) {
      userPositions.push(new PositionedCharacter(userTeams[i], 0));
    }
    for (let i = 0; i < enemyTeams.length; i += 1) {
      enemyPositions.push(new PositionedCharacter(enemyTeams[i], 0));
    }
  }

  async characterAttacker(attacker, target) {
    const tCharacter = target.character;
    let damage = Math.max(attacker.attack - tCharacter.defence, attacker.attack * 0.1);
    damage = Math.floor(damage);
    await this.gamePlay.showDamage(target.position, damage);
    tCharacter.health -= damage;
    this.currentMove = this.currentMove === 'enemy' ? 'user' : 'enemy';
    if (tCharacter.health <= 0) {
      userPositions = userPositions.filter((item) => item.position !== target.position);
      enemyPositions = enemyPositions.filter((item) => item.position !== target.position);
      if (userPositions.length === 0) {
        GamePlay.showMessage('user Game over');
        this.blockedBoard = true;
      }
      if (enemyPositions.length === 0) {
        console.log('enemy game over');
        for (const item of userPositions) {
          this.point += item.character.health;
        }
        this.levelUp();
        this.level += 1;
        this.nextLevel();
      }
    }
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  }

  async enemyAttacks(character, target) {
    await this.characterAttacker(character, target);
    this.currentMove = 'user';
  }

  enemyStrategy() {
    if (this.currentMove === 'enemy') {
      // attack
      for (const itemEnemy of [...enemyPositions]) {
        allowDistance = this.selectedCharacter.character.distanceAttack;
        allowPosition = itemEnemy.position;
        boardSize = this.gamePlay.boardSize;
        const allowAttack = allowedValuesAttack(allowPosition, allowDistance, boardSize);
        const target = this.enemyAttack(allowAttack);
        if (target !== null) {
          this.enemyAttacks(itemEnemy.character, target);
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

  enemyMove(itemEnemy) {
    const tempEnemy = itemEnemy;
    const itemEnemyDistance = itemEnemy.character.distance;
    let tempPRow;
    let tempPCOlumn;
    let stepRow;
    let stepColumn;
    let Steps;
    const itemEnemyRow = this.positionRow(tempEnemy.position);
    const itemEnemyColumn = this.positionColumn(tempEnemy.position);
    let nearUser = {};

    for (const itemUser of [...userPositions]) {
      const itemUserRow = this.positionRow(itemUser.position);
      const itemUserColumn = this.positionColumn(itemUser.position);
      stepRow = itemEnemyRow - itemUserRow;
      stepColumn = itemEnemyColumn - itemUserColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if (nearUser.steps === undefined || Steps < nearUser.steps) {
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
    if (Math.abs(nearUser.steprow) === Math.abs(nearUser.stepcolumn)) {
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempPRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));
        tempPCOlumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, tempPCOlumn);
      } else {
        tempPRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));
        tempPCOlumn = (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.sign(nearUser.steprow))));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, tempPCOlumn);
      }
    } else if (nearUser.stepcolumn === 0) {
      // по вертикали ход
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempPRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, (itemEnemyColumn));
      } else {
        tempPRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, (itemEnemyColumn));
      }
    } else if (nearUser.steprow === 0) {
      // по горизонтали ход
      if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
        tempPCOlumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

        tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempPCOlumn);
      } else {
        const tempFormul = (nearUser.stepcolumn - (1 * Math.sign(nearUser.stepcolumn)));
        tempPCOlumn = (itemEnemyColumn - tempFormul);

        tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempPCOlumn);
      }
    } else if (Math.abs(nearUser.steprow) > Math.abs(nearUser.stepcolumn)) {
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempPRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, (itemEnemyColumn));
      } else {
        tempPRow = (itemEnemyRow - (nearUser.steprow));

        tempEnemy.position = this.rowColumnToIndex(tempPRow, (itemEnemyColumn));
      }
    } else if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
      tempPCOlumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

      tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempPCOlumn);
    } else {
      tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn));
    }
  }

  positionRow(index) {
    return Math.floor(index / this.gamePlay.boardSize);
  }

  positionColumn(index) {
    return index % this.gamePlay.boardSize;
  }

  rowColumnToIndex(row, column) {
    return (row * 8) + column;
  }

  enemyAttack(allowAttack) {
    for (const itemUser of [...userPositions]) {
      if (allowAttack.includes(itemUser.position)) {
        return itemUser;
      }
    }
    return null;
  }
}
