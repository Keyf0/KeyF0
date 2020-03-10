import {IKFRuntime} from "../Context/IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";

export interface IKFGraphContext
{
    //兼容KFSCRIPTCONTEXT的类型用any
    runtime:any;
    //兼容KFSCRIPTCONTEXT的类型用any
    targetObject:any;
    m_graph:any;
    script:KFScriptContext;
}