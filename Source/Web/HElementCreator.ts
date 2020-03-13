import {HElement, IDocument} from "./HElementTarget";
import {KFDataHelper} from "../ACTS/Data/KFDataHelper";

export class HElementCreator {

    public static DefaultCreateHtml(parent:Element
                             , element:HElement
                                    , document:IDocument
                                , metadata:any):Element
    {
        let Values:{[key:string]:string;} = KFDataHelper.Meta2MapValue(metadata);
        if(Values.attachId)
        {
            element.attachId = Values.attachId;
            element.target = document.nativedom.getElementById(element.attachId);
        }
        else
            {
                //let blktarget:KFBlockTarget = <KFBlockTarget><any>element;
                //let eleid:string = "_kfwebid_" + blktarget.sid;
                let htmlstr = Values.html;
                parent.insertAdjacentHTML("beforeend", htmlstr);
                element.target = parent.lastElementChild;
            }

        return element.target;
    }

    public static DefaultDestroyHtml(parent:Element
        , element:HElement)
    {
        if(!element.attachId && element.target)
        {
            parent.removeChild(element.target);
        }
        element.target = null;
    }

}