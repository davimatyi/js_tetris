
const squaresize = 30;
const mapWidth = 10, mapHeight = 20;
const mapX = 50, mapY = 50;
const dropInterval = 1;
const moveInterval = 0.1, initialMoveDelay = 0.2;


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
    [0, 0.5],
    [0, 0],
    [0.5, 0],
    [0, 0.5],
    [0.5, 0],
    [1, 0.5],
    [0.5, 0]
]

let field = [];

let currentMino = [];
let currentMinoX = Math.floor(mapWidth / 2), currentMinoY = 0, currentMinoColor = 0;
let nextMino = [];
let nextMinoColor = 0;

let droptimer = 0, moveTimer = 0;

let gameLost = false;
let gamePaused = false;

function checkTetris() {
    for(let i = mapHeight -1; i >= 0; i--) {
        let row = true;
        for(let j = 0; j < mapWidth; j++) {
            if(!(field[j][i] && row)) row = false;
        }
        if(row) {
            for(let k = i; k >= 0; k--) {
                for(let j = 0; j < mapWidth; j++) {
                    field[j][k] = field[j][k-1];
                }
            }
            for(let j = 0; j < mapWidth; j++) {
                field[j][0] = 0;
            }
            i++;
        }
    }
}

function checkFail() {
    for(let i = 0; i < currentMino.length; i++) {
        if(field[currentMinoX + currentMino[i][0]][currentMinoY + currentMino[i][1]]) gameLost = true;
    }
}

function drop() {
    if(gameLost || gamePaused) return;
    droptimer = 0;
    let b = false;
    currentMino.forEach(sq => {
        let y = currentMinoY + sq[1];
        let x = currentMinoX + sq[0];
        if (y == mapHeight - 1 || field[x][y + 1]) b = true;
    });
    if (b) {
        currentMino.forEach(sq => {
            field[currentMinoX + sq[0]][currentMinoY + sq[1]] = currentMinoColor;
        });
        currentMino = nextMino;
        currentMinoColor = nextMinoColor;
        let ind = Math.floor(Math.random() * tetrominoes.length);
        nextMinoColor = ind + 1;
        nextMino = tetrominoes[ind].slice();
        currentMinoX = 5;
        currentMinoY = 0;
        checkTetris();
        checkFail();
    } else currentMinoY++;

}

function spin() {
    if(gameLost || gamePaused) return;
    let temp = currentMino.slice();
    for (let i = 0; i < temp.length; i++) {
        let c = temp[i].slice();
        temp[i] = [-1 * c[1], c[0]];
    }
    for (let i = 0; i < temp.length; i++) {
        if (field[currentMinoX + temp[i][0]][currentMinoY + temp[i][1]] == true) return;
    }
    currentMino = temp;

}

function moveLeft() {
    if(gameLost || gamePaused) return;
    let b = false;
    currentMino.forEach(sq => {
        let y = currentMinoY + sq[1];
        let x = currentMinoX + sq[0];
        if (x == 0 || field[x - 1][y]) b = true;
    });
    if (!b) currentMinoX--;
}

function moveRight() {
    if(gameLost || gamePaused) return;
    let b = false;
    currentMino.forEach(sq => {
        let y = currentMinoY + sq[1];
        let x = currentMinoX + sq[0];
        if (x == mapWidth - 1 || field[x + 1][y]) b = true;
    });
    if (!b) currentMinoX++;
}

function keyPressed() {
    switch(keyCode) {
        case LEFT_ARROW: 
            moveLeft();
            break;
        case RIGHT_ARROW:
            moveRight();
            break;
        case UP_ARROW:
            spin();
            break;
        case DOWN_ARROW:
            drop();
            break;
        case 32:
            do {
                drop();
            } while(currentMinoY != 0);
            break;
        case 27:
            gamePaused = ! gamePaused;
    }   
}


function setup() {
    createCanvas(mapX + mapWidth * squaresize + 10 * squaresize, mapY + mapHeight * squaresize + 10);
    frameRate(200);

    for (let i = 0; i < mapWidth; i++) {
        field[i] = []
        for (let j = 0; j < mapHeight; j++) {
            field[i][j] = 0;
        }
    }
    let ind = Math.floor(Math.random() * tetrominoes.length);
    currentMinoColor = ind + 1;
    currentMino = tetrominoes[ind].slice();
    ind = Math.floor(Math.random() * tetrominoes.length);
    nextMinoColor = ind + 1;
    nextMino = tetrominoes[ind].slice();
}

function draw() {
    clear();
    fill(255);
    rect(mapX, mapY, mapWidth * squaresize, mapHeight * squaresize);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY, 6 * squaresize, 6 * squaresize);
    for(let i = 0; i < nextMino.length; i++) {
        fill(colors[nextMinoColor - 1]);
        rect(mapX + mapWidth * squaresize + 4 * squaresize + nextMino[i][0] * squaresize + nextOffsets[nextMinoColor-1][0] * squaresize,
             mapY + 2 * squaresize + nextMino[i][1] * squaresize + nextOffsets[nextMinoColor-1][1] * squaresize,
             squaresize, squaresize);
    }
    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (field[i][j]) {
                fill(colors[field[i][j] - 1])
                rect(mapX + i * squaresize, mapY + j * squaresize, squaresize, squaresize);
            }
        }
    }
    for (let i = 0; i < currentMino.length; i++) {
        let x = mapX + currentMinoX * squaresize + currentMino[i][0] * squaresize;
        let y = mapY + currentMinoY * squaresize + currentMino[i][1] * squaresize;
        if(y >= mapY) {
            fill(colors[currentMinoColor - 1]);
            rect(x, y, squaresize, squaresize);
        }
    }
    fill(255);

    if(! gameLost && ! gamePaused) {
        if (droptimer > dropInterval) drop();
        droptimer += deltaTime / 1000.0;
    }


    if(keyIsDown(DOWN_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if(moveTimer > initialMoveDelay) {
            if(moveTimer > initialMoveDelay + moveInterval) {
                drop();
                moveTimer = initialMoveDelay;
            }
        }

    } else if(keyIsDown(LEFT_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if(moveTimer > initialMoveDelay) {
            if(moveTimer > initialMoveDelay + moveInterval) {
                moveLeft();
                moveTimer = initialMoveDelay;
            }
        }

    } else if(keyIsDown(RIGHT_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if(moveTimer > initialMoveDelay) {
            if(moveTimer > initialMoveDelay + moveInterval) {
                moveRight();
                moveTimer = initialMoveDelay;
            }
        }
    } else {
        moveTimer = 0;
    }

    fill(0);
    if(gamePaused) {
        fill(255);
        rect(mapX + (mapWidth * squaresize) / 2 - 100, mapY + (mapHeight * squaresize) / 2 - 25, 200, 50);
        fill(0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Paused", mapX + (mapWidth * squaresize) / 2, mapY + (mapHeight * squaresize) / 2);
    }
    textSize(24);
    textAlign(LEFT, BOTTOM);
    text("Next", mapX + mapWidth * squaresize + 3 * squaresize, mapY);

    fill(255);


}