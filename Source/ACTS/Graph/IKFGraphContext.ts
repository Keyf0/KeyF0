import {KFDName} from "../../KFData/Format/KFDName";
import {KFScriptContext} from "../Script/KFScriptDef";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFBlockTarget} from "../Context/KFBlockTarget";

export interface IKFGraphContext
{
    runtime:IKFRuntime;
    script:KFScriptContext;

    Input(self:KFBlockTarget, blockname:KFDName, arg:any);
}