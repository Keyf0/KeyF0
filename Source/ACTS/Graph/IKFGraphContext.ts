import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";

export interface IKFGraphContext
{
    runtime:IKFRuntime;
    IsEditing:boolean;
    targetObject:any;
    m_graph:any;

    OnGraphFrame(arg:any, frame:any, scriptContext:KFScriptContext);
    Input(blockname:KFDName,arg:any):void;

}