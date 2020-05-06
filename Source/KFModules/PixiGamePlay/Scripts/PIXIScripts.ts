import {KFTargetScript} from "../../../ACTS/Script/KFScriptSystem";
import {KFScript, KFScriptContext} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../../../ACTS/Script/KFScriptFactory";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";
import {LOG_ERROR} from "../../../Core/Log/KFLog";
import {KFEvent} from "../../../Core/Misc/KFEventTable";
import {IKFBlockTargetContainer, KFBlockTarget} from "../../../ACTS/Context/KFBlockTarget";
import {PIXINetActor} from "../PIXINetActor";

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
    public aimx:number;
    public aimy:number;

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
            let target = <any>this.m_t;
            let ve = target.velocity;
            let speed = target.maxVelocity;

            if(this.aimx != tp.x || this.aimy != tp.y) {
                this.aimx = tp.x;
                this.aimy = tp.y;

                ve.x = this.aimx - pos.x;
                ve.y = this.aimy - pos.y;
                ve.nor();
                ve.mul2(speed);
            }

            let dx = tp.x - pos.x;
            let dy = tp.y - pos.y;
            if(dx * dx + dy * dy < speed * speed){
                pos.x = tp.x;
                pos.y = tp.y;
            }else {
                pos.x = pos.x + ve.x;
                pos.y = pos.y + ve.y;
            }

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
///KFD(P=4,NAME=update,CNAME=更新位置,TYPE=bool,DEFAULT=true)
///KFD(P=5,NAME=event,CNAME=发送事件,TYPE=bool,DEFAULT=false)
///KFD(P=6,NAME=time,CNAME=持续时间,TYPE=int32,DEFAULT=500)
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
                    case 4:
                        sd.event = objs[i - 1];
                        break;
                    case 5:
                        sd.time = objs[i - 1];
                        break;
                }
            }
        });

    public v:{x:number,y:number,speed:number,nx:number,ny:number};
    public update:boolean;
    public event:boolean;
    ///运行保持时间
    private _keeptime:number;
    private _event:KFEvent;
    // 第一位表示左右 第二位表示上下 第三位表示是否有有速度
    private _speedType:number = 0;
    private _fixTPF:number;

    private ChgSpeed(sd:any) {

        if(!sd.dir){

            LOG_ERROR("sd.dir==null");
        }

        ///重新设置速度
        let speed = sd.speed / 100 * this._fixTPF;
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

        let keep = sd.time ? sd.time : 500;
        if(keep == -1) keep = Number.MAX_VALUE;

        this._keeptime = keep;
        this.update = sd.update != false;

        if(this.event) {

            let lrflag = (v.x > 0 ? 0 : 1);
            let udflag = (v.y > 0 ? 0 : 2);
            let hasflag = (v.y != 0 || v.x != 0) ? 4 : 0;
            let currflag = 0;
            if (hasflag != 0) {
                currflag = hasflag | lrflag | udflag;
            }
            if(currflag != this._speedType) {
                this._speedType = currflag;
                this.FireSpeedEvent(this._speedType);
            }
        }
    }

    private FireSpeedEvent(type:number = 0){
        if(this.event) {
            if(!this._event) {
                this._event = new KFEvent("onSpeedChange");
            }
            this._event.arg = type;
            this.m_t.etable.FireEvent(this._event);
        }
    }

    public Execute(sd: any, context: KFScriptContext = null): void {
        if(this.isrunning) {
            if(sd.stop)
            {
                this.isrunning = false;
                this.FireSpeedEvent(0);
            }
            else {this.ChgSpeed(sd);}
        }
        else {
            super.Execute(sd, context);

            this.event = sd.event;
            this._speedType = -1;
            this._fixTPF = context.runtime.fixtpf;

            if(!sd.stop) {
                this.ChgSpeed(sd);
            }else{
                this.isrunning = false;
                this.FireSpeedEvent(0);
            }
        }
    }

    public Update(frameindex: number) {
        if(this.isrunning) {

            let tp = this.m_t.position;
            let v = this.v;
            tp.x += v.x;
            tp.y += v.y;

            this.m_t.set_position();

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


///KFD(C,CLASS=GSCreateBLKData,CNAME=创建物件,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSCreateBLKData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)

///KFD(P=1,NAME=c,CNAME=容器,TYPE=null)
///KFD(P=2,NAME=url,CNAME=路径,TYPE=kfstr)
///KFD(P=3,NAME=pos,CNAME=坐标,TYPE=object,OTYPE=kfVector3)
///KFD(P=4,NAME=v,CNAME=速度[含大小],TYPE=object,OTYPE=kfVector3)
///KFD(P=5,NAME=r,CNAME=朝向,TYPE=object,OTYPE=kfVector3)
///KFD(P=6,NAME=life,CNAME=生命周期,TYPE=int32,DEFAULT=-1)
///KFD(P=7,NAME=n,CNAME=实例名,TYPE=kfname)
///KFD(P=8,NAME=attrs,CNAME=动态属性,TYPE=arr,OTYPE=eAttribDef)
///KFD(*)

export class GSCreateBLK extends KFScript {

    public static Meta:ScriptMeta = new ScriptMeta("GSCreateBLKData"
        ,():KFScript=>{return new GSCreateBLK();}
        , KFScriptGroupType.Global, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){

                let opint = pints[i];
                switch (opint) {
                    case 0:
                        sd.c = objs[i - 1];
                        break;
                    case 1:
                        sd.url = objs[i - 1];
                        break;
                    case 2:
                        sd.pos = objs[i - 1];
                        break;
                    case 3:
                        sd.v = objs[i - 1];
                        break;
                    case 4:
                        sd.r = objs[i - 1];
                        break;
                    case 5:
                        sd.life = objs[i - 1];
                        break;
                    case 6:
                        sd.n = objs[i - 1];
                        break;

                    default:
                        let attr = sd.attrs[opint - 7];
                        if(attr){
                            attr.setValue(objs[i - 1]);
                        }
                        break;
                }
            }
        });

    private _tdata:any = {};

    private _InitT(    sd: any
                    , tg:KFBlockTarget
                    , t:KFBlockTarget) {

        let arg = sd.v;
        if(arg){
            let tv = (<PIXINetActor>t).velocity;
            tv.x = arg.x;
            tv.y = arg.y;
            tv.z = arg.z;}
        arg = sd.life;
        if(arg){(<PIXINetActor>t).lifeTime = arg;}
        ///动态属性参数也需要填充
        let attrs = sd.attrs;
        let size = attrs ? attrs.length: 0;
        for(let i = 0; i < size; i ++){
            let attr = attrs[i];
            let varv = t.vars[attr.name];
            if(varv){varv.setValue(attr.value);}
        }
    }

    public Execute(sd: any, ctx: KFScriptContext = null): any {

        let c:IKFBlockTargetContainer = sd.c;
        let tg:any = ctx.targetObject;

        if(c == null){c = tg;}

        let tdata = this._tdata;
        tdata.asseturl = sd.url;
        tdata.instname = sd.n;

        let blk:KFBlockTarget = c.CreateChild(tdata,null, this._InitT.bind(this,sd,tg));
        if(blk)
        {
            let arg:any = sd.pos;
            ///位置是相对位置
            let newpos = blk.position;
            let tgpos = tg.position;

            if(arg) {
                newpos.x = arg.x + tgpos.x;
                newpos.y = arg.y + tgpos.y;
                newpos.z = arg.z + tgpos.z;
            } else {
                newpos.x = tgpos.x;
                newpos.y = tgpos.y;
                newpos.z = tgpos.z;
            }

                 blk.set_position(newpos);

                arg = sd.r;
                if(arg){blk.set_rotation(arg);}

                return  blk.sid
            }

        return 0;
    }

}


