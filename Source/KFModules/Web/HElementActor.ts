import {KFActor} from "../../ACTS/Actor/KFActor";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElement, IDocument} from "./HElementTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";

///KFD(C,CLASS=HElementActor,EXTEND=KFActor)
///KFD(*)


export class HElementActor extends KFActor implements HElement
{
    public static Meta:IKFMeta = new IKFMeta("HElementActor"

        ,():KFBlockTarget=>{
            return new HElementActor();
        }
    );

    public attachId:string;
    public document: IDocument;
    public target: Element;

    protected TargetNew(KFBlockTargetData: any):  any
    {
        let parent = <HElementActor>this.parent;
        this.document = parent.document;
        this.target = HElementCreator.DefaultCreateHtml(
              parent.target
            , this
            , this.document,this.metadata);
    }

    protected TargetDelete(): void {
        if(this.parent) {
            let parent = <HElementActor>this.parent;
            HElementCreator.DefaultDestroyHtml(parent.target, this);
        }
    }
}