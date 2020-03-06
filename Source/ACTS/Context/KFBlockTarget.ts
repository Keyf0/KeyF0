import {IKFRuntime} from "./IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEventTable} from "../../Core/Misc/KFEventTable";

export interface IKFBlockTargetContainer
{
    AddChild(child:KFBlockTarget):void;
    RemoveChild(child:KFBlockTarget):void;
    GetChildAt(index:number):KFBlockTarget;
    FindChild(name:number):KFBlockTarget;
    GetRuntime():IKFRuntime;
}

export class KFBlockTarget
{
    ///名称
    public name:KFDName;
    public metadata:any;
    public sid:number;
    public scriptContext:KFScriptContext;
    public parent:IKFBlockTargetContainer;
    public etable:KFEventTable;
    public runtime:IKFRuntime;

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        this.metadata = metadata;
        this.runtime = runtime;
    }

    //Release():void{}

    public Tick(frameindex:number):void{}
    public TickInEditor(frameindex:number):void{}

    public ActivateBLK(KFBlockTargetData:any):void{}
    public DeactiveBLK(KFBlockTargetData:any):void{}
    public position:any;
    public set_position(x:number, y:number, z:number):void{}
    public rotation:any;
    public set_rotation(x:number, y:number, z:number):void{}//Vector3
    public SetCustomArg(value:number,...args:number[]):void{}
}
