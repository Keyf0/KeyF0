import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {LOG_ERROR} from "../../../Core/Log/KFLog";


export class KFGraphBlockNormal extends KFGraphBlockBase
{
    private m_target:KFBlockTarget = null;

    public Tick(frameIndex:number)
    {
        if (this.m_target)
        {
            this.m_target.Tick(frameIndex);
        }
    }

    public Input(arg: any)
    {
        super.Input(arg);
        this.Activate();

        if(this.m_target)
        {
            let sctx = this.m_target.scriptContext;
            if(sctx)
            {
                this.m_ctx.OnGraphFrame(arg,this.data.frame,sctx);
            }
        }
        else
        {
            this.m_ctx.OnGraphFrame(arg,this.data.frame,null);
        }
        this.OutNext(arg);
    }

    public Activate()
    {
        super.Activate();

        if(this.m_target == null)
        {
            let targetdata = this.data.target;
            if (targetdata.option == KFBlockTargetOption.Create)
            {
                this.m_target = this.m_ctx.runtime.domain.CreateBlockTarget(targetdata);
                if (this.m_target)
                {
                    this.m_ctx.targetObject.AddChild(this.m_target);
                    this.m_target.ActivateBLK(targetdata);
                }
                else {
                    LOG_ERROR("Cannot Create BlockTarget:{0}", targetdata.asseturl);
                }
            }
            else
            {
                this.m_target = this.GetAttachTarget();
            }
        }
    }

    public Deactive(force: boolean = false)
    {
        super.Deactive(force);

        let targetdata = this.data.target;
        if (targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_target.DeactiveBLK(this.data.target);
            this.m_ctx.targetObject.RemoveChild(this.m_target);
            this.m_ctx.runtime.domain.DestroyBlockTarget(targetdata);
        }

        this.m_target = null;
    }
}