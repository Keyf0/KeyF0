import {HElement, IDocument} from "./HElementTarget";
import {KFDataHelper} from "../../ACTS/Data/KFDataHelper";

export class HElementCreator {

    public static DefaultCreateHtml(parent:Element
                             , element:HElement
                                    , document:IDocument
                                , metadata?:any):Element
    {
        if(element.attachId) {

            element.target = document.nativedom.getElementById(element.attachId);
        }
        else {
                let htmlstr = element.html;
                if(htmlstr && htmlstr != "") {

                    parent.insertAdjacentHTML("beforeend", htmlstr);
                    element.target = parent.lastElementChild;
                }
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