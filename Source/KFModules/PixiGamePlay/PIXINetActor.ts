import {KFActor} from "../../ACTS/Actor/KFActor";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";


///KFD(C,CLASS=PIXINetActor,EXTEND=KFActor)
///KFD(P=1,NAME=position,CNAME=位置,TYPE=object,OTYPE=kfVector3,NET=life)
///KFD(P=2,NAME=rotation,CNAME=朝向,TYPE=object,OTYPE=kfVector3,NET=life)

export class PIXINetActor extends KFActor implements PIXIObject
{
    ///KFD(P=3,NAME=velocity,CNAME=当前速度,TYPE=object,OTYPE=kfVector3,NET=life)
    public velocity:{x:number,y:number,z:number};

    ///KFD(P=4,NAME=maxVelocity,CNAME=最大速度,TYPE=num1)
    public maxVelocity:number;

    ///KFD(P=5,NAME=accelerate,CNAME=加速度,TYPE=object,OTYPE=kfVector3,NET=life)
    public accelerate:{x:number,y:number,z:number};

    ///KFD(P=6,NAME=maxAccelerate,CNAME=最大加速度,TYPE=num1)
    public maxAccelerate:number;

    ///KFD(*)

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


}