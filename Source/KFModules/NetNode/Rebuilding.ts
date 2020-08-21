import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFBytes} from "../../KFData/Format/KFBytes";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFActor} from "../../ACTS/Actor/KFActor";
import {IKFFileIO, IKFFileIO_Type} from "../../Core/FileIO/IKFFileIO";
import {KFDName} from "../../KFData/Format/KFDName";


//保存或重建指定的实例
///KFD(C,CLASS=Rebuilding,EXTEND=KFBlockTarget)

export class Rebuilding extends KFBlockTarget{

    public static Meta:IKFMeta = new IKFMeta("Rebuilding"
        ,():KFBlockTarget=>{
            return new Rebuilding();
        });

    ///KFD(P=1,NAME=rebuildInst,CNAME=实例名,TYPE=kfstr)
    public rebuildInst:string = "";

    ///KFD(P=2,NAME=rebuildPath,CNAME=路径,TYPE=kfstr)
    public rebuildPath:string = "";

    ///KFD(P=3,NAME=autoload,CNAME=自动加载,TYPE=bool, DEFAULT=true)
    public autoload:boolean = true;

    ///KFD(*)

    public Construct(metadata: any, runtime: IKFRuntime)
    {
        super.Construct(metadata, runtime);
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
    }

    public DeactiveBLK(): void {
        super.DeactiveBLK();
    }

    public static Serialize(blk:KFBlockTarget):any {

        let actormeta = blk.metadata;
        let blkData:any = {"__cls__":"SDBlockTarget"};

        let KFNewBlkData:any = {"__cls__":"KFNewBlkData"};
        blkData.data = KFNewBlkData;
        let KFBlockTargetData:any = {"__cls__":"KFBlockTargetData"
            , asseturl: actormeta.asseturl
            , instname: blk.name
            , instsid: blk.sid
        };

        let KFMetaData:any = {"__cls__":"KFMetaData"};

        //KFMetaData.name = "";
        //KFMetaData.type =;

        let kfbytes = new KFBytes();
        kfbytes.bytes = new KFByteArray();
        KFMetaData.data = kfbytes;

        KFNewBlkData.targetData = KFBlockTargetData;
        KFNewBlkData.metaData = KFMetaData;
        ///写入了全量数据
        KFDJson.write_value(kfbytes.bytes, blk);

        ///查看子集
        let Actor:KFActor = blk.AsActor();
        if(Actor){
            blkData.children = [];

           let ActorChildren: KFBlockTarget[] = Actor.GetChildren();
           for(let i = 0;i < ActorChildren.length; i ++){
               blkData.children.push(Rebuilding.Serialize(ActorChildren[i]));
           }

        }

        return blkData;
    }

    public static Deserialize(blk:KFBlockTarget, InData:any){

        //let metaData:any = InData.data.metaData;
        //if(metaData && metaData.data){
        //   KFDJson.read_value(metaData.data, false, blk);
        //}

        let childrenData = InData.children;
        if(childrenData){
            let blkActor:KFActor = blk.AsActor();
            for(let i = 0;i < childrenData.length; i++){

                let childdata = childrenData[i];
                let targetData = childdata.data.targetData;
                let child: KFBlockTarget = blkActor.FindChild(targetData.instname.value);

                if(child == null){
                    child = blkActor.CreateChildByData(childdata);
                }

                Rebuilding.Deserialize(child, childdata);
            }
        }
    }

    public SaveData():boolean
    {
        if(this.parent)
        {
            ///获取需要序列化的对象
           let Instance:KFBlockTarget = this.parent.StrChild(this.rebuildInst);
           if(Instance){
             let blkData = Rebuilding.Serialize(Instance);
             let bytearr:KFByteArray = new KFByteArray();
             KFDJson.write_value(bytearr,blkData);
             IKFFileIO_Type.instance.asyncSaveFile(this.rebuildPath
                 , bytearr, null);
             return true;
           }
        }

        return false;
    }

    public LoadData():boolean{

        let Instance:KFBlockTarget = this.parent.StrChild(this.rebuildInst);
        if(Instance) {
            IKFFileIO_Type.instance.asyncLoadFile(this.rebuildPath
                , function (ret: any, data: any, path: string) {

                    if (ret) {
                        let bytes: KFByteArray = new KFByteArray(data);
                       Rebuilding.Deserialize(Instance, KFDJson.read_value(bytes));
                    }

                }, null);

        }

        return true;
    }
}