import {KFActor} from "../../ACTS/Actor/KFActor";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";

export class PIXIRenderObject extends KFActor implements PIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("PIXIRenderObject"
        ,():KFBlockTarget=>{
            return new PIXIRenderObject();
        }
        , BlkExecSide.CLIENT
    );

    protected m_mesh:PIXI.Mesh;
    protected m_container:PIXI.Container;
    protected m_app:PIXI.Application;

    public getPIXIApp(): PIXI.Application
    {
        return this.m_app;
    }

    public getPIXITarget(): PIXI.Container
    {
        return this.m_container;
    }

    protected TargetNew(KFBlockTargetData: any): any
    {
        if(this.m_mesh == null) {
            this.m_container = new PIXI.Container();

            //let test = new PIXI.Graphics();
            //test.beginFill(0x00ff00);
            //test.drawCircle(0,0,5);
            //test.endFill();
            //this._container.addChild(test);

            let pixiParent = <any>this.parent;
            let pixiobj = <PIXIObject>pixiParent;

            let container = pixiobj.getPIXITarget();
            this.m_app = pixiobj.getPIXIApp();

            if (container) {
                container.addChild(this.m_container);
            } else {
                LOG_ERROR("{0}对象不能加入父级{1}"
                    , this.name.toString()
                    , pixiParent.name.toString());
            }
        }
    }

    protected TargetDelete()
    {
        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container) {
            container.removeChild(this.m_container);
            this.m_container.destroy();
            this.m_container = null;
        }
    }


}