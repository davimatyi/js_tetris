let field = [];

let currentMino = [];
let currentMinoX = Math.floor(mapWidth / 2) - 1, currentMinoY = 0, currentMinoColor = 0;
let nextMino = [];
let nextMinoColor = 0;
let heldMino = [];
let heldMinoColor = 0;
let swapped = false;
let heldMinoOffsets = [0, 0]
let currentMinoOffsets = [0, 0]

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
    currentMinoColor = ind + 1;
    currentMinoOffsets = nextOffsets[ind].slice();
    currentMino = tetrominoes[ind].slice();
    ind = Math.floor(Math.random() * tetrominoes.length);
    nextMinoColor = ind + 1;
    nextMino = tetrominoes[ind].slice();
    heldMino = [];
    heldMinoColor = 0;
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
        currentMinoOffsets = nextOffsets[nextMinoColor-1].slice();
        let ind = Math.floor(Math.random() * tetrominoes.length);
        nextMinoColor = ind + 1;
        nextMino = tetrominoes[ind].slice();
        currentMinoX = Math.floor(mapWidth / 2) - 1;
        currentMinoY = 0;
        checkTetris();
        checkFail();
        swapped = false;
    } else {
        currentMinoY++;
        if(keyIsDown(DOWN_ARROW))
            score += 1;
    }

}

function spin() {
    if(gameLost || gamePaused) return;
    let temp = currentMino.slice();
    for (let i = 0; i < temp.length; i++) {
        let c = temp[i].slice();
        temp[i] = [-1 * c[1], c[0]];
        // TODO check if straight piece is outside of map
        if(currentMinoX + temp[i][0] < 0) {
            moveRight();
        }
        if(currentMinoX + temp[i][0] >= mapWidth) {
            moveLeft();
        }
    }
    for (let i = 0; i < temp.length; i++) {
        if (field[currentMinoX + temp[i][0]][currentMinoY + temp[i][1]]) return;
    }
    currentMino = temp;
    let o = currentMinoOffsets.slice();
    currentMinoOffsets = [ -1 * o[1], o[0]];
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

function hold() {
    if(gameLost || gamePaused || swapped) return;
    if(heldMinoColor == 0) {
        heldMino = currentMino;
        heldMinoColor = currentMinoColor;
        heldMinoOffsets = currentMinoOffsets;
        currentMino = nextMino;
        currentMinoColor = nextMinoColor;
        let ind = Math.floor(Math.random() * tetrominoes.length);
        currentMinoOffsets = nextOffsets[ind].slice();
        nextMinoColor = ind + 1;
        nextMino = tetrominoes[ind].slice();
        currentMinoX = Math.floor(mapWidth / 2) - 1;
        currentMinoY = 0;
        checkFail();
    } else {
        let temp = heldMino;
        let tempc = heldMinoColor;
        let temph = heldMinoOffsets;
        heldMino = currentMino;
        heldMinoColor = currentMinoColor;
        heldMinoOffsets = currentMinoOffsets;
        currentMino = temp;
        currentMinoColor = tempc;
        currentMinoOffsets = temph;
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
            else
                do {
                    drop();
                    score += 2;
                } while(currentMinoY != 0);
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
    createCanvas(mapX + mapWidth * squaresize + 10 * squaresize, mapY + mapHeight * squaresize + 10);
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
    for(let i = 0; i < nextMino.length; i++) {
        fill(colors[nextMinoColor - 1]);
        rect(mapX + mapWidth * squaresize + 4 * squaresize + nextMino[i][0] * squaresize 
             + nextOffsets[nextMinoColor-1][0] * squaresize + 0.5 * squaresize,
             mapY + 2 * squaresize + nextMino[i][1] * squaresize + nextOffsets[nextMinoColor-1][1] * squaresize + 0.5 * squaresize,
             squaresize, squaresize, 5);
    }
    fill(255);
    rect(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 7 * squaresize, 6 * squaresize, 6 * squaresize);
    for(let i = 0; i < heldMino.length; i++) {
        fill(colors[heldMinoColor - 1]);
        rect(mapX + mapWidth * squaresize + 4 * squaresize + heldMino[i][0] * squaresize + heldMinoOffsets[0] * squaresize + 0.5 * squaresize,
             mapY + 9 * squaresize + heldMino[i][1] * squaresize + heldMinoOffsets[1] * squaresize + 0.5 * squaresize,
             squaresize, squaresize, 5);
    }

    for(let i = 0; i < mapHeight; i++) {
        let b = false;
        currentMino.forEach(sq => {
            let y = currentMinoY + i + sq[1];
            let x = currentMinoX + sq[0];
            if (y == mapHeight - 1 || field[x][y + 1]) b = true;
        });
        if(b) {
            fill(240);
            stroke(180);
            currentMino.forEach(sq => {
                let y = mapX + (currentMinoY + i + sq[1]) * squaresize;
                let x = mapY + (currentMinoX + sq[0]) * squaresize;
                rect(x, y, squaresize, squaresize, 5);
            });
            stroke(120);
            break;
        }
    }

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (field[i][j]) {
                fill(colors[field[i][j] - 1])
                rect(mapX + i * squaresize, mapY + j * squaresize, squaresize, squaresize, 5);
            }
        }
    }
    for (let i = 0; i < currentMino.length; i++) {
        let x = mapX + currentMinoX * squaresize + currentMino[i][0] * squaresize;
        let y = mapY + currentMinoY * squaresize + currentMino[i][1] * squaresize;
        if(y >= mapY) {
            fill(colors[currentMinoColor - 1]);
            rect(x, y, squaresize, squaresize, 5);
        }
    }
    fill(255);

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

    fill(255);


}