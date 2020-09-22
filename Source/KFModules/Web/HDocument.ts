import {IDocument} from "./HElementTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {HElementActor} from "./HElementActor";
import {SDInt32, SDString} from "../../ACTS/Script/Global/GlobalScripts";

///KFD(C,CLASS=HDocument,EXTEND=HElementActor)
///KFD(*)

export class HDocument extends HElementActor implements IDocument
{
    public static Meta:IKFMeta = new IKFMeta("HDocument"

        ,():KFBlockTarget=>{
            return new HDocument();
        }
    );

    public nativedom:Document;

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);

        let nativdoc = window.document;

        this.document = this;
        this.nativedom = nativdoc;
        this.target = nativdoc.body;

        window["FireEvent"] = function (id, event, argval, argtype)
        {
            let ele:any = nativdoc.getElementById(id);
            if(ele && ele.fireEvent)
            {
                let arg:any = null;
                if(argtype == 0)
                {
                    let intdata:SDInt32 = new SDInt32();
                    intdata.setValue(argval);
                    arg = intdata;
                }else if(argtype == 1){
                    let strdata:SDString = new SDString();
                    strdata.setValue(argval);
                    arg = strdata;
                }

                ele.fireEvent(event, arg);
            }
        }
    }

    protected TargetNew(KFBlockTargetData: any): any
    {
    }
}