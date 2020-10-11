import {KFActor} from "../../ACTS/Actor/KFActor";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElement, IDocument} from "./HElementTarget";
import {HElementCreator} from "./HElementCreator";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {KFDName} from "../../KFData/Format/KFDName";

///KFD(C,CLASS=HElementActor,EXTEND=KFActor,EDITCLASS=EditHTMLBlk)
///KFD(P=1,NAME=attachId,CNAME=绑定ID,TYPE=kfstr)
///KFD(P=2,NAME=html,CNAME=HTML内容,TYPE=kfstr,texttype=html)
///KFD(P=3,NAME=containerID,CNAME=子集容器ID,TYPE=kfstr)
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
    public containerID:string;

    public document: IDocument;
    public target: Element;

    public GetH5Container():Element
    {
        ///可以指定一个特别的DIV做为容器
        if(this.containerID != null && this.containerID != "")
        {
            return this.document.nativedom.getElementById(this.containerID);
        }

        return this.target;
    }

    protected TargetNew(KFBlockTargetData: any):  any
    {
        let parent = <HElementActor>this.parent;
        this.document = parent.document;
        this.target = HElementCreator.DefaultCreateHtml(
              parent.GetH5Container()
            , this
            , this.document);

        let etb = this.etable;
        let isEditMode:boolean = this.runtime.isEditMode;
        this.target["fireEvent"] = function (event, arg) {

            if(isEditMode) return;

            let ShareEvent: KFEvent = KFEvent.ShareEvent;

            ShareEvent.type.value = KFDName._Strs.GetNameID(event);
            ShareEvent.arg = arg;

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
            HElementCreator.DefaultDestroyHtml(parent.GetH5Container(), this);
        }
    }

    public HTMLElement(id:string,endsid:boolean = false):any
    {
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