import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {IKFFileIO_Type} from "../../Core/FileIO/IKFFileIO";
import {GSLoadBLKDataScript, GSSaveBLKDataScript} from "../../ACTS/Script/Global/GlobalScripts";


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

    public Construct(metadata: any, runtime: IKFRuntime, initBytes?:KFByteArray)
    {
        super.Construct(metadata, runtime, initBytes);
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
    }

    public DeactiveBLK(): void {
        super.DeactiveBLK();
    }

    public SaveData():boolean
    {
        if(this.parent)
        {
            ///获取需要序列化的对象
           let Instance:KFBlockTarget = this.parent.StrChild(this.rebuildInst);
           if(Instance){
             let blkData = GSSaveBLKDataScript.Serialize(Instance);
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
                        GSLoadBLKDataScript.Deserialize(Instance, KFDJson.read_value(bytes));
                    }

                }, null);

        }

        return true;
    }
}