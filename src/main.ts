//import * as PIXI from "pixi.js"
import MatterWorld from './MatterWorld'

const init = () => {

    //const app = new PIXI.Application<HTMLCanvasElement>({ width: 640, height: 360 });
    //document.body.appendChild(app.view);
    new MatterWorld('.matter')
}

//document.querySelector('.matter').addEventListener('click', init);
init()

