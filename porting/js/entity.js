"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = exports.Task = exports.GameObject = exports.Command = void 0;
var Command = (function () {
    function Command(_name, _param) {
        this.name = _name;
        this.parameters = _param;
    }
    return Command;
}());
exports.Command = Command;
var GameObject = (function () {
    function GameObject() {
    }
    return GameObject;
}());
exports.GameObject = GameObject;
var Task = (function () {
    function Task() {
    }
    return Task;
}());
exports.Task = Task;
var Character = (function () {
    function Character() {
    }
    return Character;
}());
exports.Character = Character;
