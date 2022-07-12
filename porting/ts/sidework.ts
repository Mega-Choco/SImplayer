import * as Engine from './engine';

let stop:boolean = false;
let frameCount:number = 0;
let fps:number;
let fpsInterval:number;
let startTime:number;
let now:number;
let then:number;
let elapsed:number;
let deltaNow:number, deltaPrev:number;
initialize();

function initialize(){
    fps = 60;
    fpsInterval = fps/1000;
    start();
}

function start(){
 run();   
}

function run(){
    window.requestAnimationFrame(run);
    now = Date.now();
    elapsed = now - then;

    var prev = Date.now();
    if (elapsed >= fpsInterval) {
        then = now - (elapsed % fpsInterval);
        var sinceStart = now - startTime;
        var delta = (now - deltaPrev) / 1000;
        deltaPrev = now;
        Engine.update(delta);
        Engine.draw();
    }
}

