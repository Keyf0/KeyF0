import {KFActor} from "../../ACTS/Actor/KFActor";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFEvent} from "../../Core/Misc/KFEventTable";


///KFD(C,CLASS=PIXINetActor,EXTEND=KFActor)
///KFD(P=1,NAME=position,CNAME=位置,TYPE=object,OTYPE=kfVector3,NET=life)
///KFD(P=2,NAME=rotation,CNAME=朝向,TYPE=object,OTYPE=kfVector3,NET=life)

export class PIXINetActor extends KFActor implements PIXIObject
{
    public static Down_Event:KFEvent = new KFEvent("onMouseDown");
    public static UP_Event:KFEvent = new KFEvent("onMouseUp");
    public static MOVE_Event:KFEvent = new KFEvent("onMouseMove");
    public static TICK_Event:KFEvent = new KFEvent("onTick");

    ///KFD(P=3,NAME=velocity,CNAME=当前速度,TYPE=object,OTYPE=kfVector3,NET=life)
    public velocity:{x:number,y:number,z:number};

    ///KFD(P=4,NAME=maxVelocity,CNAME=最大速度,TYPE=num1)
    public maxVelocity:number;

    ///KFD(P=5,NAME=accelerate,CNAME=加速度,TYPE=object,OTYPE=kfVector3,NET=life)
    public accelerate:{x:number,y:number,z:number};

    ///KFD(P=6,NAME=maxAccelerate,CNAME=最大加速度,TYPE=num1)
    public maxAccelerate:number;

    ///KFD(P=7,NAME=eventDown,CNAME=点击事件,TYPE=bool,DEFAULT=false)
    public eventDown:boolean;

    ///KFD(P=8,NAME=eventMove,CNAME=移动事件,TYPE=bool,DEFAULT=false)
    public eventMove:boolean;

    ///KFD(P=9,NAME=eventTick,CNAME=TICK事件,TYPE=int32,DEFAULT=-1)
    public eventTick:number;

    ///KFD(*)

    protected _isdown:boolean;
    protected _dragdata:any;
    protected _ticktime:number;
    protected _tickevt:boolean;

    public getPIXITarget(): PIXI.Container {return this._container;}
    public getPIXIApp(): PIXI.Application {return this._pixiapp;}

    public execSide:number;

    public rpcc_exec:(scriptdata:any)=>any;
    public rpcs_exec:(scriptdata:any)=>any;

    protected _container:PIXI.Container;
    protected _pixiapp:PIXI.Application;
    protected newContainer():PIXI.Container{return null;}

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);

        this.execSide = runtime.execSide;

        this.position = {x:0,y:0,z:0};
        this.rotation = {x:0,y:0,z:0};
        this.velocity = {x:0,y:0,z:0};
        this.accelerate = {x:0,y:0,z:0};

        this.rpcc_exec = this.Exec;
        this.rpcs_exec = this.Exec;
    }

    public Exec(sd:any) {this.runtime.scripts.Execute(sd,this);}

    protected TargetNew(KFBlockTargetData: any): any
    {
        if(this.execSide != BlkExecSide.SERVER)
        {
             if(this._container == null) {
                this._container = this.newContainer();
                let pixiParent = <any>this.parent;
                let pixiobj = <PIXIObject>pixiParent;

                let container = pixiobj.getPIXITarget();
                this._pixiapp = pixiobj.getPIXIApp();

                if (container) {
                    container.addChild(this._container);
                } else {
                    LOG_ERROR("{0}对象不能加入父级{1}"
                        , this.name.toString()
                        , pixiParent.name.toString());
                }
            }
        }
    }

    protected TargetDelete()
    {
          if(this.execSide != BlkExecSide.SERVER)
          {
            let pixiobject = <PIXIObject><any>this.parent;
            let container = pixiobject.getPIXITarget();
            if (container) {
                container.removeChild(this._container);
                this._container.destroy();
                this._container = null;
            }
        }
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        if(this._container && this.eventDown) {
            this._container.interactive = true;
            this._container.on('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
        }

        if(this.eventTick && this.eventTick >= 0){
            this._ticktime = 0;
            this._tickevt = true;
        }
    }

    public DeactiveBLK(): void {

        if(this._container && this.eventDown) {
            this._container.removeListener('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
            this.onMouseUp();
        }

        super.DeactiveBLK();
    }


    public Tick(frameindex: number): void {
        super.Tick(frameindex);
        if(this._tickevt){
            this._ticktime -= this.runtime.fixtpf;
            if(this._ticktime <= 0){
                this._ticktime = this.eventTick;
                this.etable.FireEvent(PIXINetActor.TICK_Event);
            }
        }
    }

    private onMouseDown(event) {

        if(!this._isdown) {

            this._dragdata = event.data;

            this._isdown  = true;
            this._container.on('mouseup', this.onMouseUp, this)
                .on('mouseupoutside', this.onMouseUp, this)
                .on('touchend', this.onMouseUp, this)
                .on('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                this._container.on('mousemove', this.onMouseMove, this)
                    .on('touchmove', this.onMouseMove, this);
            }

            let newpos = this._dragdata.getLocalPosition(this._container);
            newpos.z = 0;
            let devent = PIXINetActor.Down_Event;
            devent.arg = newpos;

            this.etable.FireEvent(devent);
        }
    }

    private onMouseMove(){
        let newpos = this._dragdata.getLocalPosition(this._container);
        newpos.z = 0;
        let devent = PIXINetActor.MOVE_Event;
        devent.arg = newpos;
        this.etable.FireEvent(devent);
    }

    private onMouseUp() {

        if( this._isdown) {

            let newpos = this._dragdata.getLocalPosition(this._container);
            newpos.z = 0;
            this._isdown = false;
            this._dragdata = null;
            this._container.removeListener('mouseup', this.onMouseUp, this)
                .removeListener('mouseupoutside', this.onMouseUp, this)
                .removeListener('touchend', this.onMouseUp, this)
                .removeListener('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                this._container.removeListener('mousemove', this.onMouseMove, this)
                    .removeListener('touchmove', this.onMouseMove, this);
            }

            let devent = PIXINetActor.UP_Event;
            devent.arg = newpos;
            this.etable.FireEvent(devent);
        }
    }

}