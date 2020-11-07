import {KFScriptManagerBase} from "./KFScriptManagerBase";
import {KFScript, KFScriptContext} from "./KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFScriptFactory} from "./KFScriptFactory";
import {KFBlockTarget} from "../Context/KFBlockTarget";

///绑定目标的脚本
export class KFTargetScript extends KFScript
{
    protected m_t:KFBlockTarget;
    protected m_fixtpf:number;

    ///是否在运行中
    public isrunning:boolean;
    public type:KFDName;

    public Update(frameindex:number) {}

    public Execute(scriptdata: any, context: KFScriptContext = null): void
    {
        this.type = scriptdata.type;
        this.m_t = context.targetObject;
        this.m_fixtpf = context.runtime.fixtpf;
        this.isrunning = true;
    }

    public Stop(): void
    {
        this.isrunning = false;
        this.type = null;
        this.m_t = null;
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
