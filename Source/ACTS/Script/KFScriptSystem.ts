import {KFScriptManagerBase} from "../../KFScript/KFScriptManagerBase";
import {KFScript, KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFScriptFactory} from "./KFScriptFactory";
import {KFBlockTarget} from "../Context/KFBlockTarget";

///绑定目标的脚本
export class KFTargetScript extends KFScript
{
    protected m_c:KFScriptContext;
    protected m_t:KFBlockTarget;
    protected m_type:KFDName;

    public Execute(scriptdata: any
                   , context: KFScriptContext = null): void {
        this.m_c = context;
        this.m_t = context.targetObject;
        this.m_type = scriptdata.type;
    }

    public Stop(): void {
        this.isrunning = false;
        if(this.m_c) {
            this.m_c.ReturnScript(this,this.m_type);
        }
        this.m_type = null;
        this.m_c = null;
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
