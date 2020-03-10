import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {LOG_ERROR} from "../../../Core/Log/KFLog";


export class KFGraphBlockNormal extends KFGraphBlockBase
{
    private m_target:KFBlockTarget = null;

    public Input(arg: any)
    {
        super.Input(arg);

        if(this.m_target == null)
        {
            this.Activate();
        }

        if(this.m_target)
        {
            let script = this.m_target.script;
            let framedata = this.data.frame;
            this.m_ctx.script.ExecuteFrameScript(0, framedata,this.m_target);
        }

        this.OutNext(arg);
    }

    public Activate()
    {
        super.Activate();

        let targetdata = this.data.target;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_target = this.m_ctx.targetObject.CreateChild(targetdata);
            if (this.m_target == null)
            {
                LOG_ERROR("Cannot Create BlockTarget:{0}", targetdata.asseturl);
            }
        } else {
            this.m_target = this.GetAttachTarget();
        }
    }

    public Deactive(force: boolean = false)
    {
        super.Deactive(force);

        let targetdata = this.data.target;
        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_ctx.targetObject.DeleteChild(this.m_target,targetdata);
        }

        this.m_target = null;
    }
}