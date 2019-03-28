import {KFEventTable} from "../../../Core/Misc/KFEventTable";

export class KFActorModel
{
    path:string;
    sid:number = 0;
    type:number = 0;
    pause:boolean = false;
    freezetime:number = 0;
    actived:boolean = false;
    etable:KFEventTable;


    public Activate(_sid:number, etable:KFEventTable):void
    {
        this.sid = _sid;
        this.actived = true;
        this.etable = etable;
    }

    public Deactive()
    {
        this.etable = null;
        this.actived = false;
    }

    public SetConfig(KFActorConfig:any)
    {
        this.type = KFActorConfig.type;
    }

    //framebox:KFFrameBox
    public SetFrameBox(framebox:any){}
    public Reset() {}
}