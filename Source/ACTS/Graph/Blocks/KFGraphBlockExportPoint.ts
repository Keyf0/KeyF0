import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFEvent, KFEventTable} from "../../../Core/Misc/KFEventTable";
import {LOG} from "../../../Core/Log/KFLog";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFActor} from "../../Actor/KFActor";

export class KFGraphBlockExportPoint extends KFGraphBlockBase
{
        public Input(self:KFBlockTarget, arg: any)
        {
            //LOG("EXEC {0}", this.data.name.toString());
            let outtype = this.data.type;
            if(outtype != KFGraphBlockType.InputPoint)
            {
              let etable:KFEventTable = null;
              let target = this.GetAttachTarget(self as KFActor);
              if(target) {
                  let fd = this.data.frame;
                  if(fd && fd.scripts.length > 0) {
                      let script = this.m_ctx.script;
                      ///填充第一位寄存器
                      script._reg._OBJECTS[0] = arg;
                      ///强制读取一个参数
                      if(fd.paramsize == 0){fd.paramsize = 1;}
                      script.ExecuteFrameScript(0, fd, target);
                      arg = script._reg._OBJECTS[0];
                  }
              }

              if (outtype == KFGraphBlockType.OutputPoint) {
                  if (target) {
                      etable = target.etable;
                      LOG("READY SELF FIRE");
                  }
              }
              else {
                  LOG("READY RUNTIME FIRE:{0}",outtype);
                  etable = this.m_ctx.runtime.etable;
              }

              if (etable) {
                  LOG("OUT FIRE:{0} {1}",this.data.name.toString(), this.data.name.value);

                  let ShareEvent:KFEvent = KFEvent.ShareEvent;
                  ShareEvent.type.value = this.data.name.value;
                  ShareEvent.arg = arg;
                  etable.FireEvent(ShareEvent);
              }
          }

            this.OutNext(self, arg);
        }
}