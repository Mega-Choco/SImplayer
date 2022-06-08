/////////////////////////Base Class Area//////////////////////////////
class Character {
    constructor(_name,_text,_color) {
        this.name = _name,
        this.text = _text,
        this.color = _color
    }
}

class Task {
    constructor() {
        this.id = "";
    }
    start() {
    }
    update(delta) {
    }
    skip() {
    }
    end() {
        console.log("[ID: " + this.id + "] 태스크가 끝났습니다.");
        this.skip();
        taskManager.disposeTask(this.id);
    }
}

class Vector2 {
    constructor(_x, _y) {
        this.x = parseFloat(_x),
            this.y = parseFloat(_y)
    }
}

//출력용 오브젝트
class GameObject {
    constructor(_image, _pos_X, _pos_Y, _pos_Z, _width, _height) {
        this.image = _image,
            this.position = new Vector2(parseFloat(_pos_X), parseFloat(_pos_Y)),
            this.z_index = _pos_Z,
            this.scale = new Vector2(),
            this.scale.x = 1,
            this.scale.y = 1,
            this.opacity = parseFloat(1),
            this.width = (_width == null || _width == undefined) ? this.image.width : _width,
            this.height = (_height == null || _height == undefined) ? this.image.height : _height,
            this.isVisible = true,
            this.parent = null //부모 오브젝트
    }
    changeImage(source) {
        this.image = source;
        this.width = this.image.width;
        this.height = this.image.height;
    }
    changeVisibility(flag) {
        this.isVisible = flag;
    }
}

class Command {
    constructor(_command, _paramters) {
        this.command = _command,
            this.parameters = _paramters
    }
}

//////////// Math /////////////

//두 Vector2의 덧셈 입니다.
Math.AddVector2 = function (v1, v2) {
    return new Vector2(
        v1.x + v2.x,
        v1.y + v2.y
    );
}

//두 Vector2의 뺄셈입니다.
Math.MinusVector2 = function (v1, v2) {
    return new Vector2(
        v1.x - v2.x,
        v1.y - v2.y
    );
}

//Vector2의 상수의 곱 입니다.
Math.MultiVector2 = function (v, scalar) {
    return new Vector2(
        v.x * scalar,
        v.y * scalar
    );
}

//성능문제가 있을수도?
Math.Vector2Distance = function (a, b) {
    return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
}

//Vector2의 길이를 반환합니다.
Math.Vector2Magnitude = function (v) {
    return Math.sqrt((Math.pow(v.x, 2) + Math.pow(v.y, 2)));
}

//두 좌표간 직선이동입니다.
Math.Vector2MoveTowards = function (current, target, maxDistanceDelta) {
    var a = Math.MinusVector2(target, current);//vector2
    var magnitude = Math.Vector2Magnitude(a);//float
    if (magnitude <= maxDistanceDelta || magnitude == 0) {
        return target;
    }

    return Math.AddVector2(Math.MultiVector2(new Vector2(a.x / magnitude, a.y / magnitude), maxDistanceDelta), current);
}

Math.LerpVector2 = function (v1, v2, amt) {
    return Math.AddVector2(Math.MultiVector2(v1, (1 - amt)), Math.MultiVector2(v2, amt));
}

//////////////////////////////

let defines = new Array();
//선언, 리소스선언용
const defineCommandList = new Map([
    ['char', defineCharacter],
    ['img', defineImage]
]);

//실제 동작용
const CommandList = new Map([
    ['print', print],
    ['show', showImage],
    ['hide', hideImage],
    ['dispose', disposeObject],
    ['fade', fadeObject],
    ['scale', setObjectScale],
    ['move_lerp', lerpMove],
    ['move', moveToward],
    ['bg', setBackground],
    ['bounce', bounceObject],
    ['shake', shakeObject],
    ['set_pos', setObjectPosition]
]);

