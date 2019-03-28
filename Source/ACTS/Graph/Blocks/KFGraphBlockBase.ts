import {IKFGraphContext} from "../IKFGraphContext";

export class KFGraphBlockBase
{
    protected m_ctx:IKFGraphContext;

    protected m_outputs:Array<KFGraphBlockBase> = new Array<KFGraphBlockBase>();
    protected m_mapOutputs:{[key:number]:KFGraphBlockBase} = {};

    public data:any;
    public label:string;

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
        this.m_outputs = new Array<KFGraphBlockBase>(data.outputs.length);
        this.m_mapOutputs = {};
        this.label = data.label;
    }

    public BindOutput(i:number, target:KFGraphBlockBase)
    {
        this.m_outputs[i] = target;
    }

    public Input(arg:any)
    {
        this.m_ctx.SetInputRegister(arg);
        //由子类处理
    }

    public Activate(){}
    public Deactive(force:boolean = false) {}
    public Tick(){}
    public Reset(){}

    protected FireOutput(i:number, arg:any)
    {
        if (arg)
        {
            //LOG_WARNING("%s.Output[%d] = %s", m_label.c_str(), i, arg->type.c_str());
        }
        else
        {
            //LOG_WARNING("%s.Output[%d] = null", m_label.c_str(), i);
        }

        if (i >= this.data.outputs.length || i < 0)
            return;

        let output = this.data.outputs[i];

        if (    output.type != ""
            &&  output.type != "void")
        {
            if (!(arg))
            {
                //LOG_ERROR("Output data is null! %s:%d", m_label.c_str(), i);
                return;
            }
        }

        output = this.m_outputs[i];
        if (output)
        {
            output.Input(arg);
        }
    }

    protected FireOutputId(id:number, arg:any)
    {
        let it =  this.m_mapOutputs[id];
        if(it == null) return;

        it.Input(arg);
    }
}