import {KFBlockTarget} from "./KFBlockTarget";
import {KFGraphComponent} from "../Actor/Components/KFGraphComponent";
import {KFTimelineComponent} from "../Actor/Components/KFTimelineComponent";

export interface IKFDomain
{
    GenNextSid():number;
    CreateBlockTarget(KFBlockTargetData:any,meta?:any):KFBlockTarget;
    DestroyBlockTarget(target:KFBlockTarget):void;

    CreateTimelineComponent(asseturl:string):KFTimelineComponent;
    DestroyTimelineComponent(timeline: KFTimelineComponent):void;

    CreateGraphComponent(asseturl:string):KFGraphComponent;
    DestroyGraphComponent(graph:KFGraphComponent):void;

    //instpath规则：idx/idx/idx/.../idx?ptr
    FindBlockTarget(instpath:string):KFBlockTarget;
    GetBlockTarget(instSID:number) :KFBlockTarget;
}