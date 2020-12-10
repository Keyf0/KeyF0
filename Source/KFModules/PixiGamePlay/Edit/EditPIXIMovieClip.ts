import {EditPIXIObject} from "./EditPIXIObject";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=EditPIXIMovieClip,EXTEND=EditPIXIObject)
///KFD(*)

export class EditPIXIMovieClip  extends EditPIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("EditPIXIMovieClip"
        ,():KFBlockTarget=>{
            return new EditPIXIMovieClip();
        }
    );


    public OnEidtorInit()
    {
        super.OnEidtorInit();

        if(this.editTarget)
        {
            let mc:any = this.editTarget;
            mc.StopFrame(0);
        }
    }

    public OnFrameChange(frameindex:number):void
    {
        // LOG("FRAME={0}",frameindex);
        let mc:any = this.editTarget;
        mc.StopFrame(frameindex);
    }

}