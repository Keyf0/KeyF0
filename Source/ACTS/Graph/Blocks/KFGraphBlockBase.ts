import {IKFGraphContext} from "../IKFGraphContext";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFDName} from "../../../KFData/Format/KFDName";

export class KFGraphBlockBase
{
    protected m_ctx:IKFGraphContext;

    public data:any;

    public Create(ctx:IKFGraphContext
                  , data:any)
    {
        this.m_ctx = ctx;
        this.data = data;
    }

    public Release()
    {
        this.Deactive(true);
        this.m_ctx = null;
        this.data = null;
    }

    public Input(arg:any)
    {
        //由子类处理
    }

    public Activate(){}
    public Deactive(force:boolean = false) {}
    public Reset(){}
    public Tick(frameIndex:number){}

    protected OutNext(arg:any)
    {
        if (this.m_ctx && this.data)
        {
            ///可以绑定加速，后面再优化
            let outputs = this.data.outputs;
            if(outputs && outputs.length > 0)
            {
                let nxtname:KFDName = outputs[0].name;
                if(nxtname)
                    this.m_ctx.m_graph.Input(nxtname, arg);
            }
        }
    }

    protected GetAttachTarget():KFBlockTarget
    {
        let target:KFBlockTarget = null;
        if (this.data && this.m_ctx)
        {
            let tdata = this.data.target;

            if (tdata && tdata.option == KFBlockTargetOption.Attach)
            {
                target = this.m_ctx.targetObject.FindChild(tdata.instname.value);
            }
            else
            {
                target = <KFBlockTarget>this.m_ctx.targetObject;
            }
        }
        return target;
    }
}