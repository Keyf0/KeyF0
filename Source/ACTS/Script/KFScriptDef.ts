import {KFRegister} from "./ExecCode/KFRegister";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFBlockTarget} from "../Context/KFBlockTarget";
import {KFActor} from "../Actor/KFActor";
import {KFGraphBlockBase} from "../Graph/Blocks/KFGraphBlockBase";


export class BlockCache
{
    public self:KFBlockTarget;
    public current:KFGraphBlockBase;

    public Input(arg:any)
    {
        ///懒得判定了
        //if(this.self && this.block){
            this.current.Input(this.self, arg);
        //}
    }
}


export interface KFScriptContext
{
    ///当前运行时
    runtime:IKFRuntime;
    ///当前对象
    targetObject:KFActor;
    ///当前的寄存器
    _reg:KFRegister;
    ///当前block
    block:BlockCache;

    /// 设置寄存器
    PushRegister(paramnum:number, varsize:number):KFRegister;
    PopRegister():KFRegister;
    CallProperty(name:string, codeline:any):void;
    ExecuteFrameScript(id:number,framedata:any,target:any):void;
    Execute(scriptData:any, target:any):void;
    ExecCodeLine(codeline:any, target:any):void;

    BorrowScript(type:KFDName):KFScript;
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
     public Execute(scriptdata:any, context:KFScriptContext = null):any
     {}

     public Destory():boolean
     {
         return true;
     }
     public scriptTypes:KFDName[];
}