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
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=TSControlMoveData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=1,OR=1,ENUM=KFScriptGroupType,TYPE=int8)

///KFD(P=1,NAME=stop,CNAME=停止,TYPE=bool,DEFAULT=false)
///KFD(P=2,NAME=dir,CNAME=朝向,TYPE=object,OTYPE=kfVector3)
///KFD(P=3,NAME=speed,CNAME=速度,TYPE=num1)
///KFD(P=4,NAME=update,CNAME=更新,TYPE=bool,DEFAULT=true)
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
                    case 3:
                        sd.update = objs[i - 1];
                        break;
                }
            }
        });

    public v:{x:number,y:number,speed:number,nx:number,ny:number};
    public update:boolean;
    ///运行保持时间
    private _keeptime:number;

    private ChgSpeed(sd:any) {
        ///重新设置速度
        let speed = sd.speed;
        let dir = sd.dir;
        let v = this.v;
        if(!v) {
            v = {
                x: speed * dir.x
                , y: speed * dir.y
                , speed: speed
                , nx: dir.x
                , ny: dir.y
            };
            this.v = v;
        }
        else {
            v.x = speed * dir.x;
            v.y = speed * dir.y;
            v.nx = dir.x;
            v.ny = dir.y;
            v.speed = speed;
        }

        this._keeptime = 500;
        this.update = sd.update != false;
    }

    public Execute(sd: any, context: KFScriptContext = null): void {
        if(this.isrunning) {
            if(sd.stop){this.isrunning = false;}
            else {this.ChgSpeed(sd);}
        }
        else {

            super.Execute(sd, context);
            this.ChgSpeed(sd);
        }
    }

    public Update(frameindex: number) {
        if(this.isrunning) {
            let tp = this.m_t.position;
            let v = this.v;
            tp.x += v.x;
            tp.y += v.y;

            ///有时候可能不需要更新渲染
            if(this.update) {
                this.m_t.set_position();
            }

            if(this._keeptime <= 0) {
                let speed = v.speed;

                speed -= 0.3;


                if(speed <= 0) {
                    v.x = 0;
                    v.y = 0;
                    v.speed = 0;
                    this.isrunning = false;
                }
                else {

                    v.speed = speed;
                    v.x = speed * v.nx;
                    v.y = speed * v.ny;
                }
            }else
                this._keeptime -= this.m_fixtpf;
        }
    }

}