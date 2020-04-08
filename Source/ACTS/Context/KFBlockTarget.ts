import {IKFRuntime} from "./IKFRuntime";
import {KFScriptContext} from "../../KFScript/KFScriptDef";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFBytes} from "../../KFData/Format/KFBytes";
import {KFGlobalDefines} from "../KFACTSDefines";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {kfVector3} from "../Script/Global/GlobalScripts";

export interface IKFBlockTargetContainer
{
    parent:IKFBlockTargetContainer;
    ChildRename(oldname:number, child:KFBlockTarget):void;
    GetChildren():KFBlockTarget[];
    AddChild(child:KFBlockTarget):void;
    RemoveChild(child:KFBlockTarget):void;
    GetChildAt(index:number):KFBlockTarget;
    FindChildBySID(sid:number):KFBlockTarget;
    FindChild(name:number):KFBlockTarget;
    StrChild(name:string):KFBlockTarget;
    GetRuntime():IKFRuntime;
    CreateChild(targetdata:any,meta?:any,Init?:any):KFBlockTarget;
    DeleteChild(child:KFBlockTarget):boolean;
    ///直接删除不建议用
    _DeleteChild(child:KFBlockTarget):boolean;
}

///在哪一端执行
export class BlkExecSide
{
    static UNKNOW:number = 0;
    static CLIENT:number = 1;
    static SERVER:number = 2;
    static BOTH:number = 3;
    static SELFCLIENT:number = 5;///自己的客户端
};

export class KFBlockTarget
{
    ///名称
    public name:KFDName;
    public metadata:any;
    public sid:number;
    ///是否属于主客户端
    public owner:boolean;
    public parent:IKFBlockTargetContainer;
    public etable:KFEventTable;
    public runtime:IKFRuntime;

    ///是否需要TICK
    public tickable:boolean;
    public visible:boolean;
    public display:number;

    public position:kfVector3;
    public rotation:kfVector3;
    public scale:kfVector3;

    ///变量
    public vars:{[key:number]:any};

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        this.metadata = metadata;
        this.runtime = runtime;
        ///如果有MEATDATA数据则给对象赋值
        ///不考虑延时创建的对象了[不纯粹]，METADATA就是类初始化时赋值的
        let kfbytes:KFBytes = this.metadata.data;
        let buff = kfbytes ? kfbytes.bytes : null;
        if(buff)
        {
            buff.SetPosition(0);
            KFDJson.read_value(buff,false, this);
        }
    }

    //Release():void{}

    public Tick(frameindex:number):void{}

    public ActivateBLK(KFBlockTargetData:any):void
    {
        if(KFGlobalDefines.IS_Debug) {
            let self = <any>this;
            self.CreateTargetData = KFBlockTargetData;
        }
    }

    public DeactiveBLK():void{}

    ///更新显示对象
    public set_position(v3?: { x: number; y: number; z?: number }){}
    ///更新显示对象
    public set_rotation(v3?: { x?: number; y?: number; z: number }){}
    ///更新显示对象
    public set_scale(v3?:{x:number,y:number,z?:number}){}
    ///更新显示对象
    public set_datas(datas:number[]){}

    public StrVar(name:string){return this.vars[KFDName._Strs.GetNameID(name)];}
    public ReadVars(bytesarr:KFByteArray,len:number) {

        if(this.vars == null) this.vars = {};
        let varsize = bytesarr.readvaruint();
        while (varsize > 0) {
           let nameval = KFDName._Strs.GetNameID(bytesarr.readstring());
           let data = KFDJson.read_value(bytesarr);
           this.vars[nameval] = data;
            varsize -= 1;
        }
    }
    public WriteVars(bytesarr:KFByteArray) {

        if(this.vars) {
            let arr = [];
            for(let key in this.vars){
                arr.push({name:KFDName._Strs.GetNameStr(parseInt(key))
                    ,value:this.vars[key]});
            }
            bytesarr.writevaruint(arr.length);

            for(let itm of arr){
                bytesarr.writestring(itm.name);
                KFDJson.write_value(bytesarr, itm.value);
            }

        } else {
            bytesarr.writevaruint(0);
        }
    }

    public Destory() {
        if(this.parent) {
            this.parent.DeleteChild(this);
        }
    }

}
