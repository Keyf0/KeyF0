import {KFScriptManagerBase} from "./KFScriptManagerBase";
import {KFScript, KFScriptContext} from "./KFScriptDef";
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
    protected m_fixtpf:number;

    public Execute(scriptdata: any
                   , context: KFScriptContext = null): void {
        this.m_c = context;
        this.m_t = context.targetObject;
        this.m_type = scriptdata.type;
        this.m_fixtpf = this.m_t.runtime.fixtpf;
        this.isrunning = true;
    }

    public Keep(tmap: any, ctype:KFDName) {
        tmap[ctype.value] = this;
    }

    public Stop(tmap: any): void {
        delete tmap[this.m_type.value];
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
