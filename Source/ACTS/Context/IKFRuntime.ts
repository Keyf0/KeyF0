import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFRandom} from "./KFRandom";
import {KFTimers} from "./KFTimers";
import {IKFDomain} from "./IKFDomain";
import {KFScriptSystem} from "../Script/KFScriptSystem";
import {IKFConfigs} from "./IKFConfigs";
import {KFDName} from "../../KFData/Format/KFDName";

export interface IKFRuntime
{
     root:IKFRuntime;
     parent:IKFRuntime;
     etable:KFEventTable;
     random:KFRandom;
     timers:KFTimers;
     domain:IKFDomain;

     //当前固定的时间
     fixtpf:number;

     ///实际的帧数|新文件不会更新
     realframeindex:number;

     ///当前的帧数|新文件会更新
     frameindex:number;
     ///上一帧消耗时间ms
     frametime:number;
     ///date.getTime()时间
     realytime:number;
     ///游戏运行的时间|新文件会更新
     realyplaytime:number;

     ///执行端
     // 有三个地方有影响 createOnClient = false
     // 1 domain 中 客户端创建失败
     // 2 时间线上 客户端创建块失败
     // 3 流程图上 客户端创建节点失败
     execSide:number;

     ///是否处在编辑模式下
     IsEditMode:boolean;

     scripts:KFScriptSystem;
     configs:IKFConfigs;

     //注册的系统
     systems:{[key:number]:any;};

     GetSystem(name:string):any;
     SetSystem(name:string,sys:any);

     ///获取数据表格的行
     DataRow(name:string, id:any):any;

}

export const EventEnterFrame:KFDName = new KFDName("onEnterFrame");
export const EventEndFrame:KFDName = new KFDName("onEndFrame");
export const EventRenderFrame:KFDName = new KFDName("onRenderFrame");

export const onEnterFrame:KFEvent = new KFEvent(EventEnterFrame);
export const onEndFrame:KFEvent = new KFEvent(EventEndFrame);
export const onRenderFrame:KFEvent = new KFEvent(EventRenderFrame);
