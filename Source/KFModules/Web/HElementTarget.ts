import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";

///KFD(C,CLASS=HElementTarget,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=attachId,CNAME=绑定ID,TYPE=kfstr)
///KFD(P=2,NAME=html,CNAME=HTML内容,TYPE=kfstr,texttype=html)
///KFD(*)

export interface IDocument
{
    nativedom:Document;
}

export interface HElement
{
    ///元素都有两种模式一种是ATTACH到原来的DOM上一种是新创建
    attachId:string;
    html:string;
    target:Element;
    document:IDocument;
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
    public html:string;
    public target: Element;

    public ActivateBLK(KFBlockTargetData: any): void {

        super.ActivateBLK(KFBlockTargetData);

        let parent = <HElementTarget><any>this.parent;
        this.document = parent.document;
        this.target = HElementCreator.DefaultCreateHtml(parent.target
            , this
            , this.document);
    }

    public DeactiveBLK(): void {

        super.DeactiveBLK();

        let parent = <HElementTarget><any>this.parent;
        HElementCreator.DefaultDestroyHtml(parent.target, this);
        this.target = null;
    }
}