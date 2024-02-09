import * as PIXI from "pixi.js"

const app = new PIXI.Application<HTMLCanvasElement>({ width: 640, height: 360 });
document.body.appendChild(app.view);
