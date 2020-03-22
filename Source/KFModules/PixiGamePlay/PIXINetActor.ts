import {KFActor} from "../../ACTS/Actor/KFActor";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";


///KFD(C,CLASS=PIXINetActor,EXTEND=KFActor)
///KFD(*)

export class PIXINetActor extends KFActor implements PIXIObject
{
    public getPIXITarget(): PIXI.Container {return this._container;}
    public execSide:number;

    protected _container:PIXI.Container;
    protected newContainer():PIXI.Container{return null;}

    protected TargetNew(KFBlockTargetData: any): any
    {
        if(this.execSide != BlkExecSide.SERVER)
        {
             if(this._container == null) {
                this._container = this.newContainer();
                let pixiParent = <any>this.parent;
                let container = (<PIXIObject>pixiParent).getPIXITarget();

                if (container) {
                    container.addChild(this._container);
                } else {
                    LOG_ERROR("{0}对象不能加入父级{1}"
                        , this.name.toString()
                        , pixiParent.name.toString());
                }
            }

             return true;
        }
        return false;
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