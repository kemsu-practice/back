
function safeGetCell(matrix, row, col) {
  if(!matrix[row]) {
    return {}
  }
  if(!matrix[row][col]) {
    return {}
  }
  return matrix[row][col]
}

function findAllCellsOfFigure(cell, matrix, figure) {
  if(!cell || !cell.filled) {
    return figure;
  }
  if(figure.some(item => item.row === cell.row && item.col === cell.col)) {
    return figure;
  }

  figure.push({...cell});

  const directions = [
    {row: -1, col: 0},
    {row: 1, col: 0},
    {row: 0, col: -1},
    {row: 0, col: 1},
  ]
  directions.forEach(direction => {
    const checkCell = safeGetCell(matrix, cell.row+direction.row, cell.col+direction.col);
    findAllCellsOfFigure(checkCell, matrix, figure)
  })
  return figure
}

function checkFigureCorners(figure, matrix) {
  let result = false;
  figure.some(cell => {
    const corners = [
      {row: -1, col: -1},
      {row: -1, col: 1},
      {row: 1, col: -1},
      {row: 1, col: 1},
    ]
    corners.forEach(corner => {
      const checkCell = safeGetCell(matrix, cell.row+corner.row, cell.col+corner.col);
      if(figure.some(cell => checkCell.row === cell.row && checkCell.col === cell.col)) {
        return;
      }
      if(checkCell && checkCell.filled) {
        result = true;
      }
    })
  })
  return result;
}

function getMatrixFromCells(cells) {
  const matrix = [];
  for(const cell of cells.filter(item => item.filled && item.row && item.col)) {
    if(!matrix[cell.row]) {
      matrix[cell.row] = [];
    }
    matrix[cell.row][cell.col] = cell;
  }
  return matrix;
}

function checkField(cells) {
  const matrix = getMatrixFromCells(cells);
  const found = [];
  const figures = [];

  for(const row in matrix) {
    for(const col in matrix[row]) {
      const cell = matrix[row][col];
      if(found.some(item => item.row === cell.row && item.col === cell.col)) {
        continue;
      }
      const newFigure = findAllCellsOfFigure(cell, matrix, []);
      for(const cell of newFigure) {
        found.push(cell)
      }
      figures.push(newFigure)
    }
  }
  const sizeCounts = [
    0,
    4,
    3,
    2,
    1
  ]
  for(const figure of figures) {
    if(!sizeCounts[figure.length]) {
      sizeCounts[figure.length] = 0;
    }
    sizeCounts[figure.length]--;
  }
  const errors = [];
  for(const idx in sizeCounts) {
    if(idx > 4) {
      errors.push('Слишком большой корабль: '+idx)
      continue;
    }
    if(sizeCounts[idx] < 0) {
      errors.push('Слишком много кораблей размера: '+idx + ', нужно убрать еще: '+ -sizeCounts[idx])
    }
    if(sizeCounts[idx] > 0) {
      errors.push('Слишком мало кораблей размера: '+idx + ', нужно добавить еще: '+sizeCounts[idx])
    }
  }
  let hasCornerError = false;
  for(const figure of figures) {
    if(!hasCornerError && checkFigureCorners(figure, matrix)) {
      hasCornerError = true;
      errors.push('Корабли не могут соприкасаться углами')
    }
  }
  return errors;
}

function getSize(cells, figureCell) {
  const matrix = getMatrixFromCells(cells);
  const figure = findAllCellsOfFigure(figureCell, matrix, [])
  return figure.length;
}

function getFigure(cells, row, col) {
  const matrix = getMatrixFromCells(cells);
  const figure = findAllCellsOfFigure({row, col}, matrix, [])
  return figure;
}

module.exports = {checkField, getSize, getFigure}
