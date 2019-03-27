
export class KFFrameDataUtils
{
    private static __KFFrameDataID:number = 0;

    public  static CreateID(kfframedata:any):number
    {
        if(kfframedata["__id__"] != undefined)
        {
            return kfframedata["__id__"];
        }
        KFFrameDataUtils.__KFFrameDataID += 1;
        kfframedata["__id__"] = KFFrameDataUtils.__KFFrameDataID;
        return KFFrameDataUtils.__KFFrameDataID;
    }
}