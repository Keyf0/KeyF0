import {KFBlockTarget} from "./KFBlockTarget";

export interface IKFDomain
{
    GenNextSid():number;
    CreateBlockTarget(metaname:string):KFBlockTarget;
    DestroyBlockTarget(target:KFBlockTarget):void;
    //instpath规则：idx/idx/idx/.../idx?ptr
    FindBlockTarget(instpath:string):KFBlockTarget;
}