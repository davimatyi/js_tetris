let field = [];

let currentMino = null;
let nextMino = null;
let heldMino = null;

let swapped = false;

let droptimer = 0, moveTimer = 0;

let gameOver = false;
let nameInputShowing = false;
let gamePaused = false;
let mainMenu = true;

let clearedLines = 0;
let level = 0;
let score = 0;

let highscores = null;

let nextPieceWindow;
let heldPieceWindow;
let scoreWindow;
let linesWindow;
let levelWindow;
let nameInputWindow;

let pauseWindow;
let gameOverWindow;
let menuWindow;

let scoreLabel;
let linesLabel;
let levelLabel;

let nameInput;

let highscoreTable;

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

    gameOver = false;
    gamePaused = false;
    mainMenu = false;
    swapped = false;
    score = 0;
    level = 0;
    clearedLines = 0;
}

function handleGameOver() {
    filter(BLUR, 5);
    if (highscores == null || score > highscores[0][1]) nameInputShowing = true;
}

function addHighScore() {
    let name = nameInput.getText();
    console.log(name);
    if(highscores != null) {
        let i = 0;
        while(i < 5 && i < highscores.length && highscores[i][1] < score) i++;
        if(i < highscores.length)
            highscores.splice(i, 0, [name, score]);
        else
            highscores.push([name, score]);
        if(highscores.length > 5) highscores.shift();
    } else {
        highscores = [
            [name, score]
        ];
    }
    storeItem("highscores", highscores);
    nameInputShowing = false;
}

function checkTetris() {
    let lines = 0;
    for (let i = mapHeight - 1; i >= 0; i--) {
        let row = true;
        for (let j = 0; j < mapWidth; j++) {
            if (!(field[j][i] && row)) row = false;
        }
        if (row) {
            for (let k = i; k >= 0; k--) {
                for (let j = 0; j < mapWidth; j++) {
                    field[j][k] = field[j][k - 1];
                }
            }
            for (let j = 0; j < mapWidth; j++) {
                field[j][0] = 0;
            }
            i++;
            lines++;
        }
    }
    clearedLines += lines;
    level = Math.floor(clearedLines / 10);
    switch (lines) {
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
    gameOver = gameOver || currentMino.checkFail();
    if (gameOver) handleGameOver();
}

function drop() {
    if (gameOver || gamePaused) return;
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
        if (keyIsDown(DOWN_ARROW))
            score += 1;
    }
}
function hardDrop() {
    if (gameOver || gamePaused) return;
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
    if (gameOver || gamePaused) return;
    currentMino.spin();
}

function moveLeft() {
    if (gameOver || gamePaused) return;
    currentMino.moveLeft();
}

function moveRight() {
    if (gameOver || gamePaused) return;
    currentMino.moveRight();
}

