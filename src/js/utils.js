export function calcTileType(index, boardSize) {
  // TODO: write logic here
  //console.log(index%boardSize);
  let bordersIndexR = 0;
  let bordersIndexC = 0;
  let itemRow = Math.floor(index/boardSize);
  let itemColumn = index % boardSize;
  const borders = [[
    'top-left',
    'top',
    'top-right',
  ],
  [
    'left',
    'center',
    'right',
    
  ],
  [
    'bottom-left',
    'bottom',
    'bottom-right',
  ]];

switch (itemRow) {
  case 0:
    bordersIndexR = 0;
    break;
  case 7:
    bordersIndexR = 2;
    break;
  default:
    bordersIndexR = 1;
    break;
}

switch (itemColumn) {
  case 0:
    bordersIndexC = 0;
    break;
  case 7:
    bordersIndexC = 2;
    break;
  default:
    bordersIndexC = 1;
    break;
}
  return borders[bordersIndexR][bordersIndexC];
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
