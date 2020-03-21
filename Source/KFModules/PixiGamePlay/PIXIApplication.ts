import {HElementActor} from "../Web/HElementActor";
import * as PIXI from "pixi.js"
import {PIXIObject} from "./PIXIInterface";

export class PIXIApplication extends HElementActor implements PIXIObject{

    public width:number =  800;         // default: 800
    public height:number = 600;        // default: 600
    public antialias:boolean = true;    // default: false
    public transparent:boolean  = false; // default: false
    public resolution:number = 1 ;  // default: 1

    public _target:PIXI.Application = null;

    public CreateHtml(): void {
        super.CreateHtml();
        this._target = new PIXI.Application(this);
        let canvas = this._target.view;
        this.target = canvas;
        let parent = <HElementActor>this.parent;
        parent.target.appendChild(canvas);
    }

    public getPIXITarget(): PIXI.Container {
        return this._target ? this._target.stage : null;
    }
}