import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFDName} from "../../../KFData/Format/KFDName";


export class KFGraphBlockNormal extends KFGraphBlockBase
{
    private m_target:KFBlockTarget;
    private m_Instancs:KFBlockTarget[];

    public Input(arg: any)
    {
        ///没有命名的实例可以随意创建
        let targetdata = this.data.target;
        if(targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            let instname: KFDName = this.data.instname;
            if (instname == null || instname.value == 0)
            {
                if (this.m_target)
                {
                    if (this.m_Instancs == null)
                        this.m_Instancs = [];
                    this.m_Instancs.push(this.m_target);
                    this.m_target = null;
                }
            }
        }

        if(this.m_target == null)
        {
            this.Activate();
        }

        if(this.m_target)
        {
            let fd = this.data.frame;
            if(fd && fd.scripts.length > 0)
            {
                let script = this.m_ctx.script;
                ///填充第一位寄存器 需要先保存之前的参数
                ///执行完后再填充
                let OBJS = script._reg._OBJECTS;
                let Arg0 = OBJS[0];
                let Arg1 = OBJS[1];
                OBJS[0] = arg;
                OBJS[1] = this;
                ///强制读取一个参数
                if(fd.paramsize < 2){fd.paramsize = 2;}
                script.ExecuteFrameScript(0, fd, this.m_target);
                OBJS[0] = Arg0;
                OBJS[1] = Arg1;
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
            let container = this.m_ctx.targetObject;
            container.DeleteChild(this.m_target);

            if(this.m_Instancs)
            {
                for(let i:number = 0;i < this.m_Instancs.length ;i ++){
                    container.DeleteChild(this.m_Instancs[i]);
                }
                this.m_Instancs = null;
            }
        }

        this.m_target = null;
    }
}