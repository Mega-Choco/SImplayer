import { Vector2 } from "./vector";

export class Command{
    name:string;
    parameters:(number|string)[];
    constructor(_name:string, _param:(number|string)[]){
        this.name = _name;
        this.parameters = _param
    }
}

export class GameObject{
    name: string;
    image: object; //정확히 뭔타입이지...;;
    position: Vector2;
    layer: number;
    scale: Vector2;
    opacity: number;
    size:Size;
    visible: boolean;
}

type Size = {
    width:number,
    height: number
}

export abstract class Task{
    id: string;
    abstract init():void
    abstract start():void
    abstract update(deltaTime:number):void
    abstract finish():void
}

export class Character{
    name:string; //표시이름
    color:string; //텍스트 컬러 (personal color)
}