let scriptHandler = {
    scriptSections: new Array(),
    cursor: 0,
    getNextScriptSection: function () {
        this.cursor += 1;
        return (this.cursor - 1) > this.scriptSections.length ? null : this.scriptSections[this.cursor - 1];
    }
};

let textHandler = {
    speaker: null,
    currentText: "",
    wrapText: function (text, x, y, maxWidth, lineHeight) {
        var words = text.split('');
        var line = '';
        for (var n = 0; n < words.length; n++) {
            var textLine = line + words[n] + '';
            var metrics = ctx.measureText(textLine);
            var textWidth = metrics.width;
            if ((textWidth > maxWidth && n > 0) || words[n] == '\n') {
                ctx.fillText(line, x, y);
                line = words[n] + '';
                if (words[n] == '\n') {
                    line = '';
                }
                y += lineHeight;
            }
            else {
                line = textLine;
            }
        }
        ctx.fillText(line, x, y);
    }
};

/////////////////////////Resource Area/////////////////////////////
let Memory = {
    characters: new Map(),
    images: new Map(),
    objects: new Map(), //Canvas 화면출력용 (GameObject Based)
    task: new Map() //Update Tasks (need Deltatime)
};
let Resource = {};

let dumpedMemory = new Array();

/////////////////////////////////////////

//사용자 지정기준옵션
let option = {};
option.FPS = 60; //게임 프레임 (60이하)
option.width = 720; //기준 스크린 폭(px)
option.height = 1280; // 기준 스크린 높이(px)
option.fontSize = 38;//텍스트 폰트 사이즈
option.nameSize = 24;//이름표시 폰트사이즈
option.canvasDebug = false;//오브젝트 이미지 영역 표시여부(디버깅용)
option.dialogueSpeed = 0.055;

//텍스트영역 설정값
let textBoxSetting = {};
textBoxSetting.width = 680;       //px
textBoxSetting.height = 320;      //px
textBoxSetting.lineHeight = 0;
textBoxSetting.name_xPos = 50;    //px (텍스트상자 내부의 상대위치)
textBoxSetting.name_yPos = 20;    //px (텍스트상자 내부의 상대위치)
textBoxSetting.padding = {};
textBoxSetting.padding.top = 90;  //px
textBoxSetting.padding.left = 75;  //px
textBoxSetting.padding.right = 75;  //px
textBoxSetting.padding.bottom = 20;  //px;
textBoxSetting.margin = {};
textBoxSetting.margin.bottom = 10;   //px


let baseAspectRatio = 0;
let stop = false;
let frameCount = 0;
let $canvas = document.getElementById("canvas");
let $container = document.getElementsByClassName('container');
let consoleRoot = document.getElementById('console');
let ctx;
let fps, fpsInterval, startTime, now, then, elapsed
let deltaNow, deltaPrev;
let originScript = null;
let blockNext = false;
var fontSetting = {
    currentSize: 0,
    fontInfo: "",
    lineHeight: 0
};

var currentCanvasScale = { x: 1, y: 1 };
let textBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    padding_x: 0,
    padding_y: 0
};

function play(sourceUrl) {
    loadScript(sourceUrl);
    init();
}

function init() {
    fps = option.FPS;
    fpsInterval = 1000 / fps;
    $canvas = document.getElementById("canvas");
    $container = document.getElementsByClassName('container');
    consoleRoot = document.getElementById('console');
    ctx = $canvas.getContext("2d");
    ctx.font = "";
    resizeGame();
    translateScript(originScript);
    start();
}

async function start() {
    await preDefines();
    excuteCodeLines();
    console.log(fpsInterval);
    then = Date.now();
    startTime = then;
    prev = then;
    deltaPrev = Date.now();
    loop();
}

function loop() {
    requestAnimationFrame(loop);
    now = Date.now();
    elapsed = now - then;

    var prev = Date.now();
    if (elapsed >= fpsInterval) {
        then = now - (elapsed % fpsInterval);

        var sinceStart = now - startTime;
        var delta = (now - deltaPrev) / 1000;
        deltaPrev = now;
        update(delta);
        draw();
    }
}

