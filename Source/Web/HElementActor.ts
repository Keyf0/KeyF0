import {KFActor} from "../ACTS/Actor/KFActor";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";
import {HElement, IDocument} from "./HElementTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../Core/Meta/KFMetaManager";

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
    public domELE: Element;

    public CreateHtml(parent:Element):Element
    {
        return HElementCreator.DefaultCreateHtml(parent,this,this.document,this.metadata);
    }

    public DestroyHtml(parent:Element):void
    {
        HElementCreator.DefaultDestroyHtml(parent,this);
    }

    protected _AddChild(child: KFBlockTarget): void
    {
        //给对像设置DOM
        let ELE:HElement = <HElement><any>child;
        ELE.document = this.document;
        ELE.CreateHtml(this.domELE);
        //insertAdjacentHTML
    }

    protected _RemoveChild(child: KFBlockTarget): void
    {
        let ELE:HElement = <HElement><any>child;
        ELE.DestroyHtml(this.domELE);
    }
}