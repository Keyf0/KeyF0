import {KFGraphBlockBase} from "./KFGraphBlockBase";
import {KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFEvent, KFEventTable} from "../../../Core/Misc/KFEventTable";
import {LOG} from "../../../Core/Log/KFLog";


export class KFGraphBlockExportPoint extends KFGraphBlockBase
{
        private m_evt:KFEvent = new KFEvent();

        public Input(arg: any)
        {
            let outtype = this.data.type;
            if(outtype != KFGraphBlockType.InputPoint) {

              let etable:KFEventTable = null;
              let target = this.GetAttachTarget();
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

              if (outtype == KFGraphBlockType.EventPoint) {
                  if (target) {
                      etable = target.etable;
                  }
              }
              else {
                  etable = this.m_ctx.runtime.etable;
              }

              if (etable) {
                  this.m_evt.type.value = this.data.name.value;
                  this.m_evt.arg = arg;
                  etable.FireEvent(this.m_evt);
              }
          }

            this.OutNext(arg);
        }
}