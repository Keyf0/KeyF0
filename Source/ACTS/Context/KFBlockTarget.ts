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
    public parent:IKFBlockTargetContainer;
    public etable:KFEventTable;
    public runtime:IKFRuntime;
    public tickable:boolean  = false;

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        this.metadata = metadata;
        this.runtime = runtime;
        ///如果有MEATDATA数据则给对象赋值
        ///不考虑延时创建的对象了[不纯粹]，METADATA就是类初始化时赋值的
        let kfbytes:KFBytes = this.metadata.data;
        if(kfbytes && kfbytes.bytes)
        {
            KFDJson.read_value(kfbytes.bytes,false, this);
        }
    }

    //Release():void{}

    public Tick(frameindex:number):void{}

    public ActivateBLK(KFBlockTargetData:any):void {}
    public DeactiveBLK():void{}
    public position:any;
    public set_position(x:number, y:number, z:number):void{}
    public rotation:any;
    public set_rotation(x:number, y:number, z:number):void{}//Vector3
    public SetCustomArg(value:number,...args:number[]):void{}
}
