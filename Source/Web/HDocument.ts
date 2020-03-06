import {IDocument} from "./HElementTarget";
import {IKFRuntime} from "../ACTS/Context/IKFRuntime";
import {HInteractive} from "./HInteractive";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=HDocument,EXTEND=HInteractive)
///KFD(*)

export class HDocument extends HInteractive implements IDocument
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

        this.document = this;
        this.nativedom = window.document;
        this.domELE = this.nativedom.body;
    }
}