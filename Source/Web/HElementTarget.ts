import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../Core/Meta/KFMetaManager";

///KFD(C,CLASS=HElementTarget,EXTEND=KFBlockTarget)
///KFD(*)

export interface IDocument
{
    nativedom:Document;
}

export interface HElement
{
    ///元素都有两种模式一种是ATTACH到原来的DOM上一种是新创建
    attachId:string;
    domELE:Element;
    document:IDocument;
    CreateHtml(parent:Element):Element;
    DestroyHtml(parent:Element):void;
}

export class HElementTarget extends KFBlockTarget implements HElement
{
    public static Meta:IKFMeta = new IKFMeta("HElementTarget"

        ,():KFBlockTarget=>{
            return new HElementTarget();
        }
    );

    public document: IDocument;
    public attachId:string;
    public domELE: Element;

    public CreateHtml(parent:Element):Element
    {
        return HElementCreator.DefaultCreateHtml(parent,this, this.document,this.metadata);
    }

    public DestroyHtml(parent:Element):void
    {
        HElementCreator.DefaultDestroyHtml(parent,this);
    }
}