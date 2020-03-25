import {KFScript, KFScriptContext, KFScriptData} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../KFScriptFactory";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";
import {KFExpression} from "./KFExpression";
import {BlkExecSide} from "../../Context/KFBlockTarget";

export class GSPlayStateScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSPlayStateScriptData"
        ,():KFScript=>{return new GSPlayStateScript();}
        , KFScriptGroupType.Global
        ,(data, kfd, kfdtb)=>{
        data.type = new KFDName("GSPlayStateScriptData");
        data.group = KFScriptGroupType.Global;
        data.action = 0;
        data.stateid = 0;
    }
    ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.action = objs[i - 1];
                        break;
                    case 1:
                        sd.stateid = objs[i - 1];
                        break;
                }
            }
        });

    public Execute(scriptdata: any, context: KFScriptContext = null): void
    {
        if(scriptdata.action == 0)
        {
            context.targetObject.timeline.Play(scriptdata.stateid);
        }
        else {
            context.targetObject.timeline.playing = false;
        }
    }
}


///KFD(C,CLASS=GSExpressionScriptData,CNAME=执行,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSExpressionScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=expression,CNAME=表达式,TYPE=object,OTYPE=KFExpression)
///KFD(*)

export class GSExpressionScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSExpressionScriptData"
        ,():KFScript=>{return new GSExpressionScript();}
        ,KFScriptGroupType.Global,null
    ,(sd:any,objs:any[],pints:number[])=>{
            sd.expression = objs[0];
        });

    public Execute(scriptdata: any, context: KFScriptContext = null): void {
        /// 目标对象
        let expr:KFExpression = scriptdata.expression;
        ///后面所有还回值要存到一个堆栈中
        expr.value(context.targetObject,true);
    }
}

///KFD(C,CLASS=GSRemoteScriptData,CNAME=远程脚本,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSRemoteScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=data,CNAME=脚本数据,TYPE=mixobject,OTYPE=KFScriptData)
///KFD(P=2,NAME=execSide,CNAME=发送,DEFAULT=3,TYPE=uint8,ENUM=BlkExecSide)
///KFD(*)


export class GSRemoteScript extends KFScript {

    public static Meta:ScriptMeta = new ScriptMeta("GSRemoteScriptData"
        ,():KFScript=>{return new GSRemoteScript();}
        , KFScriptGroupType.Global, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.data = objs[i - 1];
                        break;
                    case 1:
                        sd.execSide = objs[i - 1];
                        break;
                }
            }
        });

    public Execute(sd: any, context: KFScriptContext = null): void {
        //是否从堆栈中获取数据
        let rsd = sd.data;
        let pints:number[] = rsd.paramInts;
        if(pints && pints[0] == KFScriptData.WAITR_S) {
            ///等待读取stack
            let rfs = KFScriptData.RFS[rsd.type.value];
            if(rfs) {rfs(sd,context._reg._OBJECTS,pints);}
        }

        let toj = context.targetObject;
        //public rpcc_exec:(scriptdata:any)=>any;
        //public rpcs_exec:(scriptdata:any)=>any;
        if(toj.rpcc_exec) {
            ///调用服务器
            let eside = sd.execSide;
            switch (eside) {
                case BlkExecSide.SERVER:
                    toj.rpcs_exec(rsd);
                    break;
                case BlkExecSide.CLIENT:
                    toj.rpcc_exec(rsd);
                    break;
                case BlkExecSide.BOTH:
                    toj.Exec(rsd);
                    break;
                default:
                    break;
            }
        }
    }

}