function update(delta) {
    if (Memory.task.size === 0 && !blockNext) {
        executeNext();
    }
    taskManager.updateTasks(delta);
}

function draw() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctx.globalAlpha = 1;
    ctx.save();//save canvas status

    Memory.objects.forEach(element => {
        if (element.isVisible) {
            var flipX = element.scale.x >= 0 ? 1 : -1;
            var flipY = element.scale.y >= 0 ? 1 : -1;

            var originalXPosition = element.position.x;
            var originalYPosition = element.position.y;

            var flipedPosition = new Vector2(element.position.x, element.position.y);

            ctx.globalAlpha = element.opacity;

            ctx.scale(flipX, flipY);

            if (flipX == -1) {
                flipedPosition.x = flipedPosition.x - (flipedPosition.x * 2);
            }
            if (flipY == -1) {
                flipedPosition.y = flipedPosition.y - (flipedPosition.y * 2);
            }

            var fixedWidth = element.width * element.scale.x;
            var fixedHeight = element.height * element.scale.y;
            var fixedX = ((flipedPosition.x) - (fixedWidth / 2));
            var fixedY = ((flipedPosition.y) - (fixedHeight / 2));

            ctx.drawImage(
                element.image,
                fixedX * currentCanvasScale.x,
                fixedY * currentCanvasScale.y,
                fixedWidth * currentCanvasScale.x,
                fixedHeight * currentCanvasScale.y
            );

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.stroke();
            ctx.restore();
        }
        ctx.globalAlpha = 1; // 글로벌 알파값은 왜 restore가 안되는거야.
    });

    //Drawing textbox
    var textBoxPos_x = ((option.width / 2) - (textBoxSetting.width / 2));
    var textBoxPos_y = (option.height - textBoxSetting.height - textBoxSetting.margin.bottom);

    ctx.fillStyle = 'rgba(0,0,0,.95)'
    ctx.fillRect(
        textBoxPos_x * currentCanvasScale.x,
        textBoxPos_y * currentCanvasScale.y,
        textBoxSetting.width * currentCanvasScale.x,
        textBoxSetting.height * currentCanvasScale.y
    );

    //Drawing Dialogue Area
    var dialogueAreaPos_x = (textBoxPos_x + textBoxSetting.padding.left)
    var dialogueAreaPos_y = (textBoxPos_y + textBoxSetting.padding.top)

    if (textHandler.speaker != null) {
        ctx.fillStyle = textHandler.speaker.color;
        //Drawing Name on Textbox area
        ctx.fillText(textHandler.speaker.text,
            (textBoxPos_x + textBoxSetting.name_xPos) * currentCanvasScale.x,
            ((textBoxPos_y + textBoxSetting.name_yPos) * currentCanvasScale.y) + fontSetting.currentSize);

    }

    ctx.fillStyle = 'white';
    //Drawing Dialogue text
    ctx.font = fontSetting.fontInfo;
    textHandler.wrapText(textHandler.currentText,
        dialogueAreaPos_x * currentCanvasScale.x,
        ((dialogueAreaPos_y) * currentCanvasScale.y) + fontSetting.currentSize,
        (textBoxSetting.width - textBoxSetting.padding.left - textBoxSetting.padding.right) * currentCanvasScale.x,
        fontSetting.lineHeight
    );
    ctx.stroke();
}

//////////////// Resizing canvas //////////////////
var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
};

function calculateFontSize() {
    var ratio = option.fontSize / option.width;   // calc ratio
    var size = $canvas.width * ratio;
    fontSetting.currentSize = (size | 0);   // get font size based on current width
    fontSetting.lineHeight = ((option.fontSize + textBoxSetting.lineHeight) / option.width) * $canvas.width;
    fontSetting.fontInfo = fontSetting.currentSize + 'px NanumBarunGothic'; // set font
}

function gcd(a, b) {
    return (b == 0) ? a : gcd(b, a % b);
}

