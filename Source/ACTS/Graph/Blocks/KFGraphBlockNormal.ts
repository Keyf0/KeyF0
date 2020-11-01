import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFActor} from "../../Actor/KFActor";

export class KFGraphBlockNormal extends KFGraphBlockBase
{
    private InitCreateName(target:KFBlockTarget)
    {
        target.name = new KFDName(this.data.name.toString() + "@" + target.sid);
    }

    public Input(self:KFBlockTarget, arg: any)
    {
        let m_target = this.Activate(self);

        if(m_target)
        {
            let fd = this.data.frame;
            let scripts = fd ? fd.scripts : null;

            if(scripts && scripts.length > 0)
            {
                let script = this.m_ctx.script;
                ///填充第一位寄存器 需要先保存之前的参数
                ///执行完后再填充
                let OBJS = script._reg._OBJECTS;

                let Arg0 = OBJS[0];
                OBJS[0] = arg;
                let bcache = script.block;

                let bcurr = bcache.current;
                let bself = bcache.self;

                bcache.current = this;
                bcache.self = self;

                ///强制读取一个参数
                if(fd.paramsize < 1){fd.paramsize = 1;}
                script.ExecuteFrameScript(0, fd, m_target);

                OBJS[0] = Arg0;
                bcache.current = bcurr;
                bcache.self = bself;
            }
        }

        this.OutNext(self,arg);
    }

    public Activate(self:KFBlockTarget):any
    {
        let m_target = null;
        let targetdata = this.data.target;
        let selfActor:KFActor = self as KFActor;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            ///没有命名的实例可以随意创建
            let instname: KFDName = this.data.instname;
            let instval = instname ? instname.value : 0;
            if (instval > 0)
            {
                m_target = selfActor.FindChild(instval);
            }

            if(m_target == null)
            {
                m_target = selfActor.CreateChild(targetdata,null, this.InitCreateName.bind(this));
            }
        }
        else {
            m_target = this.GetAttachTarget(selfActor);
        }

        return m_target;
    }

    public Deactive(self:KFBlockTarget, force: boolean = false)
    {
        let targetdata = this.data.target;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            let container:KFActor = self as KFActor;
            let instname: KFDName = this.data.instname;

            if (instname == null || instname.value == 0)
            {
                container.DeleteChildrenBySuffix(this.data.name.toString() + "@");
            }
            else {
                let m_target = this.GetAttachTarget(container);
                if (m_target)
                {
                    container.DeleteChild(m_target);
                }
            }
        }
    }
}