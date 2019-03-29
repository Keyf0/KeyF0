import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFRandom} from "./KFRandom";
import {KFTimers} from "./KFTimers";
import {IKFDomain} from "./IKFDomain";
import {KFScriptSystem} from "../Script/KFScriptSystem";
import {IKFConfigs} from "./IKFConfigs";

export interface IKFRuntime
{
     root():IKFRuntime;
     parent:IKFRuntime;
     etable:KFEventTable;
     random:KFRandom;
     timers:KFTimers;
     domain:IKFDomain;

     frameindex:number;
     frametime:number;
     realytime:number;

     frametimes:number;
     realytimes:number;

     scripts:KFScriptSystem;
     configs:IKFConfigs;
}