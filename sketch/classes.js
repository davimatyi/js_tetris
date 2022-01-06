
class Tetromino {

    constructor(id, location, field) {
        this.id = id;
        this.location = location;
        this.color = colors[id];
        this.offset = nextOffsets[id];
        this.blocks = tetrominoes[id].slice();
        this.field = field;
    }

    drawOnMap() {
        fill(this.color);
        for (let i = 0; i < this.blocks.length; i++) {
            let x = mapX + this.location[0] * squaresize + this.blocks[i][0] * squaresize;
            let y = mapY + this.location[1] * squaresize + this.blocks[i][1] * squaresize;
            if (y >= mapY) {
                rect(x, y, squaresize, squaresize, 5);
            }
        }
    }
    drawAtPos(pos) {
        fill(this.color);
        for (let i = 0; i < this.blocks.length; i++) {
            rect(pos[0] + this.blocks[i][0] * squaresize + this.offset[0] * squaresize,
                pos[1] + this.blocks[i][1] * squaresize + this.offset[1] * squaresize,
                squaresize, squaresize, 5);
        }
    }

    drop() {
        let b = false;
        this.blocks.forEach(sq => {
            let x = this.location[0] + sq[0];
            let y = this.location[1] + sq[1];
            if(y == mapHeight -1 || this.field[x][y + 1]) b = true;
        });
        if(b) {
            this.blocks.forEach(sq => {
                this.field[this.location[0] + sq[0]][this.location[1] + sq[1]] = this.id + 1;
            });
        } else {
            this.location[1]++;
        }
        return b;
    }

    moveLeft() {
        let b = false;
        this.blocks.forEach(sq => {
            let y = this.location[1] + sq[1];
            let x = this.location[0] + sq[0];
            if (x == 0 || this.field[x - 1][y]) b = true;
        });
        if (!b) location[0]--;
    }

    moveRight() {
        let b = false;
        this.blocks.forEach(sq => {
            let y = this.location[1] + sq[1];
            let x = this.location[0] + sq[0];
            if (x == mapWidth - 1 || this.field[x + 1][y]) b = true;
        });
        if (!b) this.location[0]++;
    }

    spin() {
        let temp = this.blocks.slice();
        let moves = 0;
        for (let i = 0; i < temp.length; i++) {
            let c = temp[i].slice();
            temp[i] = [-1 * c[1], c[0]];
            if (this.location[0] + temp[i][0] < 0) {
                moves++;
            }
            if (this.location[0] + temp[i][0] >= mapWidth) {
                moves--;
            }
        }
        for (let i = 0; i < temp.length; i++) {
            if (this.field[this.location[0] + temp[i][0]][this.location[1] + temp[i][1]]) return;
        }
        if(moves > 0) for(let i = 0; i < moves; i++) this.moveRight();
        else if(moves < 0) for(let i = 0; i > moves; i--) this.moveLeft();

        this.blocks = temp;
        let o = this.offset.slice();
        this.offset = [-1 * o[1], o[0]];
    }

}