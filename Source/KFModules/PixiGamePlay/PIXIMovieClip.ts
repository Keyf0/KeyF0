import {PIXINetActor} from "./PIXINetActor";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=PIXIMovieClip,EXTEND=PIXINetActor)
///KFD(*)

export class PIXIMovieClip extends PIXINetActor
{
    public static Meta:IKFMeta = new IKFMeta("PIXIMovieClip"
        ,():KFBlockTarget=>{
            return new PIXIMovieClip();
        }
    );

    public target:PIXI.Sprite;
    protected newContainer(): PIXI.Container {
        this.target = new PIXI.Sprite();
        return this.target;
    }

}