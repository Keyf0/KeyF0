import {HElementActor} from "../Web/HElementActor";
import { PIXIMouseEventEmit, PIXIObject} from "./PIXIInterface";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=PIXIApplication,EXTEND=HElementActor)


export class PIXIApplication extends HElementActor implements PIXIObject{

    public static Meta:IKFMeta = new IKFMeta("PIXIApplication"
        ,():KFBlockTarget=>{
            return new PIXIApplication();
        }
    );

    ///KFD(P=1,NAME=width,CNAME=屏幕宽,TYPE=num1,DEFAULT=800)
    public width:number =  800;         // default: 800
    ///KFD(P=2,NAME=height,CNAME=屏幕高,TYPE=num1,DEFAULT=600)
    public height:number = 600;        // default: 600
    ///KFD(P=3,NAME=antialias,CNAME=抗锯齿,TYPE=bool,DEFAULT=true)
    public antialias:boolean = true;    // default: false
    ///KFD(P=4,NAME=transparent,CNAME=透明,TYPE=bool,DEFAULT=false)
    public transparent:boolean  = false; // default: false
    ///KFD(P=5,NAME=resolution,CNAME=分辨率,TYPE=num1,DEFAULT=1)
    public resolution:number = 1 ;  // default: 1
    ///KFD(P=6,NAME=backgroundColor,CNAME=背景颜色,TYPE=uint32,DEFAULT=0)
    public backgroundColor:number = 0x000000;
    ///KFD(P=7,NAME=eventDown,CNAME=点击事件,TYPE=bool,DEFAULT=false)
    public eventDown:boolean;
    ///KFD(P=8,NAME=eventMove,CNAME=移动事件,TYPE=bool,DEFAULT=false)
    public eventMove:boolean;

    ///KFD(*)

    public _target:PIXI.Application = null;

    protected _mEmit:PIXIMouseEventEmit;


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

    public getPIXIApp(): PIXI.Application {
        return this._target;
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        let stage = this.getPIXITarget();
        if(this.eventDown) {
           this._mEmit = new PIXIMouseEventEmit(stage,this.etable,this.eventMove);
        }
    }

    public DeactiveBLK(): void {

        if(this._mEmit) {
            this._mEmit.dispose();
            this._mEmit = null;
        }
        super.DeactiveBLK();
    }
}