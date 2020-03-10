import {KFRegister} from "./ExecCode/KFRegister";
import {KFDName} from "../KFData/Format/KFDName";

export interface KFScriptContext
{
    ///当前运行时
    runtime:any;
    ///当前对象
    targetObject:any;
    /// 当前的寄存器
    thisRegister:KFRegister;
    /// 设置寄存器
    PushRegister(paramnum:number, varsize:number):KFRegister;
    PopRegister():KFRegister;
    CallProperty(name:string, codeline:any):void;
    ExecuteFrameScript(id:number,framedata:any,target:any):void;
    Execute(scriptData:any, target:any):void;
    ExecCodeLine(codeline:any, target:any):void;
}

export class KFScript
{
    ///区分脚本的ID
    public typeid:number = 0;

     public Execute(scriptdata:any, context:KFScriptContext = null):void
     {

     }

     /*销毁这个脚本前*/
     public Destory():boolean
     {
         return true;
     }

     public Update():void {}
     public  Stop():void{}

     /*一定要定义一个脚本集*/
     public GetScriptTypes():Array<KFDName>
     {
         return this.m_scripttypes;
     }

     protected m_scripttypes = new Array<KFDName>();
}