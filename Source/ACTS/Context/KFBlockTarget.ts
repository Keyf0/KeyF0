import {IKFRuntime} from "./IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEventTable} from "../../Core/Misc/KFEventTable";

export interface IKFBlockTargetContainer
{
    AddChild(child:KFBlockTarget):void;
    RemoveChild(child:KFBlockTarget):void;
    GetChildAt(index:number):KFBlockTarget;
    FindChild(name:string):KFBlockTarget;
    runtime:any;
    iscontainer:boolean;
}

export class KFBlockTarget
{
    public static BTTimeline:number = 1;
    public static BTGraphBlock:number = 2;
    public static BTAll:number = 3;

    ///支持Timeline[1] or GraphBlock[2] all[3]
    public bttype:number = 0;
    ///名称
    public name:string;
    //m_parent :IKFBlockTargetContainer;
    public metadata:any;
    public sid:number;
    public scriptContext:KFScriptContext;
    public parent:IKFBlockTargetContainer;
    public etable:KFEventTable;

    public Construct(metadata:any
                     , runtime:IKFRuntime)
    {
        this.metadata = metadata;
    }

    //Release():void{}

    public Tick(frameindex:number):void{}
    public TickInEditor(frameindex:number):void{}

    //TimeBlock
    public ActivateBLK(KFTimeBlockData:any):void{}
    public DeactiveBLK(KFTimeBlockData:any):void{}
    public position:any;//Vector3
    public set_position(value:any):void{}
    public rotation:any;//Vector3
    public set_rotation(value:any):void{}//Vector3
    public SetCustomArg(value:number,...args:number[]):void{}

}

export class KFGraphTarget extends KFBlockTarget
{
    //GraphBlock
    public ActivateGraph(KFGraphBlockData:any):void {}
    public DeactiveGraph(KFGraphBlockData:any):void {}
}