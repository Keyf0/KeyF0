import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";

///KFD(C,CLASS=PIXIGraphics,EXTEND=KFBlockTarget)
///KFD(*)

export class PIXIGraphics extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("PIXIGraphics"
        ,():KFBlockTarget=>{
            return new PIXIGraphics();
        }
        , BlkExecSide.CLIENT
    );

    public target:PIXI.Graphics;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);
        this.target = new PIXI.Graphics();

        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();

        if (container) {
            container.addChild(this.target);
        } else {
            LOG_ERROR("{0}对象不能加入父级{1}"
                , this.name.toString()
                , pixiParent.name.toString());
        }
    }


    public DeactiveBLK(): void {

        super.DeactiveBLK();

        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container) {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }
    }


}