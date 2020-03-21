import {KFActor} from "../../ACTS/Actor/KFActor";
import {PIXIObject} from "./PIXIInterface";
import {LOG_ERROR} from "../../Core/Log/KFLog";

export class PIXIScene extends KFActor implements PIXIObject
{
    public target:PIXI.Container;
    public getPIXITarget(): PIXI.Container {return this.target;}

    public ActivateBLK(KFBlockTargetData: any): void {

        super.ActivateBLK(KFBlockTargetData);

        if(this.target == null) {

            this.target = new PIXI.Container();
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
    }

    public DeactiveBLK(): void {

        this.target = new PIXI.Container();
        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();

        if (container) {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }

        super.DeactiveBLK();
    }
}