export function allowedValues(position, distance, boardSize) {
  let allowValues = [];
  const itemRow = Math.floor(position / boardSize);
  const itemColumn = position % boardSize;
  
  for (let i = 1; i <= distance; i += 1) {
    if ((itemColumn + i) < 8) {
      allowValues.push((itemRow * 8) + (itemColumn + i));
    }
    if ((itemColumn - i) >= 0) {
      allowValues.push((itemRow * 8) + (itemColumn - i));
    }
    if ((itemRow + i) < 8) {
      allowValues.push(((itemRow + i) * 8) + itemColumn);
    }
    if ((itemRow - i) >= 0) {
      allowValues.push(((itemRow - i) * 8) + itemColumn);
    }
    if ((itemRow + i) < 8 && (itemColumn + i) < 8) {
      allowValues.push(((itemRow + i) * 8) + (itemColumn + i));
    }
    if ((itemRow - i) >= 0 && (itemColumn - i) >= 0) {
      allowValues.push(((itemRow - i) * 8) + (itemColumn - i));
    }
    if ((itemRow + i) < 8 && (itemColumn - i) >= 0) {
      allowValues.push(((itemRow + i) * 8) + (itemColumn - i));
    }
    if ((itemRow - i) >= 0 && (itemColumn + i) < 8) {
      allowValues.push(((itemRow - i) * 8) + (itemColumn + i));
    }
  }
  return allowValues;
}

export function allowedValuesAttack(position, distance, boardSize) {
  const allowValues = [];
  const itemRow = Math.floor(position / boardSize);
  const itemColumn = position % boardSize;
  let columnStart;
  let rowStart;
  let columnEnd;
  let rowEnd;

  columnStart = (itemColumn - distance) > 0 ? itemColumn - distance : 0;
  columnEnd = (itemColumn + distance) < 7 ? itemColumn + distance : 7;
  rowStart = (itemRow - distance) > 0 ? itemRow - distance : 0;
  rowEnd = (itemRow + distance) < 7 ? itemRow + distance : 7;

  for (let i = columnStart; i <= columnEnd; i += 1) {
    for (let j = rowStart; j <= rowEnd; j += 1) {
      allowValues.push((j * 8) + i);
    }
  }
  return allowValues;
}
