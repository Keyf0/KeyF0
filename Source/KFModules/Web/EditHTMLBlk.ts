import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HDocument} from "./HDocument";


///KFD(C,CLASS=EditHTMLBlk,EXTEND=HDocument)
///KFD(*)


export class EditHTMLBlk extends HDocument
{
    public static Meta:IKFMeta = new IKFMeta("EditHTMLBlk"

        ,():KFBlockTarget=>{
            return new EditHTMLBlk();
        }
    );

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
        /// create preview child
        let startFiles:string[] = this.runtime.configs.startFiles();
        if(startFiles && startFiles.length > 0){
            let targetData:any = {};
            targetData.asseturl = startFiles[0];
            this.CreateChild(targetData);
        }
    }

    public DeactiveBLK(): void
    {

        super.DeactiveBLK();
    }
}