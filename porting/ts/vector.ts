export class Vector2 {
    x: number;
    y: number;

    constructor(_x: number, _y: number) {
        this.x = _x,
            this.y = _y
    }
}

export const VMath = {

    //두 Vector2의 덧셈 입니다.
    AddVector2(v1: Vector2, v2: Vector2) {
        return new Vector2(
            v1.x + v2.x,
            v1.y + v2.y
        );
    },

    //두 Vector2의 뺄셈입니다.
    MinusVector2(v1: Vector2, v2: Vector2) {
        return new Vector2(
            v1.x - v2.x,
            v1.y - v2.y
        );
    },

    //Vector2의 상수의 곱 입니다.
    MultiVector2(v: Vector2, scalar: number) {
        return new Vector2(
            v.x * scalar,
            v.y * scalar
        );
    },

    Vector2Distance(v1: Vector2, v2: Vector2) {
        return Math.sqrt(Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2));
    },

    //Vector2의 길이를 반환합니다.
    Vector2Magnitude(v: Vector2) {
        return Math.sqrt((Math.pow(v.x, 2) + Math.pow(v.y, 2)));
    },

    //두 좌표간 직선이동입니다.
    Vector2MoveTowards(current: Vector2, target: Vector2, maxDistanceDelta: number) {
        var a = this.MinusVector2(target, current);//vector2
        var magnitude = this.Vector2Magnitude(a);//float
        if (magnitude <= maxDistanceDelta || magnitude == 0) {
            return target;
        }

        return this.AddVector2(this.MultiVector2(new Vector2(a.x / magnitude, a.y / magnitude), maxDistanceDelta), current);
    },

    LerpVector2(v1: Vector2, v2: Vector2, amt: number) {
        return this.AddVector2(this.MultiVector2(v1, (1 - amt)), this.MultiVector2(v2, amt));
    }

}
