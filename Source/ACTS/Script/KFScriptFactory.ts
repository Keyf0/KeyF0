import {KFDName} from "../../KFData/Format/KFDName";
import {AMeta, InstantiateFunc, KFMetaManager} from "../../Core/Meta/KFMetaManager";

export class ScriptMeta extends AMeta
{
    public constructor(name:string = "", func:InstantiateFunc = null)
    {
        super(name,func);
    }

    public SetDefaultFactroy(name:string, func:InstantiateFunc = null)
    {
        super.SetDefaultFactroy(name,func);
        if(this.name != "")
        {
            KFScriptFactory.Register(this);
        }
    }
}

export class KFScriptFactory
{
    private static _Inst:KFMetaManager = new KFMetaManager(1000000,"ScriptMeta");

    public static Register(meta:AMeta):boolean
    {
       return KFScriptFactory._Inst._Register(meta);
    }

    public static GetMetaType(type:number):AMeta
    {
        return KFScriptFactory._Inst._GetMetaType(type);
    }

    public static GetMetaName(name:KFDName):AMeta
    {
        return KFScriptFactory._Inst._GetMetaName(name);
    }
}