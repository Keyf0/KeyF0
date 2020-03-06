import {HElement, IDocument} from "./HElementTarget";
import {KFDataHelper} from "../ACTS/Data/KFDataHelper";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";

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
            element.domELE = document.nativedom.getElementById(element.attachId);
        }
        else
            {
                //let blktarget:KFBlockTarget = <KFBlockTarget><any>element;
                //let eleid:string = "_kfwebid_" + blktarget.sid;
                let htmlstr = Values.html;
                parent.insertAdjacentHTML("afterend", htmlstr);
                element.domELE = parent.lastElementChild;
            }

        return element.domELE;
    }

    public static DefaultDestroyHtml(parent:Element
        , element:HElement)
    {
        if(!element.attachId && element.domELE)
        {
            parent.removeChild(element.domELE);
        }
        element.domELE = null;
    }

}