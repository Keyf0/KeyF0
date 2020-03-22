import {KFDName} from "../../KFData/Format/KFDName";
import {AMeta, InstantiateFunc, KFMetaManager} from "../../Core/Meta/KFMetaManager";
import {KFScriptGroupType} from "../../KFScript/KFScriptGroupType";


export interface ScriptDataInit
{
    (data, kfd, kfdtb): any;
}

export class ScriptMeta extends AMeta
{
    public DataInit:ScriptDataInit;

    public constructor(name:string = ""
                       , func:InstantiateFunc = null
                       , DataInit:ScriptDataInit = null
                       , group:number = KFScriptGroupType.Target
                       , execSide:number = 3)
    {
        super(name, func, execSide);

        if(DataInit == null)
        {
            DataInit = (data, kfd, kfdtb)=>{
                data.type = new KFDName(name);
                data.group = group;
            };
        }

        this.DataInit = DataInit;
    }

    public SetDefaultFactroy(name:string, func:InstantiateFunc = null)
    {
        super.SetDefaultFactroy(name,func);
        if(this.name.value != 0)
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