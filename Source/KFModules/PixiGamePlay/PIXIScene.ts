import {PIXINetActor} from "./PIXINetActor";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";


///KFD(C,CLASS=PIXIScene,EXTEND=PIXINetActor)
///KFD(*)

export class PIXIScene extends PIXINetActor
{
    public static Meta:IKFMeta = new IKFMeta("PIXIScene"
        ,():KFBlockTarget=>{
            return new PIXIScene();
        }
    );

    public target:PIXI.Container;

    protected newContainer(): PIXI.Container {
        this.target = new PIXI.Container();
        this.position = {x:0,y:0};
        return this.target;
    }

    public set_position(v3?: { x: number; y: number; z?: number }): void {

        if(v3) {
            this.position.x = v3.x;
            this.position.y = v3.y;
            this.target.x = v3.x;
            this.target.y = v3.y;
        }
    }
}