function hold() {
    if (gameOver || gamePaused || swapped) return;
    if (heldMino == null) {
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
    switch (keyCode) {
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
            if (gameOver) initGame();
            else hardDrop();
            break;
        case 27:
            gamePaused = !gamePaused;
            if (gamePaused) filter(BLUR, 5);
            break;
        case 67:
            hold();
            break;
    }
}

function renderGameUi() {
    clear();
    fill(255);
    stroke(120);

    rect(mapX, mapY, mapWidth * squaresize, mapHeight * squaresize);
    scoreLabel.setText(score);
    levelLabel.setText(level);
    linesLabel.setText(clearedLines);

    nextPieceWindow.draw();
    heldPieceWindow.draw();
    scoreWindow.draw();
    levelWindow.draw();
    linesWindow.draw();
}

function renderTetrominoes() {
    nextMino.drawAtPos([mapX + mapWidth * squaresize + 4.5 * squaresize,
    mapY + 2.5 * squaresize]);

    if (heldMino != null) {
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
}

function updateGame() {
    if (!gameOver && !gamePaused) {
        if (droptimer > Math.max(minDropInterval, dropInterval - level / 30)) drop();
        droptimer += deltaTime / 1000.0;
    }

    if (keyIsDown(DOWN_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if (moveTimer > initialMoveDelay) {
            if (moveTimer > initialMoveDelay + moveInterval) {
                drop();
                moveTimer = initialMoveDelay;
            }
        }

    } else if (keyIsDown(LEFT_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if (moveTimer > initialMoveDelay) {
            if (moveTimer > initialMoveDelay + moveInterval) {
                moveLeft();
                moveTimer = initialMoveDelay;
            }
        }

    } else if (keyIsDown(RIGHT_ARROW)) {
        moveTimer += deltaTime / 1000.0;
        if (moveTimer > initialMoveDelay) {
            if (moveTimer > initialMoveDelay + moveInterval) {
                moveRight();
                moveTimer = initialMoveDelay;
            }
        }
    } else {
        moveTimer = 0;
    }
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(200);

    initGame();
    mainMenu = true;
    highscores = getItem('highscores');

    nextPieceWindow = new Window(mapX + mapWidth * squaresize + 2 * squaresize, mapY, 6 * squaresize, 6 * squaresize);
    heldPieceWindow = new Window(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 7 * squaresize, 6 * squaresize, 6 * squaresize);
    scoreWindow = new Window(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 14 * squaresize, 6 * squaresize, 1.5 * squaresize);
    levelWindow = new Window(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 16.25 * squaresize, 6 * squaresize, 1.5 * squaresize);
    linesWindow = new Window(mapX + mapWidth * squaresize + 2 * squaresize, mapY + 18.5 * squaresize, 6 * squaresize, 1.5 * squaresize);
    nextPieceWindow.setTitle("Next");
    heldPieceWindow.setTitle("Hold");
    scoreWindow.setTitle("Score");
    levelWindow.setTitle("Level");
    linesWindow.setTitle("Lines");

    scoreLabel = new Label("0", mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 14.8 * squaresize);
    levelLabel = new Label("0", mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 17.05 * squaresize);
    linesLabel = new Label("0", mapX + mapWidth * squaresize + 7.5 * squaresize, mapY + 19.3 * squaresize);
    scoreLabel.setAlignment(RIGHT);
    levelLabel.setAlignment(RIGHT);
    linesLabel.setAlignment(RIGHT);
    scoreWindow.addComponent(scoreLabel);
    levelWindow.addComponent(levelLabel);
    linesWindow.addComponent(linesLabel);

    highscoreTable = new Table(canvasWidth / 2 - 190, 400, 380, 200, 5, 2, highscores);
    highscoreTable.flip();

    menuWindow = new Window(canvasWidth / 2 - 200, 75, 400, 550);
    pauseWindow = new Window(canvasWidth / 2 - 200, 100, 400, 450);
    gameOverWindow = new Window(canvasWidth / 2 - 200, 100, 400, 510);
    nameInputWindow = new Window(canvasWidth / 2 - 200, 300, 400, 250);

    let menuNewGameButton = new Button(canvasWidth / 2 - 100, 175, 200, 75, "New game");
    let pauseNewGameButton = new Button(canvasWidth / 2 - 100, 350, 200, 60, "New game");
    let overNewGameButton = new Button(canvasWidth / 2 - 100, 200, 200, 60, "New game");
    let resumeButton = new Button(canvasWidth / 2 - 100, 250, 200, 60, "Resume");
    let pauseExitButton = new Button(canvasWidth / 2 - 100, 450, 200, 60, "Exit to menu");
    let overExitButton = new Button(canvasWidth / 2 - 100, 300, 200, 60, "Exit to menu");
    let menuExitButton = new Button(canvasWidth / 2 - 100, 300, 200, 60, "Quit");
    let nameOkButton = new Button(canvasWidth / 2 - 100, 450, 200, 60, "Ok");
    nameInput = new Input(canvasWidth / 2 - 150, 350, 300, 75);
    menuNewGameButton.onClick(initGame);
    pauseNewGameButton.onClick(initGame);
    overNewGameButton.onClick(initGame);
    resumeButton.onClick(function () {
        gamePaused = false;
    });
    pauseExitButton.onClick(function () {
        gamePaused = false;
        mainMenu = true;
        filter(BLUR, 5);
    });
    overExitButton.onClick(function () {
        gameOver = false;
        mainMenu = true;
        filter(BLUR, 5);
    });
    nameOkButton.onClick(addHighScore);
    nameInput.onActionPerformed(addHighScore);
    menuWindow.addComponent(menuNewGameButton);
    menuWindow.addComponent(menuExitButton);
    pauseWindow.addComponent(pauseNewGameButton);
    pauseWindow.addComponent(resumeButton);
    pauseWindow.addComponent(pauseExitButton);
    gameOverWindow.addComponent(overNewGameButton);
    gameOverWindow.addComponent(overExitButton);
    menuWindow.addComponent(new Label("Tetris", canvasWidth / 2, 125));
    pauseWindow.addComponent(new Label("Paused", canvasWidth / 2, 150));
    gameOverWindow.addComponent(new Label("Game over", canvasWidth / 2, 150));
    menuWindow.addComponent(highscoreTable);
    gameOverWindow.addComponent(highscoreTable);
    nameInputWindow.addComponent(nameInput);
    nameInputWindow.addComponent(nameOkButton);
    let label = new Label("Enter your name", canvasWidth / 2 - 150, 325);
    label.setAlignment(LEFT);
    label.setTextSize(24);
    nameInputWindow.addComponent(label);


    renderGameUi();
    filter(BLUR, 5);
}

function draw() {
    if (mainMenu) {
        menuWindow.draw();
    } else if (gamePaused) {
        pauseWindow.draw();
    } else if (nameInputShowing) {
        nameInputWindow.draw();
    }
    else if (gameOver) {
        gameOverWindow.draw();
    } else {
        renderGameUi();
        renderTetrominoes();
        updateGame();
    }

}