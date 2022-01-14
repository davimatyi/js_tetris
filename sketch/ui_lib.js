
/**
 * @abstract
 */
 class UIComponent {
    backgroundColor = [255, 255, 255];
    foregroundColor = [0, 0, 0];
    textSize = 32;

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
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
        super(x, y, w, h);
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
            }
        } else {
            text(this.text, this.x + this.w / 2 - 2, this.y + this.h / 2 - 2);
            if(this.pressed) {
                this.pressed = false;
                this.fun();
            }
        }
    }
}

class Label extends UIComponent {
    constructor(text, x, y) {
        super(x, y, 0, 0);
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
        super(x, y, w, h);
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
        super(x,y,w,h);
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

class Table extends UIComponent {
    content = null;
    flipped = false;

    constructor(x, y, w, h, rows, cols, content) {
        super(x, y, w, h);
        this.rows = rows;
        this.cols = cols;
        this.content = content;
        this.cellWidth = this.w / cols;
        this.cellHeight = this.h / rows;
        this.textSize = 24;
    }

    flip() {
        this.flipped = ! this.flipped;
    }

    draw() {
        stroke(120);
        fill(this.backgroundColor);
        rect(this.x, this.y, this.w, this.h);
        for(let i = 1; i < this.rows; i++) {
            line(this.x + 5, this.y + this.cellHeight * i, this.x + this.w - 5, this.y + this.cellHeight * i);
        }
        for(let i = 1; i < this.cols; i++) {
            line(this.x + this.cellWidth * i, this.y + 5, this.x + this.cellWidth * i, this.y + this.h - 5);
        }
        fill(this.foregroundColor);
        textSize(this.textSize);
        textAlign(CENTER, CENTER);
        if(this.content != null) {
            for(let i = 0; i < (this.content.length > this.rows ? this.rows : this.content.length); i++) {
                for(let j = 0; j < (this.content[i].length > this.cols ? this.cols : this.content[i].length); j++) {
                    if(this.flipped)
                        text(this.content[this.content.length - (i + 1)][j], this.x + j * this.cellWidth + this.cellWidth / 2, this.y + i * this.cellHeight + this.cellHeight / 2);
                    else
                        text(this.content[i][j], this.x + j * this.cellWidth + this.cellWidth / 2, this.y + i * this.cellHeight + this.cellHeight / 2);
                }
            }
        }
        textSize(32);
    }
}