//고정 화면비 캔버스 크기조절
function resizeGame() {
    var ratio = gcd(option.width, option.height);

    var widthToHeight = (option.width / ratio) / (option.height / ratio);
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        $canvas.style.height = newHeight + 'px';
        $canvas.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        $canvas.style.width = newWidth + 'px';
        $canvas.style.height = newHeight + 'px';
    }

    $canvas.style.marginTop = (-newHeight / 2) + 'px';
    $canvas.style.marginLeft = (-newWidth / 2) + 'px';
    $canvas.width = newWidth * 2;
    $canvas.height = newHeight * 2;
    currentCanvasScale.x = parseFloat($canvas.width / option.width).toFixed(3);
    currentCanvasScale.y = parseFloat($canvas.height / option.height).toFixed(3);

    calculateFontSize();
}

function initializeCanvasSize() {
    $canvas.width = option.width;
    $canvas.height = option.height;
    baseAspectRatio = option.width / option.height;
}

window.onresize = function () {
    clearTimeout(resizeGame());
    doit = setTimeout(function () {
        resizeGame();
    }, 100);
};

function convertPercentagePosition(_x, _y) {
    if (CheckPercentageNumber(_x)) {
        _x = _x.replace('%', '');
    }
    if (CheckPercentageNumber(_y)) {
        _y = _y.replace('%', '');
    }
    return {
        x: (option.width / 100) * _x,
        y: (option.height / 100) * _y
    };
}

function settingTextbox(y_pos, padding_x, padding_y) {
    textBox.x = 0;
    textBox.y = convertPercentagePosition(0, y_pos).y;
    textBox.width = $canvas.width;
    textBox.height = convertPercentagePosition(0, 100 - y_pos).y,
        textBox.padding_x = (textBox.width / 100) * 3,
        textBox.padding_y = (textBox.height / 100) * 5
}

function initializeScreen() {

}
///////////////////////DebugTool Area//////////////////////////////

function debugPrinter(text) {
    var log = document.createElement('p');
    log.innerHTML = text;
    //  consoleRoot.appendChild(log);
}

document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        if (Memory.task.size != 0) {
            taskManager.skipTasks();
            return;
        }
        blockNext = false;
    }
    if (event.code == 'D') {
        dumpMemory();
    }
    if (event.code == 'Q') {
        console.log("캔버스 디버그 활성화");
        option.debugPrinter = !option.debugPrinter;
    }
})

document.addEventListener("touchstart", event => {
    if (Memory.task.size != 0) {
        taskManager.skipTasks();
        return;
    }
    blockNext = false;
}, true);

function dumpMemory() {
    var dump = Memory;
    dumpedMemory.push(dump);
}
///////////////////////Tool Area/////////////////////////////
function CheckPercentageNumber(number) {
    const percentageRegex = /([0-9]+)(\.?[0-9]+)?%/;
    if (typeof number === 'string') {
        return percentageRegex.test(number.toString());
    }
    return false;
}

//태스크 관리 (여길 통해서 등록하고 관리합시다.)
let taskManager = {};
//태스크 등록
taskManager.registTask = function (_task) {
    //고유 태스크 ID 생성하기
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    _task.id = result;
    _task.start();
    Memory.task.set(result, _task);
}
//태스크 업데이트
taskManager.updateTasks = function (delta) {
    Memory.task.forEach(task => {
        task.update(delta);
    });
}
//태스크 일괄스킵
taskManager.skipTasks = function () {
    Memory.task.forEach(task => {
        task.end();
    });
}
//태스크 해제
taskManager.disposeTask = function (id) {
    Memory.task.delete(id);
}

///////////////////////Commands Area/////////////////////////
function executeNext() {
    excuteCodeLines();
}

function defineCharacter(name, text,  personalColor) {
    Memory.characters.set(name.replace(" ", ""), new Character(name, (text == null ? name : text) ,personalColor));
}

async function defineImage(name, sourceUrl) {
    await loadingImage(sourceUrl).then(img => Memory.images.set(name.replace(" ", ""), img));
}

