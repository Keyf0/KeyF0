import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFDName} from "../../KFData/Format/KFDName";


//保存或重建指定的实例
///KFD(C,CLASS=Rebuilding,EXTEND=KFBlockTarget)

export class Rebuilding extends KFBlockTarget{

    public static Meta:IKFMeta = new IKFMeta("Rebuilding"
        ,():KFBlockTarget=>{
            return new Rebuilding();
        });

    ///KFD(P=1,NAME=rebuildInst,CNAME=实例名,TYPE=kfname)
    public rebuildInst:KFDName;

    ///KFD(P=2,NAME=rebuildPath,CNAME=路径,TYPE=kfstr)
    public rebuildPath:string="";

    ///KFD(*)

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
    }

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);
    }

    public DeactiveBLK(): void {
        super.DeactiveBLK();
    }

    public SaveData():boolean {
        return false;
    }

    public LoadData():boolean{
        return false;
    }
}