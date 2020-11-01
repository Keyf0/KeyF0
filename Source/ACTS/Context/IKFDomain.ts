import {KFBlockTarget} from "./KFBlockTarget";
import {KFGraphComponent} from "../Actor/Components/KFGraphComponent";

export interface IKFDomain
{
    GenNextSid():number;
    CreateBlockTarget(KFBlockTargetData:any,meta?:any):KFBlockTarget;
    DestroyBlockTarget(target:KFBlockTarget):void;
    CreateGraphComponent(target:KFBlockTarget):KFGraphComponent;
    DestroyGraphComponent(graph:KFGraphComponent):void;
    //instpath规则：idx/idx/idx/.../idx?ptr
    FindBlockTarget(instpath:string):KFBlockTarget;
    GetBlockTarget(instSID:number) :KFBlockTarget;
}