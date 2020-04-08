import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFEvent, KFEventTable} from "../../../Core/Misc/KFEventTable";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";

export class KFGraphBlockEventPoint extends KFGraphBlockBase
{
    private m_evthandler:any = null;
    private m_evtname:KFDName;
    private m_target:KFBlockTarget = null;
    private m_firenode:KFDName = null;
    private m_stacks:any[];

    public Input(arg: any)
    {
        if(this.m_target == null)
        {
            this.Activate();
            
            let outputs = this.data.outputs;
            if(outputs && outputs.length > 1) {
                this.m_firenode = outputs[1].name;
            }
        }
        this.OutNext(arg);
    }

    public Activate()
    {
        super.Activate();

        if (this.data && this.m_evthandler == null)
        {
            let  m_evtscope = this.data.type;
            this.m_evtname = this.data.name;

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

                let self = this;
                this.m_evthandler = function (evt:KFEvent)
                {
                    if(self.m_firenode) {

                        let statcks = evt.stacks;
                        let OBJS = null;
                        let slen = 0;

                        if(statcks) {
                            slen = statcks.length;
                            if(slen > 0) {
                                ///压入堆栈
                                if (!this.m_stacks)
                                    this.m_stacks = [];
                                let script = this.m_ctx.script;
                                let i = 1;
                                OBJS = script._reg._OBJECTS;
                                for (let arg0 of statcks) {
                                    this.m_stacks[i - 1] = OBJS[i];
                                    OBJS[i] = arg0;
                                    i += 1;
                                }
                            }
                        }

                        self.m_ctx.m_graph.Input(self.m_firenode, evt.arg);

                        if(OBJS){
                            ///还原堆栈
                            for (let i = 0;i < slen; i ++) {
                                OBJS[i + 1] = this.m_stacks[i];
                                i += 1;
                            }
                        }
                    }
                };

                etable.AddEventListener(this.m_evtname
                , this.m_evthandler);
            }


        }
    }

    public Deactive(force: boolean = false)
    {
        super.Deactive(force);

        if (this.m_evthandler != null)
        {
            let m_evtscope = this.data.type;
            let etable:KFEventTable = null;

            if (m_evtscope == KFGraphBlockType.EventPoint)
            {
                this.m_target = this.GetAttachTarget();
                if(this.m_target)
                    etable = this.m_target.etable;
            }
            else
            {
                etable = this.m_ctx.runtime.etable;
            }


            if (etable)
            {
                etable.RemoveEventListener(this.m_evtname
                , this.m_evthandler);
            }

            this.m_evthandler = null;
            this.m_evtname = null;
            this.m_target = null;
        }
    }
}