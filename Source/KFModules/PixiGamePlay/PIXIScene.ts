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

    protected newContainer(): PIXI.Container
    {
        this.target = new PIXI.Container();
        return this.target;
    }
}