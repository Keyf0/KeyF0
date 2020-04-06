import {KFActor} from "../../ACTS/Actor/KFActor";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";


///KFD(C,CLASS=PIXINetActor,EXTEND=KFActor)
///KFD(P=1,NAME=position,CNAME=位置,TYPE=object,OTYPE=kfVector3,NET=life)
///KFD(P=2,NAME=rotation,CNAME=朝向,TYPE=object,OTYPE=kfVector3,NET=life)

export class PIXINetActor extends KFActor implements PIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("PIXINetActor"
        ,():KFBlockTarget=>{
            return new PIXINetActor();
        }
    );

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

    ///KFD(P=10,NAME=autoStateID,CNAME=进入状态,TYPE=int32,DEFAULT=-1)
    public autoStateID:number;

    ///KFD(P=11,NAME=bGraphic,CNAME=图形模式,TYPE=bool,DEFAULT=false)
    public bGraphic:boolean;

    ///KFD(P=12,NAME=lifeTime,CNAME=生命周期,TYPE=int32,DEFAULT=-1)
    public lifeTime:number;

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
    protected _display:number;

    protected newContainer():PIXI.Container
    {
        return new PIXI.Container();
    }

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);

        this.execSide = runtime.execSide;

        this.position = {x:0,y:0,z:0};
        this.rotation = {z:0};
        this.scale = {x:1,y:1,z:1};
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

                //let test = new PIXI.Graphics();
                //test.beginFill(0x00ff00);
                //test.drawCircle(0,0,5);
                //test.endFill();
                //this._container.addChild(test);

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

        if(this.eventTick && this.eventTick >= 0) {
            this._ticktime = 0;
            this._tickevt = true;
        }

        ///填写了自动进入则自动进入
        if(!isNaN(this.autoStateID)) {
           if(this.bGraphic) {
               ///如果是图形区动不应该去播动画
               this.timeline.SetState(this.autoStateID);
           }else
               {
               this.timeline.Play(this.autoStateID);
           }
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
        if(this._tickevt) {
            this._ticktime -= this.runtime.fixtpf;
            if(this._ticktime <= 0) {
                this._ticktime = this.eventTick;
                this.etable.FireEvent(PIXINetActor.TICK_Event);
            }
        }

        if(this.lifeTime != undefined && this.lifeTime > 0) {
            this.lifeTime -= this.runtime.fixtpf;
            if(this.lifeTime <= 0){
                this.Destory();
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

    public set_position(v3?: { x: number; y: number; z?: number }){
        if(!v3)v3 = this.position;
        if(this._container){
            this._container.setTransform(v3.x,v3.y);
        }
    }

    public set_rotation(v3?: { x?: number; y?: number; z: number }) {
        if(!v3)v3 = this.rotation;
        if(this._container){
            this._container.rotation = v3.z;
        }
    }

    public set_scale(v3?: { x: number; y: number; z?: number }) {
        if(!v3)v3 = this.scale;
        if(this._container) {
            let scale = this._container.scale;
            scale.x = v3.x;
            scale.y = v3.y;
        }
    }

    public get visible() {return this._container.visible;}
    public set visible(v:boolean)
    {
        this._container.visible = v;
        ///不显示就不需要TICK了吧
        this.tickable = v;
    }
    public get display():number {return this._display;}
    public set display(v:number){
        if(this._display != v) {

            if(this._display == -1){
                this.visible = true;
            }else if(v == -1){
                this.visible = false;
            }
            this._display = v;
            if(this.bGraphic && v != -1) {
                this.timeline.DisplayFrame(v);
            }
        }
    }
    public set_datas(datas: number[]) {

        if(!datas)return;

        let pos = this.position;

        pos.x = datas[0];
        pos.y = datas[1];
        pos.z = datas[2];

        this.rotation.z = datas[3];
        this.scale.x = datas[4];
        this.scale.y = datas[5];
        this.scale.z = datas[6];

        this._container.setTransform(datas[0],datas[1]
            ,datas[4],datas[5],datas[3]
            ,datas[7],datas[8]);

        if(datas.length > 9){
            ///color add
            let filters = this._container.filters;
            if(!filters) {
                filters = [new PIXI.filters.ColorMatrixFilter()];
                this._container.filters = filters;
            }

            let cmtr = <PIXI.filters.ColorMatrixFilter>filters[0];
            let orgmul = datas[9]

            cmtr.matrix[0] = orgmul;
            cmtr.matrix[4] = datas[10];
            cmtr.matrix[6] = orgmul;
            cmtr.matrix[9] = datas[11];
            cmtr.matrix[12] = orgmul;
            cmtr.matrix[14] = datas[12];
        }
    }
}