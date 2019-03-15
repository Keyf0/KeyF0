import {KFRegister} from "./ExecCode/KFRegister";
import {KFDName} from "../KFData/Format/KFDName";

export interface KFScriptContext
{
    runtime():any;
    GetThis():any;
    /// 当前的寄存器
    GetRegister():KFRegister;
    /// 设置寄存器
    PushRegister(paramnum:number, varsize:number):KFRegister;
    PopRegister():KFRegister;
    CallProperty(name:string, codeline:any):void;
    ExecuteFrameScript(id:number,framedata:any,context:KFScriptContext):void;
    Execute(scriptData:any, context:KFScriptContext):void;
    ExecCodeLine(codeline:any, context:KFScriptContext):void;
}

export class KFScript
{
     public Execute(scriptdata:any
                    , context:KFScriptContext = null):void
     {
         
     }

     /*销毁这个脚本前*/
     public Destory():boolean
     {
         return true;
     }

     /*一定要定义一个脚本集*/
     public GetScriptTypes():Array<KFDName>
     {
         return this.m_scripttypes;
     }

     protected m_scripttypes = new Array<KFDName>();
}