import {DefaultType, IKFMeta} from "../../Core/Meta/KFMetaManager";
import {TypeEvent} from "../../Core/Misc/TypeEvent";
import {KFDTable} from "../../KFData/Format/KFDTable";
import {kfVector3} from "../Script/Global/GlobalScripts";

export interface LoadConfigEnd
{
    (ret:boolean);
}

export interface IKFConfigs
{
    load_config(appdatapath:string, kfdpath:string, start:string, end:LoadConfigEnd);

    GetMetaData(asseturl:string, bFullpath:boolean):any;//KFMetaData
    GetTimelineConfig(path:string, bFullpath:boolean):any; //KFTimelineConfig
    GetGraphConfig(path:string, bFullpath:boolean):any;///KFGraphConfig
    GetActorConfig(path:string, bFullpath:boolean):any;///KFActorConfig
    GetAnyConfig(path:string):any;


    SetTimelineConfig(path:string, KFTimelineConfig:any):void;
    SetGraphConfig(path:string, KFGraphConfig:any):void;

    basedir():string;
    start():string;

    OnKFDLoaded:TypeEvent<KFDTable>;
    worldSize:kfVector3;
}

export let IKFConfigs_Type:DefaultType<IKFConfigs> = new DefaultType<IKFConfigs>();