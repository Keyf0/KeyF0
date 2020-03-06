import {HInteractive} from "./HInteractive";
import {KFDataHelper} from "../ACTS/Data/KFDataHelper";
import {LOG_ERROR} from "../Core/Log/KFLog";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";


///KFD(C,CLASS=HCanvas,EXTEND=HInteractive)
///KFD(*)

export class HCanvas extends HInteractive
{
    public static Meta:IKFMeta = new IKFMeta("HCanvas"

        ,():KFBlockTarget=>{
            return new HCanvas();
        }
    );

    public CreateHtml(parent: Element): Element
    {
        let Values:{[key:string]:string;} = KFDataHelper.Meta2MapValue(this.metadata);
        if(Values.attachId)
        {
            this.attachId = Values.attachId;
            this.domELE = this.document.nativedom.getElementById(this.attachId);

            ///类型判定
            let tagName = this.domELE.tagName;
            if(tagName != "Canvas")
            {
                LOG_ERROR("绑定类型错误需要<Canvas> 结果为{0}",tagName);
                this.domELE = null;
            }

        }
        else
        {
            //let blktarget:KFBlockTarget = <KFBlockTarget><any>element;
            //let eleid:string = "_kfwebid_" + blktarget.sid;
            let htmlstr = Values.html;
            ///或者可以手动创建，暂时用简单的
            if(!htmlstr || htmlstr.indexOf("<Canvas>") != 0)
            {
                htmlstr = '<Canvas></Canvas>';
            }

            parent.insertAdjacentHTML("afterend", htmlstr);
            this.domELE = parent.lastElementChild;
        }

        return this.domELE;
    }
}