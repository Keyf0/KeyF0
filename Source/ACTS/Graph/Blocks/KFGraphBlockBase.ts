import {IKFGraphContext} from "../IKFGraphContext";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFDName} from "../../../KFData/Format/KFDName";
import {IKFRuntime} from "../../Context/IKFRuntime";
import {LOG} from "../../../Core/Log/KFLog";

export class KFGraphBlockBase
{
    protected m_ctx:IKFGraphContext;

    public data:any;
    public nextname:KFDName;

    public Create(ctx:IKFGraphContext, data:any)
    {
        this.m_ctx = ctx;
        this.data = data;

        if (this.m_ctx && this.data)
        {
            ///可以绑定加速，后面再优化
            let outputs = this.data.outputs;
            if(outputs && outputs.length > 0)
            {
                this.nextname = outputs[0].name;
            }
        }
    }

    public Release()
    {
        this.Deactive(true);
        this.m_ctx = null;
        this.data = null;
        this.nextname = null;
    }

    public Input(arg:any)
    {
        //由子类处理
    }

    public Activate(){}
    public Deactive(force:boolean = false) {}
    public Reset(){}

    protected OutNext(arg:any)
    {
        if(this.nextname)
        {
            //LOG("NEXT INPUT {0}",this.nextname.toString());
            this.m_ctx.Input(this.nextname, arg);
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
                let nameid:number = tdata.instname ? tdata.instname.value : 0;
                if(nameid != 0) {
                    target = this.m_ctx.targetObject.FindChild(nameid);
                }else{
                    ///用URL做变量的获取方式可以绑定到变量的对象之上
                    let varname:string = tdata.asseturl;
                    if(varname && varname != ""){
                       let vardata = this.m_ctx.targetObject.StrVar(varname);
                       if(vardata && vardata.blkref){
                           target = vardata.getValue();
                       }
                    }
                }
            }
            else
            {
                target = <KFBlockTarget>this.m_ctx.targetObject;
            }
        }

        return target;
    }
}