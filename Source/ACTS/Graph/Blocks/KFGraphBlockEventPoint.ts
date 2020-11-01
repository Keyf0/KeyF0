import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFEvent} from "../../../Core/Misc/KFEventTable";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFActor} from "../../Actor/KFActor";
import {KFEventDispatcher} from "../../Event/KFEventDispatcher";


///事件不执行脚本是为了保持堆栈不被破坏
export class KFGraphBlockEventPoint extends KFGraphBlockBase
{
    public m_firenodeMap:{[key:number]:KFDName;};

    public Input(self:KFBlockTarget, arg: any)
    {
        this.Activate(self);
        this.OutNext(self, arg);
    }

    public OnEvent(evt: KFEvent, self: KFBlockTarget): void
    {
        if(!this.m_firenodeMap)
            return;
        let m_firenode = this.m_firenodeMap[evt.type.value];

        if(m_firenode)
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

            this.m_ctx.Input(self, m_firenode, evt.arg);

            if(OBJS){
                ///还原堆栈
                for (let i = 0;i < slen; i ++) {
                    OBJS[i + 1] = m_stacks[i];
                    i += 1;
                }
            }
        }
    }

    public GetEventDispatcher(self:KFBlockTarget):KFEventDispatcher{

        let etable:KFEventDispatcher = null;
        let m_evtscope = this.data.type;
        if (m_evtscope == KFGraphBlockType.EventPoint)
        {
            let m_target = this.GetAttachTarget(self as KFActor);
            if(m_target)
            {
                etable = m_target.etable;
            }
        }
        else {
            etable = this.m_ctx.runtime.etable;
        }

        return etable;
    }

    public Activate(self:KFBlockTarget)
    {
        let outputs = this.data.outputs;
        if (this.data && outputs.length > 1)
        {
            let etable:KFEventDispatcher = this.GetEventDispatcher(self);

            if (etable)
            {
                for(let i:number = 1; i < outputs.length; i++){
                    let output = outputs[i];
                    if(output.func || i == 1) {
                        let ename:KFDName = null;
                        if(output.func == null){
                            ename = this.data.name;
                        }else
                            ename = output.func.name;

                        if(false == etable.HasBlockListener(ename, self, this))
                        {
                            etable.AddBlockListener(ename, self, this);
                            if(this.m_firenodeMap == null)
                            {
                                this.m_firenodeMap = {};
                            }
                            this.m_firenodeMap[ename.value] = output.name;

                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    public Deactive(self:KFBlockTarget, force: boolean = false)
    {
        super.Deactive(self, force);
        let outputs = this.data.outputs;
        if (this.data && outputs.length > 1) {
            let etable: KFEventDispatcher = this.GetEventDispatcher(self);
            if (etable) {
                for (let i: number = 1; i < outputs.length; i++) {
                    let output = outputs[i];
                    if (output.func || i == 1) {
                        let ename: KFDName = null;
                        if (output.func == null) {
                            ename = this.data.name;
                        } else
                            ename = output.func.name;
                        etable.RemoveBlockListener(ename, self, this);
                    }
                }
            }
        }
    }
}