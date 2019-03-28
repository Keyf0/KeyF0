import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {IKFBlockTargetContainer} from "../Context/KFBlockTarget";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";

export interface IKFGraphContext
{
    runtime:IKFRuntime;
    etable:KFEventTable;
    container:IKFBlockTargetContainer;
    IsEditing:boolean;

    SetInputRegister(value:any/*KFGraphArg*/);
    OnGraphFrame(arg:any, frame:any, scriptContext:KFScriptContext);
    OnGraphOutput(blockname:KFDName, arg:any);
}