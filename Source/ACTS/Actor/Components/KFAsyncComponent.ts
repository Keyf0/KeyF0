import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {IKFDelegate0} from "../../../Core/Misc/KFDelegate";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";

export class KFAsyncComponent extends KFComponentBase
{
    public static Meta:IKFMeta
    = new IKFMeta("KFAsyncComponent");

    private m_listNextFrameFuncs:Array<IKFDelegate0> = new Array<IKFDelegate0>();
    private m_listDontRemoveOnClear:Array<IKFDelegate0> = new Array<IKFDelegate0>();
    private m_listFuncOnFrameEnd:Array<IKFDelegate0> = new Array<IKFDelegate0>();

    public constructor(target:any)
    {
        super(target, KFAsyncComponent.Meta.type);
    }

    public ResetComponent()
    {
        this.m_listNextFrameFuncs.length = 0;
        this.m_listDontRemoveOnClear.length = 0;
        this.m_listFuncOnFrameEnd.length = 0;
    }
    public ActivateComponent(){}

    public DeactiveComponent()
    {
        this.m_listNextFrameFuncs.length = 0;
        this.m_listDontRemoveOnClear.length = 0;
        this.m_listFuncOnFrameEnd.length = 0;
    }

    public PreEnterFrame():boolean
    {
        if(this.m_listNextFrameFuncs.length > 0)
        {
            let list:Array<IKFDelegate0> = this.m_listNextFrameFuncs.concat();
            this.m_listNextFrameFuncs.length = 0;

            for (let func of list)
            {
                func();
            }
        }

        this.m_listDontRemoveOnClear.length = 0;
        return true;
    }

    public LateEnterFrame()
    {
        let count = this.m_listFuncOnFrameEnd.length
        if (count > 0)
        {
            for (let func of this.m_listFuncOnFrameEnd)
            {
                func();
            }
            this.m_listFuncOnFrameEnd.length = 0;
        }
    }

    public ExecuteOnFrameEnd(func:IKFDelegate0)
    {
        this.m_listFuncOnFrameEnd.push(func);
    }

    public ExecuteOnNextFrame(func:IKFDelegate0, dontRemoveOnClear:boolean)
    {
        this.m_listNextFrameFuncs.push(func);
        if (dontRemoveOnClear)
        {
            this.m_listDontRemoveOnClear.push(func);
        }
    }

    public ClearNextFrameFuncs()
    {
        let size = this.m_listDontRemoveOnClear.length;
        let it = this.m_listNextFrameFuncs.length - 1;

        while (it >= 0)
        {
            let func =  this.m_listNextFrameFuncs[it];
            let delflag = true;

            for(let i = 0 ;i <size; i ++)
            {
                if(this.m_listDontRemoveOnClear[i] == func)
                {
                    delflag = false;
                    break;
                }
            }

            if(delflag)
            {
                this.m_listNextFrameFuncs.splice(it,1);
            }

            it -= 1;
        }
    }

    public CancelExecuteOnNextFrame(func:IKFDelegate0)
    {
        let i = this.m_listNextFrameFuncs.length - 1;
        while (i >= 0)
        {
            let itm = this.m_listNextFrameFuncs[i];
            if(itm() == func)
            {
                this.m_listNextFrameFuncs.splice(i,1);
                break;
            }
            i -= 1;
        }
    }

}