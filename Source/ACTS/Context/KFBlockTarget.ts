import {IKFRuntime} from "./IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEventTable} from "../../Core/Misc/KFEventTable";

export interface IKFBlockTargetContainer
{
    AddChild(child:KFBlockTarget):void;
    RemoveChild(child:KFBlockTarget):void;
    GetChild(index:number):KFBlockTarget;
    FindChild(name:string):KFBlockTarget;
    runtime:any;
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
    public keep:boolean;
    public parent:IKFBlockTargetContainer;

    //m_outputs:KFEventTable;
    //m_ctxoutputs:KFEventTable;

    public Construct(metadata:any
                     , runtime:IKFRuntime)
    {
        this.metadata = metadata;
    }

    //Release():void{}

    public Tick(frameindex:number):void{}
    public TickInEditor(frameindex:number):void{}

    //public GetScriptContext():KFScriptContext{return null;}
    /*
    //TimeBlock
    public ActivateBLK(KFTimeBlockData:any):void{}
    public DeactiveBLK(KFTimeBlockData:any):void{}
    public position():any{return null;}//Vector3
    public set_position(value:any):void{}
    public rotation():any{return null;}//Vector3
    public set_rotation(value:any):void{}//Vector3

    public SetCustomArg(value:number,...args:number[]):void{}

    //GraphBlock
    public ActivateGraph(KFGraphBlockData:any):void {}
    public DeactiveGraph(KFGraphBlockData:any):void {}
    public Input(KFBlockFuncInfo:any, KFGraphArg:any):void{}
    public FireCodesCurrentOutput(outputindex:number,  KFGraphArg:any):void{}
    public FireCodesDefaultOutput(outputindex:number,  KFGraphArg:any):void{}
    public FireCodesOutput(funcname:KFDName, outputindex:number, KFGraphArg:any):void{}
    public FireGraphOutput(blockname:KFDName,KFGraphArg:any):void{}
    public FireScriptOutput(stype:KFDName, outputname:KFDName, KFGraphArg:any):void{}

    public outputs():KFEventTable{return this.m_outputs;}
    public PushContextOutput(ctxoutput:KFEventTable):void
    {this.m_ctxoutputs = ctxoutput;}

    public PopContextOutput():void
    {this.m_ctxoutputs = null;}

    protected HandleCodesInput(KFBlockFuncInfo:any, KFGraphArg:any):void
    {}
    //outline
    private set_parent(p:IKFBlockTargetContainer):void {this.m_parent = p;}
    public parent():IKFBlockTargetContainer {return this.m_parent;}
    */
}