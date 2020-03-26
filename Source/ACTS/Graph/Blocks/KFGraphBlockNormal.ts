import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";


export class KFGraphBlockNormal extends KFGraphBlockBase
{
    private m_target:KFBlockTarget = null;

    public Input(arg: any)
    {
        let t = this.m_target;
        if(t == null) {
            this.Activate();
        }
        t = this.m_target;
        if(t) {
            let fd = this.data.frame;
            if(fd && fd.scripts.length > 0) {

                let script = this.m_ctx.script;
                ///填充第一位寄存器
                script._reg._OBJECTS[0] = arg;
                ///强制读取一个参数
                if(fd.paramsize == 0){fd.paramsize = 1;}
                script.ExecuteFrameScript(0, fd, t);
            }
        }
        this.OutNext(arg);
    }

    public Activate()
    {
        let targetdata = this.data.target;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_target = this.m_ctx.targetObject.CreateChild(targetdata);
        }
        else {
            this.m_target = this.GetAttachTarget();
        }
    }

    public Deactive(force: boolean = false)
    {
        let targetdata = this.data.target;
        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            this.m_ctx.targetObject.DeleteChild(this.m_target);
        }

        this.m_target = null;
    }
}