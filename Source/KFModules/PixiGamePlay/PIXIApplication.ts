import {HElementActor} from "../Web/HElementActor";
import {PIXIObject} from "./PIXIInterface";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=PIXIApplication,EXTEND=HElementActor)
///KFD(*)

export class PIXIApplication extends HElementActor implements PIXIObject{

    public static Meta:IKFMeta = new IKFMeta("PIXIApplication"
        ,():KFBlockTarget=>{
            return new PIXIApplication();
        }
    );

    public width:number =  800;         // default: 800
    public height:number = 600;        // default: 600
    public antialias:boolean = true;    // default: false
    public transparent:boolean  = false; // default: false
    public resolution:number = 1 ;  // default: 1

    public _target:PIXI.Application = null;

    protected TargetNew(KFBlockTargetData: any): void
    {
        this._target = new PIXI.Application(this);
        let canvas = this._target.view;
        this.target = canvas;
        let parent = <HElementActor>this.parent;

        if(parent) {
            this.document = parent.document;
            parent.target.appendChild(canvas);
        } else {
            document.body.appendChild(canvas);
        }
    }

    protected TargetDelete(): void {
        ///没有父级自己删除掉
        if(!parent) {
            document.body.removeChild(this.target);
        }
        super.TargetDelete();
    }

    public getPIXITarget(): PIXI.Container {
        return this._target ? this._target.stage : null;
    }
}