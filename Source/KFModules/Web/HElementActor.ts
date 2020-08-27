import {KFActor} from "../../ACTS/Actor/KFActor";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElement, IDocument} from "./HElementTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {KFDName} from "../../KFData/Format/KFDName";

///KFD(C,CLASS=HElementActor,EXTEND=KFActor)
///KFD(P=1,NAME=attachId,CNAME=绑定ID,TYPE=kfstr)
///KFD(P=2,NAME=html,CNAME=HTML内容,TYPE=kfstr,texttype=html)
///KFD(*)


export class HElementActor extends KFActor implements HElement
{
    public static Meta:IKFMeta = new IKFMeta("HElementActor"

        ,():KFBlockTarget=>{
            return new HElementActor();
        }
    );

    public attachId:string;
    public html:string;

    public document: IDocument;
    public target: Element;

    protected TargetNew(KFBlockTargetData: any):  any
    {
        let parent = <HElementActor>this.parent;
        this.document = parent.document;
        this.target = HElementCreator.DefaultCreateHtml(
              parent.target
            , this
            , this.document);

        let etb = this.etable;
        this.target["fireEvent"] = function (event) {
            let ShareEvent:KFEvent = KFEvent.ShareEvent;
            ShareEvent.type.value = KFDName._Strs.GetNameID(event);
            etb.FireEvent(ShareEvent);
        };
    }

    protected TargetDelete(): void {

        if(this.target)
        {
            this.target["fireEvent"] = null;
        }

        if(this.parent) {
            let parent = <HElementActor>this.parent;
            HElementCreator.DefaultDestroyHtml(parent.target, this);
        }
    }

    public HTMLElement(id:string,endsid:boolean = false):any{

        if(this.document)
        {
            if(endsid) id = id + this.sid;
            let ele:HTMLElement = this.document.nativedom.getElementById(id);
            if(ele)return ele;
        }
        return null;
    }

    public HTMLValue(id:string,endsid:boolean = false):string
    {
        if(this.document)
        {
            if(endsid) id = id + this.sid;
            let ele:HTMLElement = this.document.nativedom.getElementById(id);
            if(ele)return ele.innerText;
        }
        return "";
    }

    public SetHTMLValue(id:string, value:string,endsid:boolean = false){
        if(this.document)
        {
            if(endsid) id = id + this.sid;
            let ele:HTMLElement = this.document.nativedom.getElementById(id);
            if(ele)ele.innerText = value;
        }
    }


    public Value(id:string,endsid:boolean = false):string
    {
        if(this.document)
        {
            if(endsid) id = id + this.sid;
            let ele:any = this.document.nativedom.getElementById(id);
            if(ele)return ele.value;
        }
        return "";
    }

    public SetValue(id:string, value:string,endsid:boolean = false){
        if(this.document)
        {
            if(endsid) id = id + this.sid;
            let ele:any = this.document.nativedom.getElementById(id);
            if(ele)ele.vaule = value;
        }
    }
}