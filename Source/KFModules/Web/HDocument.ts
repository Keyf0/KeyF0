import {IDocument} from "./HElementTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementActor} from "./HElementActor";

///KFD(C,CLASS=HDocument,EXTEND=HElementActor)
///KFD(P=1,NAME=x,TYPE=num1)
///KFD(P=2,NAME=y,TYPE=num1)
///KFD(P=3,NAME=z,TYPE=num1)
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
        this.document = this;
        this.nativedom = window.document;
        this.target = this.nativedom.body;
    }

    public CreateHtml(): void
    {
    }
}