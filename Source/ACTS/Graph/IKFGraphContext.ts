import {KFDName} from "../../KFData/Format/KFDName";
import {KFScriptContext} from "../Script/KFScriptDef";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFBlockTarget} from "../Context/KFBlockTarget";
import {KFGraphBlockBase} from "./Blocks/KFGraphBlockBase";

export interface IKFGraphContext
{
    runtime:IKFRuntime;
    script:KFScriptContext;

    GetBlock(id:KFDName):KFGraphBlockBase;
    GetBlockID(id:number):KFGraphBlockBase;
    GetBlockStr(name:string):KFGraphBlockBase;

    Input(self:KFBlockTarget, blockname:KFDName, arg:any);
}