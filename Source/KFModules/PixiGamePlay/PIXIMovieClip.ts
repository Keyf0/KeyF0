import {PIXINetActor} from "./PIXINetActor";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {LOG} from "../../Core/Log/KFLog";

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

    public set_position(v3?: { x: number; y: number; z?: number }): void {
        if(!v3)v3 = this.position;
        if(this.target){
            this.target.setTransform(v3.x,v3.y);
        }
    }

    public set_rotation(v3?: { x?: number; y?: number; z: number }): void {
        if(!v3)v3 = this.rotation;
        if(this.target){
            this.target.rotation = v3.z;
        }
    }

}