var Cell = function (y, x, image) {
    this.checkCollision = function (cell) {
        if (this.x == cell.x && this.y == cell.y) {
            return true;
        }
        else {
            return false;
        }
    };
    this.update = function () {
        this.image.style.left = this.x * scale + 'px';
        this.image.style.top = this.y * scale + 'px';
    };
    this.x = x;
    this.y = y;
    this.image = document.createElement("img");
    this.image.src = image;
    this.image.style.position = 'absolute';
    this.image.style.width = scale + 'px';
    document.body.appendChild(this.image);
    this.update();
};

Cell.prototype.die = function () {
    map.delete(this);
    document.body.removeChild(this.image);
};

var Peach = function (y, x, image) {
    Cell.call(this, y, x, image);
};

var Mario = function (y, x, image) {
    Cell.call(this, y, x, image);
    this.jumpPower = 0;
    this.jumped = 0;
    this.falling = false;
    var mario = this;
    this.makeJump = function () {
        if (this.jumpPower>0){
            this.y -= 1;
            this.jumpPower--;
            if(typeof map.checkCollision(mario) !== "undefined"){
                if(map.checkCollision(mario).constructor.name == 'Koopa'){
                    mario.die();
                }else if(map.checkCollision(mario).constructor.name == 'Peach'){
                    mario.win();
                }else{
                    mario.y += 1;
                }
            }
        }
    };
    this.fall = function () {
        if (this.jumpPower == 0){
            this.y += 1;
            if(typeof map.checkCollision(this) !== "undefined"){
                if(map.checkCollision(mario).constructor.name == 'Koopa'){
                    map.checkCollision(mario).die();
                    kick.play();
                    if (typeof inputs.ArrowUp !== 'undefined' && inputs.ArrowUp.isPressed) {
                        mario.jumpPower = 5;
                    }
                    else {mario.jumpPower = 3;}
                    mario.jumped=1;
                    mario.makeJump();
                }else if(map.checkCollision(mario).constructor.name == 'Peach'){
                    mario.win();
                }else{
                    mario.y -= 1;
                }
                return false;
            } else {
                return true;
            }
        }
    };
    function moveLateral() {
        if(typeof inputs.ArrowLeft !== 'undefined'){
            if(inputs.ArrowLeft.isPressed == true){
                mario.x -= 1;
                if(typeof map.checkCollision(mario) !== "undefined"){
                    if(map.checkCollision(mario).constructor.name == 'Koopa'){
                        mario.die();
                    }else if(map.checkCollision(mario).constructor.name == 'Peach'){
                        mario.win();
                    }else {
                        mario.x += 1;
                    }
                }
            }
        }

        if(typeof inputs.ArrowRight !== 'undefined'){
            if(inputs.ArrowRight.isPressed == true){
                mario.x += 1;
                if(typeof map.checkCollision(mario) !== "undefined"){
                    if(map.checkCollision(mario).constructor.name == 'Koopa'){
                        mario.die();
                    }else if(map.checkCollision(mario).constructor.name == 'Peach'){
                        mario.win();
                    }else{
                        mario.x -= 1;
                    }
                }
            }
        }
    }
    function moveVertical() {

        if(typeof inputs.ArrowUp !== 'undefined'){
            if(inputs.ArrowUp.isPressed == true){
                if (mario.jumpPower == 0 && mario.fall() == false && mario.jumped == 0){
                    mario.jumpPower = 4;
                    jump.play();
                    mario.jumped=1;
                }
            } else {
                mario.jumped=0;
            }
        }
        mario.makeJump();
        mario.fall();
    }
    this.move = function () {
        moveLateral();
        moveVertical();
    };
    this.win = function () {
        bump.volume = 0;
        bg.pause();
        win.play();
        clearInterval(this.interval);
        Cell.prototype.die.call(this);
        showv();
    };
    this.die = function () {
        bg.pause();
        bump.volume = 0;
        die.play();
        clearInterval(this.interval);
        Cell.prototype.die.call(this);
        showl();
    };
    this.interval = setInterval(function () {
        mario.move();
        mario.update();
    }, 100);
};