async function loadingImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.addEventListener('load', e => resolve(img));
        img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${sourceUrl}`));
        });
        img.src = src;
    });
}

function print(name, text, cycleTime) {
    var speaker = Memory.characters.get(name);

    if (cycleTime == null) {
        cycleTime = option.dialogueSpeed;
    }

    textHandler.speaker = speaker;
    blockNext = true;

    var task = new Task();
    console.warn(text);
    task.originText = (text.replace(/^\"|\"$/g, "")).replace(/\\n/g, '\n');
    console.warn(task.originText);
    task.cycleTime = parseFloat(cycleTime);
    task.timeStore = 0;
    task.cursor = 1;

    task.update = function (delta) {
        this.timeStore += delta;

        if (this.timeStore >= this.cycleTime) {
            this.cursor += parseInt(this.timeStore / this.cycleTime);

            if (this.cursor >= this.originText.length) {
                this.end();
            }
            this.timeStore = 0;
        }
        textHandler.currentText = this.originText.slice(0, this.cursor);
    }
    task.skip = function () {
        textHandler.currentText = this.originText;
    }

    taskManager.registTask(task);
}

function showImage(name, imageName, pos_x, pos_y, pos_z) {

    var already = Memory.objects.get(name);
    var img = Memory.images.get(imageName);
    var percentageRegex = /([0-9]+)(\.?[0-9]+)?%/;

    pos_x = pos_x == null ? null :
        percentageRegex.test(pos_x) == true ? convertPercentagePosition(parseFloat(pos_x.replace('%', '')), 0).x : pos_x;

    pos_y = pos_y == null ? null :
        percentageRegex.test(pos_y) == true ? convertPercentagePosition(0, parseFloat(pos_y.replace('%', ''))).y : pos_y;


    if (img == null) {
        console.error("[" + imageName + "] 이미지는 존재하지 않습니다.");
        return;
    }

    var targetObj = already;

    if (already == null) {
        targetObj = new GameObject(img, pos_x, pos_y, pos_z == null ? 1 : parseInt(pos_z));
        Memory.objects.set(name, targetObj);
    }
    else {
        var newPosition = new Vector2();
        newPosition.x = pos_x == null ? targetObj.position.x : parseFloat(pos_x);
        newPosition.y = pos_y == null ? targetObj.position.y : parseFloat(pos_y);

        targetObj.position = newPosition;
        targetObj.z_index = pos_z == null ? targetObj.z_index : parseInt(pos_z);
        targetObj.changeImage(img);
    }
    return;
}


function setObjectPosition(name, pos_x, pos_y, pos_z) {
    let target = Memory.objects.get(name);

    pos_x = pos_x == null ? target.position.x : pos_x;
    pos_y = pos_y == null ? target.position.y : pos_y;
    pos_z = pos_z == null ? target.z_index : pos_z;

    target.position.x = pos_x;
    target.position.y = pos_y;
    target.z_index = pos_z;

    return;
}
function hideImage(name) {
    Memory.objects.get(name).changeVisibility(false);
}

function disposeObject(name) {
    debugPrinter("dispose Object on memory (name:" + name + ")");
    try{
        Memory.objects.delete(name);
    }
    catch(exception){
        console.log("해당 오브젝트가 메모리에 없습니다.");
    }
}

function fadeObject(name, start, to, time) {

    var task = new Task();
    task.targetObj = null;
    task.startOpt = null;
    task.endOpt = null;
    task.speed = null;
    task.start = function () {
        task.targetObj = Memory.objects.get(name);
        task.startOpt = start == null ? parseFloat(this.targetObj.opacity) : parseFloat(start);
        task.endOpt = parseFloat(to);

        task.targetObj.opacity = this.startOpt;
        task.speed = (this.startOpt > this.endOpt ? this.startOpt - this.endOpt : this.endOpt - this.startOpt) * (this.startOpt > this.endOpt ? -1 : 1) / parseFloat(time);
    }
    task.update = function (delta) {

        this.targetObj.opacity += this.speed * delta;
        if (this.startOpt <= this.endOpt) {
            if (this.targetObj.opacity >= this.endOpt) {
                this.end();
            }
        } else {
            if (this.targetObj.opacity <= this.endOpt) {
                this.end();
            }
        }
    }
    task.skip = function () {
        this.targetObj.opacity = this.endOpt;
    }
    taskManager.registTask(task);
}
function setBackground(imageName) {
    showImage('BG', imageName, '50%', '50%', 0);
    return;
    //var centerPos = convertPercentagePosition(50, 50);
    ////var bgObject = new GameObject(Memory.images.get(imageName),
    ////    centerPos.x, centerPos.y, 1, option.width, option.height);
    ////bgObject.z_index = 0;
    //Memory.objects.set('BG', bgObject);
}
function setObjectScale(name, scale_x, sacle_y) {
    var target = Memory.objects.get(name);
    if (target == null) {
        console.error("스케일을 변경할 오브젝트가 메모리에 존재하지않습니다.");
        return;
    }
    target.scale.x = parseFloat(scale_x);
    target.scale.y = parseFloat(sacle_y);
}

//일반이동
function moveToward(name, target_x, target_y, time) {
    var task = new Task();
    task.targetObj = null;
    task.target_pos = {};
    task.target_pos.x = null;
    task.target_pos.y = null;
    task.time = null;
    task.speed = 0;
    task.start = function () {
        this.targetObj = Memory.objects.get(name);
        this.target_pos.x = target_x == null ? this.targetObj.position.x : parseFloat(CheckPercentageNumber(target_x) ? convertPercentagePosition(target_x, 0).x : target_x);
        this.target_pos.y = target_y == null ? this.targetObj.position.y : parseFloat(CheckPercentageNumber(target_y) ? convertPercentagePosition(0, target_y).y : target_y);
        this.time = parseFloat(time);
        this.speed = Math.Vector2Distance(this.targetObj.position, this.target_pos) / this.time;
    }
    task.update = function (delta) {
        var newPos = Math.Vector2MoveTowards(new Vector2(this.targetObj.position.x, this.targetObj.position.y), this.target_pos, this.speed * delta);
        this.targetObj.position.x = newPos.x;
        this.targetObj.position.y = newPos.y;
        if (newPos == this.target_pos) {
            console.log("MoveToward 연산종료");
            this.end();
        }
    }
    task.skip = function () {
        this.targetObj.position.x = this.target_pos.x;
        this.targetObj.position.y = this.target_pos.y;
    }
    taskManager.registTask(task);
}

function easeOut(time, x) {
    return time - (time - x) * (time - x);
}

function easeIn(time, x) {

}


function moveEase(name, target_x, target_y, time, type) {

    var task = new Task();
    task.targetObj = null;
    task.target_pos = {};
    task.target_pos.x = null;
    task.target_pos.y = null;
    task.time = time;
    task.durationStore = 0;
    task.speed = 100;
    if (type == "In") {
        task.start = function () {
            this.targetObj = Memory.objects.get(name);
            this.target_pos.x = parseFloat(CheckPercentageNumber(target_x) ? convertPercentagePosition(target_x, 0).x : target_x);
            this.target_pos.y = parseFloat(CheckPercentageNumber(target_y) ? convertPercentagePosition(0, target_y).y : target_y);
        }
        task.update = function (delta) {
            this.durationStore += delta;

            console.log(easeOut(this.time, this.durationStore).toFixed(1));
            // this.durationStore += delta;
            // var durationPercentage = this.durationStore / time;
            // console.log(durationPercentage);

            // var newPos = Math.Vector2MoveTowards(new Vector2(
            //     this.targetObj.position.x,
            //     this.targetObj.position.y),
            //     this.target_pos, easeOut(durationPercentage) * delta);

            // this.targetObj.position.x = newPos.x;
            // this.targetObj.position.y = newPos.y;
            // if (newPos == this.target_pos) {
            //     console.log("연산종료");
            //     this.end();
            // }
        }
        task.skip = function () {
            this.targetObj.position.x = this.target_pos.x;
            this.targetObj.position.y = this.target_pos.y;
        }
        taskManager.registTask(task);
    }

}


//선형보간 이동
function lerpMove(name, target_x, target_y, speed) {
    var task = new Task();
    task.targetObj = null;
    task.target_pos = {};
    task.target_pos.x = null;
    task.target_pos.y = null;
    task.speed = null;
    task.start = function () {
        task.targetObj = Memory.objects.get(name);
        task.target_pos.x = parseFloat(CheckPercentageNumber(target_x) ? convertPercentagePosition(target_x, 0).x : target_x);
        task.target_pos.y = parseFloat(CheckPercentageNumber(target_y) ? convertPercentagePosition(0, target_y).y : target_y)
        task.speed = parseInt(speed);
    }

    task.update = function (delta) {

        if (this.targetObj.position == this.target_pos) {
            console.log("lerp Move 종료");
            this.end();
        }

        var newPos = Math.LerpVector2(this.targetObj.position, this.target_pos, this.speed * delta);
        if (this.targetObj.position.x != this.target_pos.x) {
            if (Math.abs((Math.abs(this.targetObj.position.x) - Math.abs(this.target_pos.x))) <= 1) {
                this.targetObj.position.x = this.target_pos.x;
                console.log("x 증가 끝");
            } else {
                this.targetObj.position.x = newPos.x;
            }
        }

        if (this.targetObj.position.y != this.target_pos.y) {
            if (Math.abs((Math.abs(this.targetObj.position.y) - Math.abs(this.target_pos.y))) <= 1) {
                this.targetObj.position.y = this.target_pos.y;

            } else {

                this.targetObj.position.y = newPos.y;
            }
        }

    }
    task.skip = function () {
        this.targetObj.position.x = this.target_pos.x;
        this.targetObj.position.y = this.target_pos.y;
    }

    taskManager.registTask(task);
}

//오브젝트 바운스 (example suprise) bouncing by sin curve
function bounceObject(name, height, speed, duration) {
    var task = new Task();
    task.targetObject = null;
    task.targetHeight = null;
    task.startPosition_y = null;
    task.speed = null;
    task.duration = null;
    task.durationStore = null;
    task.direction = null;
    task.timeStore = null;

    task.start = function () {
        this.targetObject = Memory.objects.get(name);
        this.targetHeight = parseFloat(height);
        this.startPosition_y = parseFloat(this.targetObject.position.y);
        this.speed = parseInt(speed);
        this.duration = duration;
        this.durationStore = 0;
        this.timeStore = 0;
        this.direction = this.targetHeight / Math.abs(this.targetHeight); // -1 is up, 1 is down
    }
    task.update = function (delta) {
        var time = delta * this.speed;
        this.timeStore += time;
        var inc = Math.sin(this.timeStore) * this.targetHeight;
        var detecting = Math.abs(inc);
        this.targetObject.position.y = this.startPosition_y + inc;

        if (this.direction == -1 ? inc >= 0 : inc <= 0) {
            this.timeStore = 0;
            this.targetObject.position.y = this.startPosition_y;
            this.durationStore += 1;
            if (this.duration <= this.durationStore) {
                this.end();
            }
        }
    }
    task.skip = function () {
        this.targetObject.position.y = this.startPosition_y;
    }
    taskManager.registTask(task);
}

//오브젝트를 좌우로 흔듭니다.
function shakeObject(name, distance, speed, duration) {
    var task = new Task();
    task.targetObject = null;
    task.distance = null;
    task.startX = null;
    task.speed = null;
    task.duration = null;
    task.durationStore = null;
    task.direction = null;
    task.timeStore = null;

    task.start = function () {
        this.targetObject = Memory.objects.get(name);
        this.distance = parseFloat(distance);
        this.startX = parseFloat(this.targetObject.position.x);
        this.speed = parseInt(speed);
        this.duration = duration;
        this.durationStore = 0;
        this.timeStore = 0;
        this.direction = this.distance / Math.abs(this.distance); // -1 is left, 1 is right
    }
    task.update = function (delta) {
        var time = delta * this.speed;
        this.timeStore += time;
        var inc = Math.sin(this.timeStore) * this.distance;
        var detecting = Math.abs(inc);
        this.targetObject.position.x = this.startX + inc;

        if (this.direction == -1 ? inc >= 0 : inc <= 0) {
            this.direction *= -1;
            this.durationStore += 1;
            if (this.duration * 2 <= this.durationStore) {
                this.end();
            }
        }
    }
    task.skip = function () {
        this.targetObject.position.x = this.startX;
    }
    taskManager.registTask(task);
}

function zoomObject(name, startScale, endScale, speed) {
    var task = new Task();
    task.targetObject = null;
    task.startScale = null;
    task.endScale = null;
    task.speed = null;

    task.start = function () {
        this.targetObject = Memory.objects.get(name);
        this.startScale = parseFloat(startScale);
        this.endScale = parseFloat(endScale);
        this.speed = parseFloat(speed);
    }

    task.update = function (delta) {
    }
    task.skip = function () {
        this.targetObject.scale = this.endScale
    }
}
/////////////////////////Translator Area///////////////////////////////////////////////////////
function loadScript(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                originScript = allText;
            }
        }
    }
    rawFile.send(null);
}

function translateScript(originCode) {
    var codeSections = originCode.split(/\n\n|\r\n\r\n/);
    codeSections.forEach(eachSection => {
        var splitedCodeLine = eachSection.split(/\n|\r\n/);
        var eachCommand = new Array();
        var codeLines = new Array();
        splitedCodeLine.forEach(eachLine => {
            var paramRegex = /\((.*)\)/;
            console.log(eachLine);
            if (eachLine.length <= 0) {
                console.log('its empty string');
                return;
            }
            var parameterSet = paramRegex.exec(eachLine)[1];
            let parameters = parameterSet.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
            var command = eachLine.replace(paramRegex, "");
            var trimedParameters = parameters => parameters.map(element => {if(element == null || element == 'null'){return null;} element = element.trim(); if(element === ""){return null;} return element});
            var codeLineObj = new Command(command.trim().toLowerCase(), trimedParameters(parameters));
            if (defineCommandList.has(codeLineObj.command)) {
                defines.push(codeLineObj);
            }
            else {
                codeLines.push(codeLineObj);
            }
        });
        scriptHandler.scriptSections.push(codeLines);

    });
    console.log("Structing Command Complete");
}

function excuteCodeLines() {
    var codeLines = scriptHandler.getNextScriptSection();
    if (codeLines == null) {
        //window.close();
        return;
    }
    codeLines.forEach(codeLine => {
        var command = CommandList.get(codeLine.command);
        if (command == null) {
            console.error("[" + codeLine.command + "]는 지원하지 않는 명령어 입니다.");
        }
        var excute = command.apply.bind(command, null, codeLine.parameters);
        excute();
    });
}

async function preDefines() {
    let imgCommands = new Array();
    let trimedParameters = parameters => parameters.map(element =>  {if(element == null){return null;} element = element.trim(); if (element == 'null') { element = null } return element; });
    defines.forEach(define => {
        var command = defineCommandList.get(define.command);
        define.parameters = trimedParameters(define.parameters);
        if (command == defineImage) {
            imgCommands.push(define);
            return;
        }
        if (command == null) {
            console.error("[" + define.command + "]는 지원하지 않는 명령어 입니다.");
        }
        var excute = command.apply.bind(command, null, define.parameters);
        excute();
    });
    await preloadingImages(imgCommands);
}

async function preloadingImages(imgList) {
    for (var i = 0; i < imgList.length; i++) {
        await defineImage(imgList[i].parameters[0], imgList[i].parameters[1]);
    }
}