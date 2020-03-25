import {KFTargetScript} from "../../../ACTS/Script/KFScriptSystem";
import {KFScript, KFScriptContext} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../../../ACTS/Script/KFScriptFactory";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";

///KFD(C,CLASS=TSSmoothMoveData,CNAME=2D平滑移动,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=TSSmoothMove,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=1,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=stop,CNAME=停止,TYPE=bool,DEFAULT=false)
///KFD(*)

export class TSSmoothMove extends KFTargetScript {

    public static Meta:ScriptMeta = new ScriptMeta("TSSmoothMoveData"
        ,():KFScript=>{return new TSSmoothMove();}
        , KFScriptGroupType.Target, null
        ,(sd:any,objs:any[],pints:number[])=>{
            sd.stop = objs[0];
        });

    public p:{x:number,y:number};

    public Execute(scriptdata: any, context: KFScriptContext = null): void {
        if(this.isrunning) {
            if(scriptdata.stop){this.isrunning = false;}
        }
        else {
            super.Execute(scriptdata, context);
            let pos = this.m_t.position;
            this.p = {x:pos.x,y:pos.y};
            this.m_t.set_position(this.p);
        }
    }

    public Update(frameindex: number) {
        if(this.isrunning) {
            let pos = this.p;
            let tp = this.m_t.position;
            pos.x = pos.x + (tp.x - pos.x) / 4;
            pos.y = pos.y + (tp.y - pos.y) / 4;
            this.m_t.set_position(pos);
        }
    }
}


///KFD(C,CLASS=TSControlMoveData,CNAME=2D移动控制,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=TSSmoothMove,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=1,OR=1,ENUM=KFScriptGroupType,TYPE=int8)

///KFD(P=1,NAME=stop,CNAME=停止,TYPE=bool,DEFAULT=false)
///KFD(P=2,NAME=dir,CNAME=朝向,TYPE=object,OTYPE=kfVector3)
///KFD(P=3,NAME=speed,CNAME=速度,TYPE=num1)
///KFD(*)

export class TSControlMove extends KFTargetScript {

    public static Meta:ScriptMeta = new ScriptMeta("TSControlMoveData"
        ,():KFScript=>{return new TSControlMove();}
        , KFScriptGroupType.Target, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.stop = objs[i - 1];
                        break;
                    case 1:
                        sd.dir = objs[i - 1];
                        break;
                    case 2:
                        sd.speed = objs[i - 1];
                        break;
                }
            }
        });

    public v:{x:number,y:number};

    public Execute(scriptdata: any, context: KFScriptContext = null): void {
        if(this.isrunning) {
            if(scriptdata.stop){this.isrunning = false;}
            else {
                ///重新设置速度
                let speed = scriptdata.speed;
                this.v = {x:speed.x,y:speed.y};
            }
        }
        else {
            super.Execute(scriptdata, context);
            let speed = scriptdata.speed;
            this.v = {x:speed.x,y:speed.y};
        }
    }

    public Update(frameindex: number) {
        if(this.isrunning) {
            let tp = this.m_t.position;
            let v = this.v;
            tp.x += v.x;
            tp.x += v.y;
        }
    }

}