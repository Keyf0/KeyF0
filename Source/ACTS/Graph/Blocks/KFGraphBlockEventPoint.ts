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
                    if(self.m_firenode)
                        self.m_ctx.m_graph.Input(self.m_firenode, evt.arg);
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