"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine = require("./engine");
var stop = false;
var frameCount = 0;
var fps;
var fpsInterval;
var startTime;
var now;
var then;
var elapsed;
var deltaNow, deltaPrev;
initialize();
function initialize() {
    fps = 60;
    fpsInterval = fps / 1000;
    start();
}
function start() {
    run();
}
function run() {
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
