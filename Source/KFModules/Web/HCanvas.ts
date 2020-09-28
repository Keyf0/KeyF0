import {LOG_ERROR} from "../../Core/Log/KFLog";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementActor} from "./HElementActor";


///KFD(C,CLASS=HCanvas,EXTEND=HElementActor)
///KFD(*)

export class HCanvas extends HElementActor
{
    public static Meta:IKFMeta = new IKFMeta("HCanvas"

        ,():KFBlockTarget=>{
            return new HCanvas();
        }
    );

    protected TargetNew(KFBlockTargetData: any): any
    {
        let parent = <HElementActor>this.parent;
        this.document = parent.document;

        if(this.attachId)
        {
            this.target = this.document.nativedom.getElementById(this.attachId);

            ///类型判定
            let tagName = this.target.tagName;
            if(tagName != "Canvas")
            {
                LOG_ERROR("绑定类型错误需要<Canvas> 结果为{0}",tagName);
                this.target = null;
            }
        }
        else
        {
            //let blktarget:KFBlockTarget = <KFBlockTarget><any>element;
            //let eleid:string = "_kfwebid_" + blktarget.sid;
            let htmlstr = this.html;
            ///或者可以手动创建，暂时用简单的
            if(!htmlstr || htmlstr.indexOf("<canvas") != 0)
            {
                htmlstr = '<canvas></canvas>';
            }

            let ptarget = parent.target;

            ptarget.insertAdjacentHTML("beforeend", htmlstr);
            this.target = ptarget.lastElementChild;
        }
    }
}