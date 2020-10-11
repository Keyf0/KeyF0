import {KFDName} from "../../KFData/Format/KFDName";
import {AMeta, InstantiateFunc, KFMetaManager} from "../../Core/Meta/KFMetaManager";
import {KFScriptGroupType} from "./KFScriptGroupType";


export interface ScriptDataNew
{
    (): any;
}

export interface ReadStack {
    (sd:any,objs:any[],pints:number[])
}

export class ScriptMeta extends AMeta
{
    public DataNew:ScriptDataNew;
    public RS:ReadStack;

    public constructor(name:string = ""
                       , func:InstantiateFunc = null
                       , group:number = KFScriptGroupType.Target
                       , DataInit:ScriptDataNew = null
                       , RS:ReadStack = null
                       , execSide:number = 3)
    {
        super(name, func, execSide);

        if(DataInit == null)
        {
            DataInit = ()=>{
                let data:any = {};
                data.type = new KFDName(name);
                data.group = group;
                return data;
            };
        }

        this.RS = RS;
        this.DataNew = DataInit;
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