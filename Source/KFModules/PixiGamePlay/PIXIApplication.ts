import {HElementActor} from "../Web/HElementActor";
import {PIXIObject} from "./PIXIInterface";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {PIXINetActor} from "./PIXINetActor";

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

    protected _isdown:boolean;
    protected _dragdata:any;


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
        if(stage && this.eventDown) {
            stage.interactive = true;
            stage.on('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
        }
    }

    public DeactiveBLK(): void {

        let stage = this.getPIXITarget();
        if(stage && this.eventDown) {
            stage.removeListener('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
            this.onMouseUp();
        }

        super.DeactiveBLK();
    }


    private onMouseDown(event) {

        if(!this._isdown) {

            this._dragdata = event.data;

            this._isdown  = true;
            let stage = this.getPIXITarget();

            stage.on('mouseup', this.onMouseUp, this)
                .on('mouseupoutside', this.onMouseUp, this)
                .on('touchend', this.onMouseUp, this)
                .on('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                stage.on('mousemove', this.onMouseMove, this)
                    .on('touchmove', this.onMouseMove, this);
            }

            let newpos = this._dragdata.getLocalPosition(stage);
            newpos.z = 0;
            let devent = PIXINetActor.Down_Event;
            devent.arg = newpos;

            this.etable.FireEvent(devent);
        }
    }

    private onMouseMove(){
        let stage = this.getPIXITarget();

        let newpos = this._dragdata.getLocalPosition(stage);
        newpos.z = 0;
        let devent = PIXINetActor.MOVE_Event;
        devent.arg = newpos;
        this.etable.FireEvent(devent);
    }

    private onMouseUp() {

        if( this._isdown) {

            let stage = this.getPIXITarget();

            let newpos = this._dragdata.getLocalPosition(stage);
            newpos.z = 0;
            this._isdown = false;
            this._dragdata = null;
            stage.removeListener('mouseup', this.onMouseUp, this)
                .removeListener('mouseupoutside', this.onMouseUp, this)
                .removeListener('touchend', this.onMouseUp, this)
                .removeListener('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                stage.removeListener('mousemove', this.onMouseMove, this)
                    .removeListener('touchmove', this.onMouseMove, this);
            }

            let devent = PIXINetActor.UP_Event;
            devent.arg = newpos;
            this.etable.FireEvent(devent);
        }
    }
}