import * as Vector from './vector';

let $canvas;
let context;
let cnt:number = 0;
let assets = {
    
}



export function initialize(){
    $canvas = document.getElementById('canvas');
    context = $canvas.getContext('2d');

}

export function update(deltaTime:number){
    cnt += deltaTime;
    console.log('now delta is : '+cnt);
}

export function draw(){

}
