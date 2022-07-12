"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draw = exports.update = exports.initialize = void 0;
var $canvas;
var context;
var cnt = 0;
var assets = {};
function initialize() {
    $canvas = document.getElementById('canvas');
    context = $canvas.getContext('2d');
}
exports.initialize = initialize;
function update(deltaTime) {
    cnt += deltaTime;
    console.log('now delta is : ' + cnt);
}
exports.update = update;
function draw() {
}
exports.draw = draw;
