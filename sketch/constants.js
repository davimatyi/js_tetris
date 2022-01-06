
const squaresize = 30;
const mapWidth = 10, mapHeight = 20;
const mapX = 50, mapY = 50;
const dropInterval = 1;
const minDropInterval = 0.05;
const moveInterval = 0.1, initialMoveDelay = 0.2;
const initialPosition = [Math.floor(mapWidth / 2) -1, 0];
const canvasWidth = mapX + mapWidth * squaresize + 10 * squaresize;
const canvasHeight = mapY + mapHeight * squaresize + squaresize

const tetrominoes = [
    [[-1, 0], [0, 0], [1, 0], [2, 0]],      // straight
    [[0, 0], [1, 0], [0, 1], [1, 1]],       // square
    [[-1, 0], [0, 0], [1, 0], [0, 1]],      // T
    [[0, -1], [0, 0], [0, 1], [1, 1]],      // L
    [[0, 0], [1, 0], [0, 1], [-1, 1]],      // skew S
    [[0, -1], [0, 0], [0, 1], [-1, 1]],     // mirrored L
    [[0, 0], [-1, 0], [0, 1], [1, 1]],      // skew Z
]

const colors = [
    [43, 172, 226],
    [253, 225, 0],
    [146, 43, 140],
    [248, 150, 34],
    [78, 183, 72],
    [0, 90, 157],
    [238, 39, 51]
]

const nextOffsets = [
    [-0.5, 0],
    [-0.5, -0.5],
    [0, -0.5],
    [-0.5, 0],
    [0, -0.5],
    [0.5, 0],
    [0, -0.5]
]