import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFEvent, KFEventTable} from "../../../Core/Misc/KFEventTable";


export class KFGraphBlockExportPoint extends KFGraphBlockBase
{

        private  m_evtdata:KFEvent = new KFEvent();

        public Input(arg: any)
        {
          super.Input(arg);

          let outtype = this.data.type;
          if(outtype != KFGraphBlockType.InputPoint)
          {
              let etable:KFEventTable = null;

              if (outtype == KFGraphBlockType.EventPointGlobal)
              {
                  etable = this.m_ctx.runtime.root().etable;
              }
              else if (outtype == KFGraphBlockType.EventPointDomain)
              {
                  etable = this.m_ctx.runtime.etable;
              }
              else
              {
                  let target = this.GetAttachTarget();
                  if (target)
                      etable = target.etable;
              }

              if (etable)
              {
                  this.m_evtdata.type.value = this.data.name.value;
                  this.m_evtdata.arg = arg;

                  etable.FireEvent(this.m_evtdata);
              }
          }
          else
          {
              this.OutNext(arg);
          }

        }
}