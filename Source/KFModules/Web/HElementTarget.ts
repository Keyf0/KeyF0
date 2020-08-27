import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFDName} from "../../KFData/Format/KFDName";

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
    sid:number;
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
        this.etable = new KFEventTable();
        let etb = this.etable;
        this.target["fireEvent"] = function (event) {
            let ShareEvent:KFEvent = KFEvent.ShareEvent;
            ShareEvent.type.value = KFDName._Strs.GetNameID(event);
            etb.FireEvent(ShareEvent);
        };
    }

    public DeactiveBLK(): void {

        super.DeactiveBLK();

        let parent = <HElementTarget><any>this.parent;
        HElementCreator.DefaultDestroyHtml(parent.target, this);

        if( this.etable)
        {
            this.etable.Clear();
            this.etable = null;
        }

        this.target["fireEvent"] = null;
        this.target = null;
    }

    public Value(id:string):string
    {
        if(this.document)
        {
            let ele:any = this.document.nativedom.getElementById(id);
            if(ele)
                return ele.value;
        }
        return "";
    }

}