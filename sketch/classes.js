
class Tetromino {

    constructor(id, location, field) {
        this.id = id;
        this.location = location.slice();
        this.color = colors[id];
        this.offset = nextOffsets[id];
        this.blocks = tetrominoes[id].slice();
        this.field = field;
    }

    setLocation(loc) {
        this.location = loc.slice();
    }

    getBlocks() {
        return this.blocks;
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

    drawGhost() {
        for(let i = 0; i < mapHeight; i++) {
            let b = false;
            this.blocks.forEach(sq => {
                let x = this.location[0] + sq[0];
                let y = this.location[1] + i + sq[1];
                if (y == mapHeight - 1 || this.field[x][y + 1]) b = true;
            });
            if(b) {
                fill(240);
                stroke(180);
                this.blocks.forEach(sq => {
                    let x = mapY + (this.location[0] + sq[0]) * squaresize;
                    let y = mapX + (this.location[1] + i + sq[1]) * squaresize;
                    if(y >= mapY)
                        rect(x, y, squaresize, squaresize, 5);
                });
                stroke(120);
                return;
            }
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

    hardDrop() {
        for(let i = 0; i < mapHeight; i++) {
            let b = false;
            this.blocks.forEach(sq => {
                let x = this.location[0] + sq[0];
                let y = this.location[1] + i + sq[1];
                if (y == mapHeight - 1 || this.field[x][y + 1]) b = true;
            });
            if(b) {
                this.blocks.forEach(sq => {
                    this.field[this.location[0] + sq[0]][this.location[1]+ i + sq[1]] = this.id + 1;
                });
                return i;
            }
        }                
    }

    moveLeft() {
        let b = false;
        this.blocks.forEach(sq => {
            let y = this.location[1] + sq[1];
            let x = this.location[0] + sq[0];
            if (x == 0 || this.field[x - 1][y]) b = true;
        });
        if (!b) this.location[0]--;
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
            if (this.field[this.location[0] + temp[i][0] + moves][this.location[1] + temp[i][1]]) return;
        }
        if(moves > 0) for(let i = 0; i < moves; i++) this.moveRight();
        else if(moves < 0) for(let i = 0; i > moves; i--) this.moveLeft();

        this.blocks = temp;
        let o = this.offset.slice();
        this.offset = [-1 * o[1], o[0]];
    }

    checkFail() {
        for(let i = 0; i < this.blocks.length; i++) {
            if(this.field[this.location[0] + this.blocks[i][0]][this.location[1] + this.blocks[i][1]]) return true;
        }
        return false;
    }

}

/**
 * @abstract
 */
class UIComponent {
    backgroundColor = [255, 255, 255];
    foregroundColor = [0, 0, 0];
    textSize = 32;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return [x, y];
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setPosition(pos) {
        this.x = pos[0];
        this.y = pos[1];
    }

    setBackground(color) {
        this.backgroundColor = color.slice();
    }

    setForeground(color) {
        this.foregroundColor = color.slice();
    }

    setTextSize(size) {
        this.textSize = size;
    }

    draw(){}
}

class Button extends UIComponent {
    highlightColor = [230, 230, 230];
    fun = function() {
        console.log("Button pressed");
    }
    constructor(x, y, w, h, text) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.text = text;
        this.pressed = false;
    }

    setText(text) {
        this.text = text;
    }

    onClick(fun) {
        this.fun = fun;
    }

    isMouseOver() {
        return (mouseX >= this.x) && (mouseY >= this.y) && (mouseX <= this.x + this.w) && (mouseY <= this.y + this.h);
    }

    draw() {
        fill(this.isMouseOver() ? this.highlightColor : this.backgroundColor);
        stroke(80);
        if(this.isMouseOver() && mouseIsPressed) {
            rect(this.x, this.y, this.w, this.h);
            rect(this.x + 1, this.y + 1, this.w, this.h);
        } else {
            line(this.x + 1, this.y + this.h + 1, this.x + this.w + 1, this.y + this.h + 1);
            line(this.x + this.w + 1, this.y + 1, this.x + this.w + 1, this.y + this.h + 1);
            rect(this.x - 2, this.y - 2, this.w, this.h);
            line(this.x + this.w - 2, this.y - 2, this.x + this.w + 1, this.y + 1);
            line(this.x - 2, this.y + this.h - 2, this.x + 1, this.y + this.h + 1);
            line(this.x + this.w - 2, this.y + this.h - 2, this.x + this.w + 1, this.y + this.h + 1);
        }
        fill(this.foregroundColor);
        textSize(this.textSize);
        textAlign(CENTER, CENTER);
        if(this.isMouseOver() && mouseIsPressed) {
            text(this.text, this.x + this.w / 2 + 1, this.y + this.h / 2 + 1);
            if(!this.pressed) {
                this.pressed = true;
                this.fun();
            }
        } else {
            text(this.text, this.x + this.w / 2 - 2, this.y + this.h / 2 - 2);
            if(this.pressed) this.pressed = false;
        }
    }
}

class Label extends UIComponent {
    constructor(text, x, y) {
        super(x, y);
        this.text = text;
        this.alignment = CENTER;
    }

