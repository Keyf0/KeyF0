import {IKFGraphContext} from "../IKFGraphContext";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFActor} from "../../Actor/KFActor";
import {KFEvent} from "../../../Core/Misc/KFEventTable";

///c++里继承SCRIPTDATA可以在参数中传递
export class KFGraphBlockBase
{
    protected m_ctx:IKFGraphContext;

    public data:any;
    public nextname:KFDName;
    public mapnext:{[key:number]:any;};

    public OnEvent(evt:KFEvent, self:KFBlockTarget):void
    {

    }

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

    public Release(self:KFBlockTarget)
    {
        this.Deactive(self,true);
        this.m_ctx = null;
        this.data = null;
        this.nextname = null;
    }

    public Input(self:KFBlockTarget,arg:any)
    {
        //由子类处理
    }

    public Activate(self:KFBlockTarget):any{}
    public Deactive(self:KFBlockTarget,force:boolean = false) {}
    public Reset(self:KFBlockTarget){}

    public InputNext(self:KFBlockTarget,index:number,arg:any)
    {
        let outputs = this.data.outputs;
        if(outputs && outputs.length > index)
        {
            var inputname = outputs[index].name;
            if(inputname)
            this.m_ctx.Input(self, inputname, arg);
        }
    }

    public InputName(self:KFBlockTarget, outname:string, arg:any)
    {
        let nameid = KFDName._Strs.GetNameID(outname);
        if(this.mapnext == null)
        {
            this.mapnext = {};
            let outputs = this.data.outputs;
            if (outputs) {

                for (let i = 0; i < outputs.length; i++) {
                    let output = outputs[i];
                    let outfunc = output.func;

                    if (outfunc)
                    {
                        this.mapnext[outfunc.name.value] = output;
                    }
                }
            }
        }

        let outdata:any = this.mapnext[nameid];
        if(outdata)
        {
            let inputName:KFDName = outdata.name;
            this.m_ctx.Input(self, inputName, arg);
        }
    }

    protected OutNext(self:KFBlockTarget, arg:any)
    {
        if(this.nextname)
        {
            //LOG("NEXT INPUT {0}",this.nextname.toString());
            this.m_ctx.Input(self, this.nextname, arg);
        }
    }

    protected GetAttachTarget(self:KFActor):KFBlockTarget
    {
        let target:KFBlockTarget = null;
        if (this.data && this.m_ctx)
        {
            let tdata = this.data.target;

            if (tdata && tdata.option == KFBlockTargetOption.Attach)
            {
                let nameid:number = tdata.instname ? tdata.instname.value : 0;
                if(nameid != 0) {
                    target = self.FindChild(nameid);
                }else{
                    ///用URL做变量的获取方式可以绑定到变量的对象之上
                    let varname:string = tdata.asseturl;
                    if(varname && varname != ""){
                       let vardata = self.StrVar(varname);
                       if(vardata && vardata.blkref){
                           target = vardata.getValue();
                       }
                    }
                }
            }
            else
            {
                target = self;
            }
        }

        return target;
    }
}