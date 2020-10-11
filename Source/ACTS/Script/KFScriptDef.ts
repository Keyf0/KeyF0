import {KFRegister} from "./ExecCode/KFRegister";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFBlockTarget} from "../Context/KFBlockTarget";
import {KFActor} from "../Actor/KFActor";

export interface KFScriptContext
{
    ///当前运行时
    runtime:IKFRuntime;
    ///当前对象
    targetObject:KFActor;
    /// 当前的寄存器
    _reg:KFRegister;
    /// 设置寄存器
    PushRegister(paramnum:number, varsize:number):KFRegister;
    PopRegister():KFRegister;
    CallProperty(name:string, codeline:any):void;
    ExecuteFrameScript(id:number,framedata:any,target:any):void;
    Execute(scriptData:any, target:any):void;
    ExecCodeLine(codeline:any, target:any):void;

    ReturnScript(script:KFScript,type:KFDName);

    Get(i:number):any;
    Set(i:number,v:any);
}


export class KFScriptData {

    public static NONE_S:number = -1;
    public static WRITE_S:number = 0;
    public static READ_S:number = 1;
    public static WAITR_S:number = 2;

    public static RFS:{[key:number]:(sd:any,objs:any[],pints:number[])=>void;} = {};
}

export class KFScript
{
    ///是否在运行中
    public isrunning:boolean;

     public Execute(scriptdata:any, context:KFScriptContext = null):any
     {}

     public Destory():boolean
     {
         return true;
     }

     public Update(frameindex:number) {}
     public Keep(tmap:any,ctype:KFDName) {}
     public Stop(tmap:any) {}

     public scriptTypes:KFDName[];
}