    setAlignment(alignment) {
        this.alignment = alignment;
    }

    setText(text) {
        this.text = text + "";
    }

    draw() {
        fill(this.foregroundColor);
        textAlign(this.alignment);
        textSize(this.textSize);
        text(this.text, this.x, this.y);
    }
}

class Input extends UIComponent {
    text = ""
    fun = function () {
        console.log("Input submitted: '" + this.text + "'");
    }
    focused = false;
    elapsedTime = 0;
    typed = false;
    
    constructor(x, y, w, h) {
        super(x, y);
        this.w = w;
        this.h = h;
    }

    getText() {
        return this.text;
    }

    setText(text) {
        this.text = text;
    }

    onActionPerformed(fun) {
        this.fun = fun;
    }

    isMouseOver() {
        return (mouseX >= this.x) && (mouseY >= this.y) && (mouseX <= this.x + this.w) && (mouseY <= this.y + this.h);
    }

    draw() {
        stroke(this.focused ? 20 : 80);
        fill(this.backgroundColor);
        rect(this.x, this.y, this.w, this.h);
        fill(this.foregroundColor);
        textAlign(CENTER);
        text(this.text + (this.focused ? (this.elapsedTime % 2 > 1 ? "|" : " ") : " "), this.x + this.w / 2, this.y + this.h / 2);
        if(mouseIsPressed) {
            if(this.isMouseOver()) this.focused = true;
            else this.focused = false;
        }
        if(focused) {
            if((!keyIsPressed) && this.typed) this.typed = false;
            else if(keyIsPressed) {
                switch(keyCode) {
                    case 13: // enter
                        if(!this.typed) this.fun();
                        break;
                    case 8: // backspace
                        if(this.text.length > 0 && ! this.typed) this.text = this.text.slice(0, -1);
                        break;
                    case 16: // shift
                    case 17: // control
                    case 18: // alt
                        return;
                    case 32: // space
                        if(!this.typed) this.text += " ";
                    default:
                        if(keyCode >= 65 && keyCode <= 90 && ! this.typed) this.text += key;
                }
                this.typed = true;
            }
        }

        this.elapsedTime += deltaTime / 500.0;
    }

}

class Window extends UIComponent {
    title = null;
    components = [];

    constructor(x, y, w, h) {
        super(x,y);
        this.w = w;
        this.h = h;
    }

    setTitle(title) {
        this.title = title;
    }

    addComponent(component) {
        this.components.push(component);
    }

    draw() {
        stroke(120);
        fill(this.backgroundColor);
        rect(this.x, this.y, this.w, this.h);
        if(this.title != null) {
            textSize(24);
            textAlign(LEFT, CENTER);
            noStroke();
            rect(this.x + 15, this.y - 1, textWidth(this.title) + 10, 2);
            stroke(120);
            fill(this.foregroundColor);
            text(this.title, this.x + 20, this.y);
            textSize(32)
        }
        this.components.forEach(comp => comp.draw());
    }


}