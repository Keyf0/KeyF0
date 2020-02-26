import {KFDName} from "../../KFData/Format/KFDName";
import {KFScript} from "../../KFScript/KFScriptDef";
import {LOG_ERROR} from "../../Core/Log/KFLog";

export class  KFScriptFactory
{
    private static m_inited:boolean = false;
    private static m_metas:{[key: number]: new(...args: any[])=>KFScript;} = {};

    public static Init():void
    {
        if(KFScriptFactory.m_inited)
            return;
        KFScriptFactory.m_inited = true;
        

    }

    public static Clear():void
    {
        KFScriptFactory.m_metas = {};
    }

    public static RegisterScriptClass(  name:KFDName
                                      , meta:new(...args: any[])=>KFScript):void
    {
        if(KFScriptFactory.m_metas[name.value])
        {
            LOG_ERROR("{0}重复定义",name.toString());
        }
        KFScriptFactory.m_metas[name.value] = meta;
    }

    public static GetScriptClass(name:KFDName):new(...args: any[])=>KFScript
    {
        return KFScriptFactory.m_metas[name.value];
    }
}