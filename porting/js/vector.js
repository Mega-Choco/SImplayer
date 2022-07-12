"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VMath = exports.Vector2 = void 0;
var Vector2 = (function () {
    function Vector2(_x, _y) {
        this.x = _x,
            this.y = _y;
    }
    return Vector2;
}());
exports.Vector2 = Vector2;
exports.VMath = {
    AddVector2: function (v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    },
    MinusVector2: function (v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    },
    MultiVector2: function (v, scalar) {
        return new Vector2(v.x * scalar, v.y * scalar);
    },
    Vector2Distance: function (v1, v2) {
        return Math.sqrt(Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2));
    },
    Vector2Magnitude: function (v) {
        return Math.sqrt((Math.pow(v.x, 2) + Math.pow(v.y, 2)));
    },
    Vector2MoveTowards: function (current, target, maxDistanceDelta) {
        var a = this.MinusVector2(target, current);
        var magnitude = this.Vector2Magnitude(a);
        if (magnitude <= maxDistanceDelta || magnitude == 0) {
            return target;
        }
        return this.AddVector2(this.MultiVector2(new Vector2(a.x / magnitude, a.y / magnitude), maxDistanceDelta), current);
    },
    LerpVector2: function (v1, v2, amt) {
        return this.AddVector2(this.MultiVector2(v1, (1 - amt)), this.MultiVector2(v2, amt));
    }
};
