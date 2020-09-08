import {IDocument} from "./HElementTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementActor} from "./HElementActor";

///KFD(C,CLASS=HDocument,EXTEND=HElementActor)
///KFD(*)

export class HDocument extends HElementActor implements IDocument
{
    public static Meta:IKFMeta = new IKFMeta("HDocument"

        ,():KFBlockTarget=>{
            return new HDocument();
        }
    );

    public nativedom:Document;

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);

        let nativdoc = window.document;

        this.document = this;
        this.nativedom = nativdoc;
        this.target = nativdoc.body;

        window["FireEvent"] = function (id,event)
        {
            let ele:any = nativdoc.getElementById(id);
           if(ele && ele.fireEvent)
           {
               ele.fireEvent(event);
           }
        }
    }

    protected TargetNew(KFBlockTargetData: any): any
    {
    }
}