import {KFScript, KFScriptContext} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../KFScriptFactory";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";
import {KFExpression} from "./KFExpression";

export class GSPlayStateScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSPlayStateScriptData"
        ,():KFScript=>{return new GSPlayStateScript();}
    ,(data, kfd, kfdtb)=>{
        data.type = new KFDName("GSPlayStateScriptData");
        data.group = KFScriptGroupType.Global;
        data.action = 0;
        data.stateid = 0;
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
        ,(data, kfd, kfdtb)=>{
            data.type = new KFDName("GSExpressionScriptData");
            data.group = KFScriptGroupType.Global;
        });

    public Execute(scriptdata: any, context: KFScriptContext = null): void
    {
        /// 目标对象
        let expr:KFExpression = scriptdata.expression;
        ///后面所有还回值要存到一个堆栈中
        expr.value(context.targetObject);
    }
}