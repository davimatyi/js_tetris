let field = [];

let currentMino = null;
let nextMino = null;
let heldMino = null;

let swapped = false;

let droptimer = 0, moveTimer = 0;

let gameLost = false;
let gamePaused = false;

let clearedLines = 0;
let level = 0;
let score = 0;

let highscores = {};


function initGame() {
    for (let i = 0; i < mapWidth; i++) {
        field[i] = []
        for (let j = 0; j < mapHeight; j++) {
            field[i][j] = 0;
        }
    }
    let ind = Math.floor(Math.random() * tetrominoes.length);
    currentMino = new Tetromino(ind, initialPosition, field);
    ind = Math.floor(Math.random() * tetrominoes.length);
    nextMino = new Tetromino(ind, initialPosition, field);
    gameLost = false;
    gamePaused = false;
    swapped = false;
    score = 0;
    level = 0;
    clearedLines = 0;
}

function checkTetris() {
    let lines = 0;
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
            lines++;
        }
    }
    clearedLines += lines;
    level = Math.floor(clearedLines / 10);
    switch(lines) {
        case 0: break;
        case 1: 
            score += 40 * (level + 1);
            break;
        case 2:
            score += 100 * (level + 1);
            break;
        case 3:
            score += 300 * (level + 1);
            break;
        default:
            score += 1200 * (level + 1);
    }
}

function checkFail() {
    gameLost = gameLost || currentMino.checkFail();
}

function drop() {
    if(gameLost || gamePaused) return;
    droptimer = 0;
    let b = currentMino.drop();
    if (b) {
        currentMino = nextMino;
        let ind = Math.floor(Math.random() * tetrominoes.length);
        nextMino = new Tetromino(ind, initialPosition, field);
        checkTetris();
        checkFail();
        swapped = false;
    } else {
        if(keyIsDown(DOWN_ARROW))
            score += 1;
    }
}
function hardDrop() {
    if(gameLost || gamePaused) return;
    dropTimer = 0;
    let p = currentMino.hardDrop();
    currentMino = nextMino;
    let ind = Math.floor(Math.random() * tetrominoes.length);
    nextMino = new Tetromino(ind, initialPosition, field);
    checkTetris();
    checkFail();
    swapped = false;
    score += 2 * p;
}

function spin() {
    if(gameLost || gamePaused) return;
    currentMino.spin();
}

function moveLeft() {
    if(gameLost || gamePaused) return;
    currentMino.moveLeft();
}

function moveRight() {
    if(gameLost || gamePaused) return;
    currentMino.moveRight();
}

function hold() {
    if(gameLost || gamePaused || swapped) return;
    if(heldMino == null) {
        heldMino = currentMino;
        currentMino = nextMino;
        let ind = Math.floor(Math.random() * tetrominoes.length);
        nextMino = new Tetromino(ind, initialPosition, field);
        checkFail();
    } else {
        let temp = heldMino;
        heldMino = currentMino;
        currentMino = temp;
        currentMino.setLocation(initialPosition);
    }
    swapped = true;
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
            if(gameLost) initGame();
            else hardDrop();
            break;
        case 27:
            gamePaused = ! gamePaused;
            break;
        case 67:
            hold();
            break;
    }   
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(200);

    initGame();    
    highscores = getItem('highscores');
    // TODO finish highscores
}

function draw() {
    clear();
    fill(255);
    stroke(120);

    rect(mapX, mapY, mapWidth * squaresize, mapHeight * squaresize);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY, 6 * squaresize, 6 * squaresize);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 7 * squaresize, 6 * squaresize, 6 * squaresize);

    nextMino.drawAtPos([mapX + mapWidth * squaresize + 4.5 * squaresize,
                        mapY + 2.5 * squaresize]);

    if(heldMino != null) {
        heldMino.drawAtPos([mapX + mapWidth * squaresize + 4.5 * squaresize,
                            mapY + 9.5 * squaresize]);
    }

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (field[i][j]) {
                fill(colors[field[i][j] - 1])
                rect(mapX + i * squaresize, mapY + j * squaresize, squaresize, squaresize, 5);
            }
        }
    }
    currentMino.drawGhost();
    currentMino.drawOnMap();

    if(! gameLost && ! gamePaused) {
        if (droptimer > Math.max(minDropInterval, dropInterval - level / 30)) drop();
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
    
    fill(255);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 14 * squaresize, 6 * squaresize, 1.5 * squaresize);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 16.25 * squaresize, 6 * squaresize, 1.5 * squaresize);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 18.5 * squaresize, 6 * squaresize, 1.5 * squaresize);
    noStroke();
    rect(mapX + mapWidth * squaresize + 2.5 * squaresize - 5, mapY - 0.5 * squaresize, 60, 25);
    rect(mapX + mapWidth * squaresize + 2.5 * squaresize - 5, mapY + 6.5 * squaresize, 60, 25);
    rect(mapX + mapWidth * squaresize + 2.5 * squaresize - 5, mapY + 13.5 * squaresize, 75, 25);
    rect(mapX + mapWidth * squaresize + 2.5 * squaresize - 5, mapY + 15.75 * squaresize, 70, 25);
    rect(mapX + mapWidth * squaresize + 2.5 * squaresize - 5, mapY + 18 * squaresize, 70, 25);
    stroke(120);
    fill(0);
    textSize(24);
    textAlign(LEFT, CENTER);
    text("Next", mapX + mapWidth * squaresize + 2.5 * squaresize, mapY);
    text("Hold", mapX + mapWidth * squaresize + 2.5 * squaresize, mapY + 7 * squaresize);
    text("Score", mapX + mapWidth * squaresize + 2.5 * squaresize, mapY + 14 * squaresize);
    text("Level", mapX + mapWidth * squaresize + 2.5 * squaresize, mapY + 16.25 * squaresize);
    text("Lines", mapX + mapWidth * squaresize + 2.5 * squaresize, mapY + 18.5 * squaresize);
    textSize(32);
    textAlign(RIGHT, CENTER);
    text(score,        mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 14.8 * squaresize);
    text(level,        mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 17.05 * squaresize);
    text(clearedLines, mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 19.3 * squaresize);


    if(gamePaused) {
        // filter(BLUR, 10);
        fill(255);
        rect(mapX + (mapWidth * squaresize) / 2 - 100, mapY + (mapHeight * squaresize) / 2 - 25, 200, 50);
        fill(0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Paused", mapX + (mapWidth * squaresize) / 2, mapY + (mapHeight * squaresize) / 2);
    }
    if(gameLost) {
        fill(255);
        rect(mapX + (mapWidth * squaresize) / 2 - 100, mapY + (mapHeight * squaresize) / 2 - 40, 200, 80);
        fill(0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Game over", mapX + (mapWidth * squaresize) / 2, mapY + (mapHeight * squaresize) / 2 - 10);
        textSize(14);
        text("Press space to restart", mapX + (mapWidth * squaresize) / 2, mapY + (mapHeight * squaresize) / 2 + 18)
    }
}