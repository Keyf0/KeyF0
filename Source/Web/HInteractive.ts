import {HElementActor} from "./HElementActor";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=HInteractive,EXTEND=HElementActor)
///KFD(*)

export class HInteractive extends HElementActor
{
    public static Meta:IKFMeta = new IKFMeta("HInteractive"

        ,():KFBlockTarget=>{
            return new HInteractive();
        }
    );
}