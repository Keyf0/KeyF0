import {IKFRuntime} from "./IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFBytes} from "../../KFData/Format/KFBytes";

export interface IKFBlockTargetContainer
{
    AddChild(child:KFBlockTarget):void;
    RemoveChild(child:KFBlockTarget):void;
    GetChildAt(index:number):KFBlockTarget;
    FindChild(name:number):KFBlockTarget;
    GetRuntime():IKFRuntime;
    CreateChild(targetdata:any):KFBlockTarget;
    DeleteChild(child:KFBlockTarget):boolean
}

export class KFBlockTarget
{
    ///名称
    public name:KFDName;
    public metadata:any;
    public sid:number;
    public script:KFScriptContext;
    public parent:IKFBlockTargetContainer;
    public etable:KFEventTable;
    public runtime:IKFRuntime;
    public tickable:boolean  = false;

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        this.metadata = metadata;
        this.runtime = runtime;
    }

    //Release():void{}

    public Tick(frameindex:number):void{}

    public ActivateBLK(KFBlockTargetData:any):void{
        ///如果有MEATDATA数据则给对象赋值
        let kfbytes:KFBytes = this.metadata.data;
        if(kfbytes && kfbytes.bytes)
        {
            KFDJson.read_value(kfbytes.bytes,false, this);
        }
    }
    public DeactiveBLK():void{}
    public position:any;
    public set_position(x:number, y:number, z:number):void{}
    public rotation:any;
    public set_rotation(x:number, y:number, z:number):void{}//Vector3
    public SetCustomArg(value:number,...args:number[]):void{}
}
