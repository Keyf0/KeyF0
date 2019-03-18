import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";


export class KFScriptComponent extends KFComponentBase
{
    public static Meta:KFDName
        = new KFDName("KFScriptComponent");

    private _targetScripts;
    private _scopeOnceScripts;
    private _scopeKeepScripts;
    private _keepScriptID:number;
    private _scriptruning:boolean;
    private _isEndingscope:boolean;


}