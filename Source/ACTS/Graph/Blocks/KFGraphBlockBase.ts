import {IKFGraphContext} from "../IKFGraphContext";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";

export class KFGraphBlockBase
{
    protected m_ctx:IKFGraphContext;

    public data:any;

    public Create(ctx:IKFGraphContext
                  , data:any)
    {
        this.m_ctx = ctx;
        this.SetData(data);
    }

    public Release()
    {
        this.Deactive(true);
        this.m_ctx = null;
        this.data = null;
    }

    //public Reset(){}
    public SetData(data:any)
    {
        this.data = data;
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
            this.m_ctx.Input(this.data.outputs[0].name, arg);
        }
    }

    protected GetAttachTarget():KFBlockTarget
    {
        let target:KFBlockTarget = null;
        if (this.data && this.m_ctx)
        {
            if (this.data.target.option == KFBlockTargetOption.Attach)
            {
                target = this.m_ctx.targetObject.FindChild(this.data.target.instname);
            }
            else
            {
                target = <KFBlockTarget>this.m_ctx.targetObject;
            }
        }
        return target;
    }
}