var Koopa = function (y, x, image) {
    this.dir = 'r';
    Cell.call(this, y, x, image);
    this.directionLeft = true;
    var koopa = this;
    this.move = function () {
        if (this.dir == 'r') {
            this.x += 1;
            if(typeof map.checkCollision(this) !== "undefined"){
                if(map.checkCollision(this).constructor.name == 'Mario'){
                    map.checkCollision(this).die();
                }else{
                    bump.play();
                    this.x -= 1;
                    this.dir = 'l';
                }
            }
        }
        else if (this.dir == 'l') {
            this.x -= 1;
            if(typeof map.checkCollision(this) !== "undefined"){
                if(map.checkCollision(this).constructor.name == 'Mario'){
                    map.checkCollision(this).die();
                }else {
                    this.x += 1;
                    bump.play();
                    this.dir = 'r';
                }
            }
        }
        this.fall();
    };
    this.fall = function () {
        this.y += 1;
        if(typeof map.checkCollision(this) !== "undefined"){
            if(map.checkCollision(this).constructor.name == 'Mario'){
                map.checkCollision(this).die();
            }else{
                this.y -= 1;
            }
        }
    };
    this.die = function () {
        clearInterval(this.interval);
        Cell.prototype.die.call(this);
    };
    this.interval = setInterval(function () {
        koopa.move();
        koopa.update();
    }, 150);
};

var Map = function (map_path) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", map_path, false);
    xmlHttp.send();
    console.log(xmlHttp.responseText);
    var model = JSON.parse(xmlHttp.responseText);
    this.map = [];
    this.generateMap = function (model) {
        var nb = 1;
        var nbr = 0;
        for (var j = 0; j < model.length; j++) {
            for (var i = 0; i < model[j].length; i++) {
                switch (model[j][i]) {
                    case 'w':
                    this.map[nbr] = new Cell(j, i, 'assets/wall.jpg');
                    break;

                    case 'k':
                    this.map[nbr] = new Koopa(j, i, 'assets/shell.png');
                    break;

                    case 'p':
                    this.map[nbr] = new Peach(j, i, 'assets/peach.png');
                    break;

                    case 'm':
                    this.map[nbr] = new Mario(j, i, 'assets/mario.png');
                    break;

                    default:
                    break;
                }
                nbr++;
            }
            nb++;
        };
    };
    this.generateMap(model);

    this.checkCollision = function (cell) {

        for (m = 0;  m < map.map.length; m++) {
            if(typeof map.map[m] !== "undefined"){
                if(cell.checkCollision(map.map[m]) == true && map.map[m].constructor.name !== cell.constructor.name){
                    return(map.map[m]);
                }
            }
        }
    };
    this.delete = function (cell) {
        for (var i = map.map.length - 1; i>= 0; i--){
            if(map.map[i] === cell){
                map.map[i]=0;
            };
        }
    }
};

var inputs = {};
window.addEventListener("keydown", function (e) {
    e = e || window.event;
    inputs[e.code] = {
        hasBeenPressed: true,
        isPressed: true
    };
});
window.addEventListener("keyup", function (e) {
    e = e || window.event;
    if (typeof inputs[e.code] !== 'undefined') {
        inputs[e.code].isPressed = false;
    }
});
var scale = 40;
var jump = new Audio('assets/jump.mp3');
jump.volume = 0.2;
var win = new Audio('assets/win.mp3');
var die = new Audio('assets/die.mp3');
die.volume = 0.8;
var kick = new Audio('assets/kick.mp3');
var bg = new Audio('assets/mario.mp3');
var bump = new Audio('assets/bump.mp3');
bump.volume = 0.4;
bg.volume = 0.8;
var victory = document.getElementById("victory");
var loose = document.getElementById("loose");
showv = function() {
    victory.style.display = "grid";
}
showl = function() {
    loose.style.display = "grid";
}
bg.play();
var map = new Map('assets/map.json');