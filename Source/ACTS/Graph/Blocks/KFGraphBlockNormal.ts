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
            let framedata = this.data.frame;

            if(framedata && framedata.scripts.length > 0) {
                this.m_ctx.script.ExecuteFrameScript(0, framedata, this.m_target);
            }
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
        }
        else
            {
            this.m_target = this.GetAttachTarget();
        }
    }

    public Deactive(force: boolean = false)
    {
        super.Deactive(force);

        let targetdata = this.data.target;
        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_ctx.targetObject.DeleteChild(this.m_target);
        }

        this.m_target = null;
    }
}