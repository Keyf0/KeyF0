import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFEvent, KFEventTable} from "../../../Core/Misc/KFEventTable";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {IKFGraphContext} from "../IKFGraphContext";


export class BindEventFunc {

    public m_evtname:KFDName;
    public m_firenode:KFDName;
    public m_ctx:IKFGraphContext;
    public m_etb:KFEventTable;

    public constructor(evt:KFDName, etb:KFEventTable, outname:KFDName, ctx:IKFGraphContext)
    {
        this.m_evtname = evt;
        this.m_firenode = outname;
        this.m_ctx = ctx;
        this.m_etb = etb;

        etb.AddEventListener(evt, this.OnEvent, this);
    }

    public Dispose(){
        if(this.m_etb){
            this.m_etb.RemoveEventListener(this.m_evtname,this.OnEvent);
            this.m_etb = null;
        }
    }

    public OnEvent(evt:KFEvent):void
    {
        if(this.m_firenode)
        {
            let statcks = evt.stacks;
            let OBJS = null;
            let slen = 0;
            let m_stacks:any[];

            if(statcks) {
                slen = statcks.length;
                if(slen > 0) {
                    ///压入堆栈 此
                    m_stacks = [];
                    let script = this.m_ctx.script;
                    let i = 1;
                    OBJS = script._reg._OBJECTS;
                    for (let arg0 of statcks) {
                        m_stacks[i - 1] = OBJS[i];
                        OBJS[i] = arg0;
                        i += 1;
                    }
                }
            }

            this.m_ctx.Input(this.m_firenode, evt.arg);

            if(OBJS){
                ///还原堆栈
                for (let i = 0;i < slen; i ++) {
                    OBJS[i + 1] = m_stacks[i];
                    i += 1;
                }
            }
        }
    };
}

///事件不执行脚本是为了保持堆栈不被破坏
export class KFGraphBlockEventPoint extends KFGraphBlockBase
{
    private m_target:KFBlockTarget;
    private m_bindevents:BindEventFunc[];


    public Input(arg: any)
    {
        if(this.m_target == null)
        {
            this.Activate();
        }
        this.OutNext(arg);
    }

    public Activate()
    {
        super.Activate();

        let outputs = this.data.outputs;
        if (this.data && outputs.length > 1)
        {
            let  m_evtscope = this.data.type;

            let etable:KFEventTable = null;

            if (m_evtscope == KFGraphBlockType.EventPoint) {
                this.m_target = this.GetAttachTarget();
                if(this.m_target)
                    etable = this.m_target.etable;
            }
            else  {
                etable = this.m_ctx.runtime.etable;
            }

            if (etable) {
                if(this.m_bindevents == null)
                    this.m_bindevents = [];

                for(let i:number = 1; i < outputs.length; i++){
                    let output = outputs[i];
                    if(output.func || i == 1) {
                        let ename:KFDName = null;
                        if(output.func == null){
                            ename = this.data.name;
                        }else
                            ename = output.func.name;

                        let bindevt: BindEventFunc = new BindEventFunc(ename
                            , etable, output.name, this.m_ctx);
                        this.m_bindevents.push(bindevt);
                    }
                }
            }

        }
    }

    public Deactive(force: boolean = false)
    {
        super.Deactive(force);

        if (this.m_bindevents != null)
        {
            for(let i:number = 0;i < this.m_bindevents.length ;i ++){
                let bindevt:BindEventFunc = this.m_bindevents[i];
                bindevt.Dispose();
            }
            this.m_bindevents = null;
            this.m_target = null;
        }
    }
}