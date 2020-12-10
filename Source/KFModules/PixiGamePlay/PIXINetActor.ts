import {KFActor} from "../../ACTS/Actor/KFActor";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {
    PIXIMouseEventEmit,
    PIXIObject,
    PIXITICK_Event
} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {kfVector3} from "../../ACTS/Script/Global/GlobalScripts";
import {PhyDef, Phy_Name, PhyObject, PhyScene} from "../Physics/PhysicsTypes";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";


///KFD(C,CLASS=PIXINetActor,EXTEND=KFActor,EDITCLASS=EditPIXIMovieClip)
///KFD(P=1,NAME=position,CNAME=位置,TYPE=object,OTYPE=kfVector3,NET=life)
///KFD(P=2,NAME=rotation,CNAME=朝向,TYPE=object,OTYPE=kfVector3,NET=life)

export class PIXINetActor extends KFActor implements PIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("PIXINetActor"
        ,():KFBlockTarget=>{
            return new PIXINetActor();
        }
    );

    ///KFD(P=3,NAME=velocity,CNAME=当前速度,TYPE=object,OTYPE=kfVector3)
    public velocity:kfVector3;

    ///KFD(P=4,NAME=maxVelocity,CNAME=最大速度,TYPE=num1,NET=life)
    public maxVelocity:number;

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

    ///KFD(P=13,NAME=phydef,CNAME=物理设置,TYPE=object,OTYPE=PhyDef)
    public phydef:PhyDef;

    ///KFD(*)

    protected _ticktime:number;
    protected _tickevt:boolean;

    public getPIXITarget(): PIXI.Container {return this._container;}
    public getPIXIApp(): PIXI.Application {return this._pixiapp;}

    public phyobj:PhyObject;

    protected _container:PIXI.Container;
    protected _pixiapp:PIXI.Application;
    protected _display:number;
    protected _mEmit:PIXIMouseEventEmit;

    protected newContainer():PIXI.Container
    {
        return new PIXI.Container();
    }

    public Construct(metadata: any, runtime: IKFRuntime, initBytes?:KFByteArray) {
        super.Construct(metadata, runtime, initBytes);

        if(!this.position)
            this.position = new kfVector3();
        if(!this.rotation)
            this.rotation = new kfVector3();
        if(!this.scale)
            this.scale = new kfVector3(1,1,1);
        if(!this.velocity)
            this.velocity = new kfVector3();


    }


    protected TargetNew(KFBlockTargetData: any): any
    {
        if(this.runtime.execSide != BlkExecSide.SERVER)
        {
             if(this._container == null) {
                this._container = this.newContainer();



                     //let test = new PIXI.Graphics();
                     //test.beginFill(0x00ff00);
                     //test.drawCircle(0,0,50);
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
          if(this.runtime.execSide != BlkExecSide.SERVER)
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

    protected PhyNew()
    {
        let sys:PhyScene = this.runtime.systems[Phy_Name.value];
        if(sys) {
            let phydef:PhyDef = this.phydef;
            let phyobj: PhyObject = sys.CreateObject(phydef,this.position);
            phyobj.target = this;
            if(phydef.sim) {
                phydef.updateTF = this.phy_update.bind(this);
                if(this.maxVelocity > 0) {
                    phyobj.simulate(this.velocity.mul(this.maxVelocity));
                }
            }

            this.phyobj = phyobj;
        }
    }

    protected PhyDelete()
    {
        if(this.phydef.use) {
            let sys: PhyScene = this.runtime.systems[Phy_Name.value];
            if (sys && this.phyobj) {
                sys.DeleteObject(this.phyobj);
            }
            this.phyobj = null;
        }
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        if(this.eventDown)
            this._mEmit =
            new PIXIMouseEventEmit(this._container,this.etable
                    ,this.eventMove);

        if(this.eventTick && this.eventTick >= 0) {
            this._ticktime = 0;
            this._tickevt = true;
        }

        ///填写了自动进入则自动进入
        if(!isNaN(this.autoStateID)) {
           if(this.bGraphic) {
               ///如果是图形区动不应该去播动画
               this.timeline.SetState(this,this.autoStateID);
           }else
               {
               this.timeline.Play(this, this.autoStateID);
           }
        }
        ///有位置设置初始位置
        let pos = this.position;
        if(pos.x != 0 || pos.y != 0){this.set_position();}
        if(this.phydef && this.phydef.use){this.PhyNew();}

    }

    public DeactiveBLK(): void {

        if(this._mEmit) {
            this._mEmit.dispose();
            this._mEmit = null;
        }

        if(this.phydef){this.PhyDelete();}
        super.DeactiveBLK();
    }


    public Tick(frameindex: number): void {
        super.Tick(frameindex);
        if(this._tickevt) {
            this._ticktime -= this.runtime.fixtpf;
            if(this._ticktime <= 0) {
                this._ticktime = this.eventTick;
                this.etable.FireEvent(PIXITICK_Event);
            }
        }

        if(this.lifeTime != undefined && this.lifeTime > 0) {
            this.lifeTime -= this.runtime.fixtpf;
            if(this.lifeTime <= 0){
                this.Destory();
            }
        }
    }

    public phy_update(phy:any){
        ///如果是物理模拟则更新显示对象和逻辑位置
        let p = this.position;
        p.setValue(phy.get_position());
        if(this._container) {
            let py = p.y;
            this._container.setTransform(p.x,py);
            this._container.zIndex = py;
        }
    }

    public set_position(v3?: { x: number; y: number; z?: number }){
        if(!v3)v3 = this.position;
        else {
            this.position.setValue2(v3);
        }

        if(this.phyobj){
            this.phyobj.set_position(v3);
        }

        if(this._container){
            let py = v3.y;
            this._container.setTransform(v3.x, py);
            this._container.zIndex = py;
        }
    }

    public set_rotation(v3?: { x?: number; y?: number; z: number }) {
        if(!v3)v3 = this.rotation;
        else {
            this.rotation.z = v3.z;
        }

        if(this._container){
            this._container.rotation = v3.z;
        }
    }

    public set_scale(v3?: { x: number; y: number; z?: number }) {
        if(!v3)v3 = this.scale;
        else
            this.scale.setValue2(v3);

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
        throw new Error('use method set_display');
    }

    public set_display(v:number, bJumpFrame:boolean = false){

        if(this._display != v)
        {

            if(this._display == -1)
            {
                this.visible = true;
            }
            else if(v == -1)
            {
                this.visible = false;
            }

            this._display = v;

            if(this.bGraphic && v != -1)
            {
                this.timeline.DisplayFrame(this, v, bJumpFrame);
            }
        }
    }

    public set_datas(datas: number[]) {

        if(!datas || this.phyobj) return;

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