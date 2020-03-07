import {KFScriptManagerBase} from "../../KFScript/KFScriptManagerBase";
import {KFScript, KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFRuntime} from "../Context/IKFRuntime";
import {Variable} from "../Data/Variable";
import {KFScriptFactory} from "./KFScriptFactory";
import {GSPlayStateScript} from "./Global/GlobalScripts";

export interface KFACTSScriptContext extends KFScriptContext
{
    ExecuteAt(scriptType:KFDName,scriptData:any,context:KFScriptContext,beginscope:boolean):void;
    AddKeepScript(script:KFScript):number;
    RemoveKeepScript(script:KFScript):void;
    RemoveAllKeepScript():void;
    BeginScope():void;
    EndScope():void;
    GetVariable(vID:number, create:boolean, varstr:string):Variable;
}

export class KFACTSScript extends KFScript
{
    protected m_context:KFACTSScriptContext;
    protected m_runtime:IKFRuntime;

    public SetContext(context:KFACTSScriptContext):void
    {
        this.m_context = context;
        this.m_runtime = context.runtime;
    }
}

export class KFScriptSystem extends KFScriptManagerBase
{
    public runtime:IKFRuntime = null;

    public constructor(runtime:IKFRuntime)
    {
        super();
        this.runtime = runtime;
    }

    public NewScriptInstance(type:KFDName):KFScript
    {
        let scriptmeta =  KFScriptFactory.GetMetaName(type);
        if(scriptmeta)
            return scriptmeta.instantiate();
        return null;
    }
}

GSPlayStateScript;