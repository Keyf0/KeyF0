import {KFScript, KFScriptContext, KFScriptData} from "../KFScriptDef";
import {ScriptMeta} from "../KFScriptFactory";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFScriptGroupType} from "../KFScriptGroupType";
import {KFExpression} from "./KFExpression";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {LOG} from "../../../Core/Log/KFLog";
import {KFActor} from "../../Actor/KFActor";
import {KFBytes} from "../../../KFData/Format/KFBytes";
import {KFByteArray} from "../../../KFData/Utils/FKByteArray";
import {KFDJson} from "../../../KFData/Format/KFDJson";
import {IKFFileIO_Type} from "../../../Core/FileIO/IKFFileIO";

export class GSPlayStateScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSPlayStateScriptData"
        ,():KFScript=>{return new GSPlayStateScript();}
        , KFScriptGroupType.Global
        ,()=>{
        let data:any = {};
        data.type = new KFDName("GSPlayStateScriptData");
        data.group = KFScriptGroupType.Global;
        data.action = 0;
        data.stateid = 0;
        return data;
    }
    ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.action = objs[i - 1];
                        break;
                    case 1:
                        sd.stateid = objs[i - 1];
                        break;
                }
            }
        });

    public Execute(scriptdata: any, context: KFScriptContext = null): any
    {
        if(scriptdata.action == 0)
        {
            context.targetObject.timeline.Play(scriptdata.stateid);
        }
        else {
            context.targetObject.timeline.playing = false;
        }
    }
}

export class GSLogScript extends KFScript{

    public static Meta:ScriptMeta = new ScriptMeta("GSLogScriptData"
        ,():KFScript=>{return new GSLogScript();}
        , KFScriptGroupType.Global
        ,null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            sd.text = objs[0].toString();
        });

    public Execute(sd: any, context: KFScriptContext = null): any {LOG(sd.text);}
}


///KFD(C,CLASS=GSExpressionScriptData,CNAME=执行,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSExpressionScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=2,NAME=des,CNAME=说明,TYPE=kfstr)
///KFD(P=1,NAME=expression,CNAME=表达式,TYPE=object,OTYPE=KFExpression)
///KFD(*)

export class GSExpressionScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSExpressionScriptData"
        ,():KFScript=>{return new GSExpressionScript();}
        ,KFScriptGroupType.Global,null
    ,(sd:any,objs:any[],pints:number[])=>{
            sd.expression = objs[0];
        });

    public Execute(scriptdata: any, context: KFScriptContext = null): any {
        /// 目标对象
        let expr:KFExpression = scriptdata.expression;
        ///后面所有还回值要存到一个堆栈中
        if(expr._exec)
        {
            if(expr.once)
                return expr._result;
            return expr._func(context.targetObject,context);
        }
        else
            return expr.value(context.targetObject, context);
    }
}

///KFD(C,CLASS=GSRemoteScriptData,CNAME=远程脚本,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSRemoteScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=data,CNAME=内容数据,TYPE=mixobject,OTYPE=KFScriptData)
///KFD(P=2,NAME=execSide,CNAME=发送,DEFAULT=3,TYPE=uint8,ENUM=BlkExecSide)
///KFD(*)


export class GSRemoteScript extends KFScript {

    public static Meta:ScriptMeta = new ScriptMeta("GSRemoteScriptData"
        ,():KFScript=>{return new GSRemoteScript();}
        , KFScriptGroupType.Global, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.data = objs[i - 1];
                        break;
                    case 1:
                        sd.execSide = objs[i - 1];
                        break;
                }
            }
        });

    public Execute(sd: any, context: KFScriptContext = null): any {
        //是否从堆栈中获取数据
        let rsd = sd.data;
        let pints:number[] = rsd.paramInts;
        if(pints && pints[0] == KFScriptData.WAITR_S) {
            ///等待读取stack
            let rfs = KFScriptData.RFS[rsd.type.value];
            if(rfs) {rfs(rsd,context._reg._OBJECTS,pints);}
        }

        let toj = context.targetObject;
        //public rpcc_exec:(scriptdata:any)=>any;
        //public rpcs_exec:(scriptdata:any)=>any;
        //此处的判定只是验证是否可远程执行的对象
        if(toj.rpcc_exec) {
            ///调用服务器
            let eside = sd.execSide ? sd.execSide : BlkExecSide.BOTH;
            let currside = toj.runtime.execSide;

            switch (eside) {
                case BlkExecSide.SERVER:
                    toj.rpcs_exec(rsd);
                    break;
                case BlkExecSide.CLIENT:
                    toj.rpcc_exec(rsd);
                    break;
                case BlkExecSide.BOTH:
                    ///如果是BOTH则是所有客户端以及服务器都执行
                    if(currside == BlkExecSide.CLIENT){
                        ///如果在客户端，客户端的执行由回调产生
                        toj.rpcs_broadcast(rsd);
                    }else{
                        toj.Exec(rsd);
                        toj.rpcc_exec(rsd);
                    }

                    break;
                default:
                    break;
            }
        }
    }

}


///KFD(C,CLASS=GSLoadBLKDataScriptData,CNAME=加载BLK数据,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSLoadBLKDataScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=rebuildInst,CNAME=实例名,TYPE=kfstr)
///KFD(P=2,NAME=rebuildPath,CNAME=路径,TYPE=kfstr)
///KFD(*)

export class GSLoadBLKDataScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSLoadBLKDataScriptData"
        ,():KFScript=>{return new GSLoadBLKDataScript();}
        , KFScriptGroupType.Global, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.rebuildInst = objs[i - 1];
                        break;
                    case 1:
                        sd.rebuildPath = objs[i - 1];
                        break;
                }
            }
        });

    public static Deserialize(blk:KFBlockTarget, InData:any)
    {
        //let metaData:any = InData.data.metaData;
        //if(metaData && metaData.data){
        //   KFDJson.read_value(metaData.data, false, blk);
        //}

        let childrenData = InData.children;
        if(childrenData){
            let blkActor:KFActor = blk.AsActor();
            for(let i = 0;i < childrenData.length; i++){

                let childdata = childrenData[i];
                let targetData = childdata.data.targetData;
                let child: KFBlockTarget = blkActor.FindChild(targetData.instname.value);

                if(child == null){
                    child = blkActor.CreateChildByData(childdata);
                }

                GSLoadBLKDataScript.Deserialize(child, childdata);
            }
        }
    }

    public Execute(scriptdata: any, context: KFScriptContext = null): any {

        if(context.targetObject.StrChild) {
            let Instance: KFBlockTarget = context.targetObject.StrChild(scriptdata.rebuildInst);
            if (Instance) {
                IKFFileIO_Type.instance.asyncLoadFile(scriptdata.rebuildPath
                    , function (ret: any, data: any, path: string) {

                        if (ret) {
                            let bytes: KFByteArray = new KFByteArray(data);
                            GSLoadBLKDataScript.Deserialize(Instance, KFDJson.read_value(bytes));
                        }

                        Instance.FireEvent("OnBlkDataLoad", ret);

                    }, null);

            }
        }
    }
}


///KFD(C,CLASS=GSSaveBLKDataScriptData,CNAME=保存BLK数据,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=GSLoadBLKDataScriptData,OR=1,TYPE=kfname)
///KFD(P=3,NAME=group,CNAME=脚本分组,DEFAULT=4,OR=1,ENUM=KFScriptGroupType,TYPE=int8)
///KFD(P=1,NAME=rebuildInst,CNAME=实例名,TYPE=kfstr)
///KFD(P=2,NAME=rebuildPath,CNAME=路径,TYPE=kfstr)
///KFD(*)

export class GSSaveBLKDataScript extends KFScript{

    public static Meta:ScriptMeta = new ScriptMeta("GSSaveBLKDataScriptData"
        ,():KFScript=>{return new GSLoadBLKDataScript();}
        , KFScriptGroupType.Global, null
        ,(sd:any,objs:any[],pints:number[])=>{
            let plen = pints.length;
            for(let i = 1; i < plen; i ++){
                switch (pints[i]) {
                    case 0:
                        sd.rebuildInst = objs[i - 1];
                        break;
                    case 1:
                        sd.rebuildPath = objs[i - 1];
                        break;
                }
            }
        });

    public static Serialize(blk:KFBlockTarget):any {

        let actormeta = blk.metadata;
        let blkData:any = {"__cls__":"SDBlockTarget"};

        let KFNewBlkData:any = {"__cls__":"KFNewBlkData"};
        blkData.data = KFNewBlkData;
        let KFBlockTargetData:any = {"__cls__":"KFBlockTargetData"
            , asseturl: actormeta.asseturl
            , instname: blk.name
            , instsid: blk.sid
        };

        let KFMetaData:any = {"__cls__":"KFMetaData"};

        //KFMetaData.name = "";
        //KFMetaData.type =;

        let kfbytes = new KFBytes();
        kfbytes.bytes = new KFByteArray();
        KFMetaData.data = kfbytes;

        KFNewBlkData.targetData = KFBlockTargetData;
        KFNewBlkData.metaData = KFMetaData;
        ///写入了全量数据
        KFDJson.write_value(kfbytes.bytes, blk);

        ///查看子集
        let Actor:KFActor = blk.AsActor();
        if(Actor){
            blkData.children = [];

            let ActorChildren: KFBlockTarget[] = Actor.GetChildren();
            for(let i = 0;i < ActorChildren.length; i ++){
                blkData.children.push(GSSaveBLKDataScript.Serialize(ActorChildren[i]));
            }

        }

        return blkData;
    }

    public Execute(scriptdata: any, context: KFScriptContext = null): any
    {
        if(context.targetObject.StrChild)
        {
            ///获取需要序列化的对象
            let Instance:KFBlockTarget = context.targetObject.StrChild(scriptdata.rebuildInst);
            if(Instance)
            {
                let blkData = GSSaveBLKDataScript.Serialize(Instance);
                let bytearr:KFByteArray = new KFByteArray();
                KFDJson.write_value(bytearr,blkData);
                IKFFileIO_Type.instance.asyncSaveFile(scriptdata.rebuildPath
                    , bytearr, function (ret:any,data:any,path:string) {

                        Instance.FireEvent("OnBlkDataSave", ret);
                    });
            }
        }
    }
}


///脚本变量
export class VarScriptData {

    public constructor(clsname:string)
    {
        this["__cls__"] = clsname;
    }
    public UpdateEvent:(arg:any)=>void;
}

///注意定义__cls__ 而不是通过constructor.name来获取是因为如果代码被压缩名称可能会改变

//extends scriptdata
export class kfVector3 extends VarScriptData
{
    public x:number;
    public y:number;
    public z:number;

    public constructor(x:number=0,y:number=0,z:number=0)
    {
        super("kfVector3");
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public setValue2(v2:any)
    {
        this.x = v2.x;
        this.y = v2.y;

        if(this.UpdateEvent){
            this.UpdateEvent(this);
        }
    }

    public setValue(v3:any)
    {
        this.x = v3.x;
        this.y = v3.y;
        this.z = v3.z;

        if(this.UpdateEvent){
            this.UpdateEvent(this);
        }
    }

    public getValue(copy:boolean = false):kfVector3
    {
        if(copy){
            return  new kfVector3(this.x,this.y,this.z);
        }
        else return this;
    };

    public add(v3) {
        this.x += v3.x;
        this.y += v3.y;
        this.z += v3.z;
    }

    public sub(v3)
    {
        this.x -= v3.x;
        this.y -= v3.y;
        this.z -= v3.z;
    }

    public mul2(d):kfVector3
    {
        this.x *= d;
        this.y *= d;
        return this;
    }

    public mul(d):kfVector3
    {
        this.x *= d;
        this.y *= d;
        this.z *= d;

        return this;
    }

    public nor()
    {
        let lens = this.x * this.x + this.y * this.y + this.z * this.z;
        if(lens > 0){
            let srate = 1 / Math.sqrt(lens);
            this.x *= srate; this.y*= srate; this.z*=srate;
        }else
            {
            this.x=0;this.y=0;this.z=0;
        }
    }

    public toString():string
    {
        return this.x + "," + this.y + "," + this.z;
    }
}

export class SDFloat  extends VarScriptData {

    public static Share:SDFloat = new SDFloat();
    public value:number = 0;

    public constructor()
    {
        super("SDFloat");
    }

    public setValue(v)
    {
        let val:number;

        if(isNaN(v)) {val = v.getValue();}
        else val = v;

        if(this.value != val) {
            this.value = val;
            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    };
    public getValue() {return this.value;};
    public add(vo)
    {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value += v;
    }
    public sub(vo) {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value -= v;
    }
    public mul(vo)
    {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value *= v;
    }

    public toString():string{
        return this.value + "";
    }
}

export class SDInt32  extends VarScriptData {

    public static Share:SDInt32 = new SDInt32();
    public value:number = 0;

    public constructor()
    {
        super("SDInt32");
    }

    public setValue(v)
    {
        let val:number;

        if(v.getValue) {val = v.getValue();}
        else val = v;

        if(this.value != val) {
            this.value = val;
            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    };
    public getValue() {return this.value;};
    public add(vo)
    {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value += v;
    }
    public sub(vo) {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value -= v;
    }
    public mul(vo)
    {
        let v = vo;
        if(isNaN(vo)){v = vo.getValue();}
        this.value *= v;
    }

    public toString():string{
        return this.value + "";
    }
}

export class SDString extends VarScriptData
{
    public static Share:SDString = new SDString();
    public value:string = "";

    public constructor()
    {
        super("SDString");
    }

    public setValue(v)
    {
        let val:string;

        if(typeof(v) != "string") {val = v.getValue();}
        else val = v;

        if(this.value != val) {
            this.value = val;
            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    }

    public getValue() {return this.value;};

    public add(vo)
    {
        let v = vo;
        if(typeof(v) != "string"){v = vo.getValue();}
        this.value += v;
    }

    public toString():string
    {
        return this.value ;
    }
}


///KFD(C,CLASS=SDBool,CNAME=SDBool,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDBool,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=数据,TYPE=bool)
///KFD(*)

export class SDBool  extends VarScriptData {

    public value:boolean = false;

    public constructor()
    {
        super("SDBool");
    }

    public setValue(v)
    {
        let val:boolean;

        if(typeof(v) != "boolean") {val = v.getValue();}
        else val = v;

        if(this.value != val) {
            this.value = val;
            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    };
    public getValue() {return this.value;};

    public toString():string{
        return this.value ? "true" : "false";
    }
}

///KFD(C,CLASS=SDArray,CNAME=数组,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDArray,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=数据,TYPE=mixarr,OTYPE=KFScriptData)
///KFD(*)

///定义一个数组对象
export class SDArray extends VarScriptData
{
    public value:any[] = [];

    public constructor()
    {
        super("SDArray");
    }

    public getValue() {return this.value;}
    public setValue(data:any)
    {
        if(!data)return;
        this.value.length = 0;
        if(data.getValue)
        {
            this.value.push.apply(this.value, data.getValue());
        }
        else
        {
            this.value.push.apply(this.value, data);
        }

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public Clone():any
    {
        let valarr:any[] = [];
        for(let i:number = 0;i < this.value.length; i++)
        {
            let itemvar:any = this.value[i];
            let itemval:any = itemvar.getValue();
            let newvar:any = new itemvar.constructor();

            if(itemvar.Clone)
            {
                itemval = itemvar.Clone();
            }

            newvar.setValue(itemval);
            valarr.push(newvar);
        }
        return valarr;
    }

    public ValueAt(index:number)
    {
        if(this.value)
        {
            var varitem = this.value[index];
            if(varitem) return varitem.getValue();
        }
        return null;
    }


    public Push(vo:any)
    {
        this.value.push(vo);

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public Remove(vo:any)
    {
        let index = this.value.indexOf(vo);
        if(index != -1)
        {
            this.value.splice(index, 1);

            if (this.UpdateEvent)
            {
                this.UpdateEvent(this);
            }
        }
    }

    public Contain(vo:any):boolean
    {
        if(this.value.indexOf(vo) == -1)
        return false;
        return true;
    }

    public get Length():number
    {
        return this.value ? this.value.length : 0;
    }
}


///KFD(C,CLASS=SDStringArray,CNAME=字符数组,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDStringArray,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=数据,TYPE=arr,OTYPE=kfstr)
///KFD(*)

///定义一个字符数组对象
export class SDStringArray extends VarScriptData
{
    public value:string[] = [];

    public constructor()
    {
        super("SDStringArray");
    }

    public getValue() {return this.value;}
    public setValue(data:any)
    {
        if(!data)return;
        this.value.length = 0;
        if(data.getValue)
        {
            this.value.push.apply(this.value, data.getValue());
        }
        else
        {
            this.value.push.apply(this.value, data);
        }

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public get Length():number
    {
        return this.value ? this.value.length : 0;
    }

    public ValueAt(index:number):string
    {
        if(this.value)
        {
            return this.value[index];
        }
        return "";
    }

    public VarAt(index:number, share:boolean = true):any
    {
        let sdstr:SDString = share ? SDString.Share : new SDString();
        if(this.value)
        {
            sdstr.value = this.value[index];
        }
        return sdstr;
    }


    public Push(vo:string)
    {
        this.value.push(vo);

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public Remove(vo:string)
    {
        let index = this.value.indexOf(vo);
        if(index != -1)
        {
            this.value.splice(index, 1);

            if (this.UpdateEvent)
            {
                this.UpdateEvent(this);
            }
        }
    }

    public Contain(vo:string):boolean
    {
        if(this.value.indexOf(vo) == -1)
            return false;
        return true;
    }
}

///KFD(C,CLASS=SDFloatArray,CNAME=浮点数组,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDFloatArray,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=数据,TYPE=arr,OTYPE=float)
///KFD(*)

///定义一个浮点数组对象
export class SDFloatArray extends VarScriptData
{
    public value:number[] = [];

    public constructor()
    {
        super("SDFloatArray");
    }

    public getValue() {return this.value;}
    public setValue(data:any)
    {
        if(!data)return;
        this.value.length = 0;
        if(data.getValue)
        {
            this.value.push.apply(this.value, data.getValue());
        }
        else
        {
            this.value.push.apply(this.value, data);
        }

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public ValueAt(index:number):number
    {
        if(this.value)
        {
            return this.value[index];
        }
        return 0;
    }

    public VarAt(index:number, share:boolean = true):any
    {
        let sdstr:SDFloat = share ? SDFloat.Share : new SDFloat();
        if(this.value)
        {
            sdstr.value = this.value[index];
        }
        return sdstr;
    }


    public Push(vo:number)
    {
        this.value.push(vo);

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public Remove(vo:number)
    {
        let index = this.value.indexOf(vo);
        if(index != -1)
        {
            this.value.splice(index, 1);

            if (this.UpdateEvent)
            {
                this.UpdateEvent(this);
            }
        }
    }

    public Contain(vo:number):boolean
    {
        if(this.value.indexOf(vo) == -1)
            return false;
        return true;
    }

    public get Length():number
    {
        return this.value ? this.value.length : 0;
    }
}



///KFD(C,CLASS=SDInt32Array,CNAME=整型数组,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDInt32Array,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=数据,TYPE=arr,OTYPE=int32)
///KFD(*)

///定义一个整型数组对象
export class SDInt32Array extends VarScriptData
{
    public value:number[] = [];

    public constructor()
    {
        super("SDInt32Array");
    }

    public getValue() {return this.value;}
    public setValue(data:any)
    {
        if(!data)return;
        this.value.length = 0;
        if(data.getValue)
        {
            this.value.push.apply(this.value, data.getValue());
        }
        else
        {
            this.value.push.apply(this.value, data);
        }

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public ValueAt(index:number):number
    {
        if(this.value)
        {
            return this.value[index];
        }
        return 0;
    }

    public VarAt(index:number , share:boolean = true):any
    {
        let sdstr:SDFloat = share ? SDFloat.Share : new SDFloat();
        if(this.value)
        {
            sdstr.value = this.value[index];
        }
        return sdstr;
    }


    public Push(vo:number)
    {
        this.value.push(vo);

        if (this.UpdateEvent)
        {
            this.UpdateEvent(this);
        }
    }

    public Remove(vo:number)
    {
        let index = this.value.indexOf(vo);
        if(index != -1)
        {
            this.value.splice(index, 1);

            if (this.UpdateEvent)
            {
                this.UpdateEvent(this);
            }
        }
    }

    public Contain(vo:number):boolean
    {
        if(this.value.indexOf(vo) == -1)
            return false;
        return true;
    }

    public get Length():number
    {
        return this.value ? this.value.length : 0;
    }
}



///定义一个对象数据结构体和一个列表

///KFD(C,CLASS=SDNewBlkDataList,CNAME=对象数据列表,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDNewBlkDataList,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=对象数据,TYPE=arr,OTYPE=KFNewBlkData)
///KFD(*)

export class SDNewBlkDataList extends VarScriptData {

    public value:any[] = [];


    public constructor()
    {
        super("SDNewBlkDataList");
    }

    public getValue() {return this.value;}
    public setValue(data:any){
        if(!data)return;

        this.value.length = 0;
        if(data.getValue){
            this.value.push.apply(this.value, data.getValue());
        }else{
            this.value.push.apply(this.value, data);
        }

        if (this.UpdateEvent) {
            this.UpdateEvent(this);
        }
    }
}

///定义一个BlockTarget数据格式

///KFD(C,CLASS=SDBlockTarget,CNAME=对象数据,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDBlockTarget,OR=1,TYPE=kfname)
///KFD(P=1,NAME=data,CNAME=数据,TYPE=object,OTYPE=KFNewBlkData)
///KFD(P=2,NAME=children,CNAME=子集,TYPE=arr,OTYPE=SDBlockTarget)
///KFD(*)

export class SDBlockTarget extends VarScriptData{

    public data:any;
    public children:any[] = [];

    public constructor()
    {
        super("SDBlockTarget");
    }

    public getValue() {return this.data;}
    public setValue(val:any){
        if(!val) {
            this.children.length = 0;
            this.data = null;
            return;
        }
        this.children.length = 0;
        this.data = val.data;
        this.children.push.apply(this.children, val.children);

        if (this.UpdateEvent) {
            this.UpdateEvent(this);
        }
    }
}


///定义一个BLK参数对象 轻量化的定义只包括参数
///关联可以直接链连到另一个BLK参数的定义

//定义用的结构，更多一些, 值用的类型更加轻量

///KFD(C,CLASS=BLKVarDef,CNAME=参数定义)
///KFD(P=1,NAME=name,CNAME=参数名,TYPE=kfname)
///KFD(P=2,NAME=value,CNAME=参数类型,TYPE=mixobject,OTYPE=KFScriptData)
///KFD(P=3,NAME=enum,CNAME=关联,TYPE=kfstr)
///KFD(P=4,NAME=pkey,CNAME=主键,TYPE=bool)
///KFD(P=5,NAME=label,CNAME=显示名,TYPE=kfstr)
///KFD(*)

///KFD(C,CLASS=SDBLKVarsDef,CNAME=BLK参数定义,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDBLKVarsDef,OR=1,TYPE=kfname)
///KFD(P=1,NAME=name,CNAME=BLK参数名,TYPE=kfname)
///KFD(P=2,NAME=value,CNAME=BLK参数定义,TYPE=arr,OTYPE=BLKVarDef)
///KFD(*)


///值结构

///KFD(C,CLASS=BLKVar,CNAME=参数对)
///KFD(P=1,NAME=name,CNAME=参数名,TYPE=kfname)
///KFD(P=2,NAME=value,CNAME=参数值,TYPE=mixobject,OTYPE=KFScriptData)
///KFD(*)

///KFD(C,CLASS=SDBLKVars,CNAME=BLK参数,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDBLKVars,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=BLK参数数据,TYPE=arr,OTYPE=BLKVar)
///KFD(*)


export class SDBLKVars extends VarScriptData
{
    public value:any[] = [];

    public constructor()
    {
        super("SDBLKVars");

        ///rewrite array tostring function
        let arr:any = this.value;
        arr.toString = function () {
            let arrstr:string = "";
            for(let i:number = 0;i < this.length; i++){
                let item:any = this[i];
                let itemstr:string = "{" + item.name + ":" + item.value +"}";
                if(i != 0){
                    itemstr = "," + itemstr;
                }
                arrstr += itemstr;
            }

            return arrstr;
        }
    }

    public getValue(){return this.value;}
    public setValue(v:any) {
        if(v == null) return;
        if(v.getValue){

            this.value.length = 0;
            this.value.push.apply(this.value, v.value);

            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    }
}


///定义一个对象的引用

///KFD(C,CLASS=SDBlockTargetRef,CNAME=对象引用,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDBlockTargetRef,OR=1,TYPE=kfname)
///KFD(P=1,NAME=name,CNAME=实例名,TYPE=kfname)
///KFD(P=2,NAME=sid,CNAME=实例SID,TYPE=int32)
///KFD(*)

export class SDBlockTargetRef extends VarScriptData {

    public blkref:boolean = true;
    public name:KFDName;
    public sid:number = 0;

    public value:KFBlockTarget = null;

    public constructor()
    {
        super("SDBlockTargetRef");
    }

    public getValue(){return this.value;}
    public setValue(data:any){
        if(data == null){

            if(data == this.value) return;

            this.value = null;
            this.sid = 0;
            this.name = null;

            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }

            return;
        }

        let val:KFBlockTarget;

        if(data.getValue){
            val = data.getValue();
        } else
        {
            val = data;
        }

        if(val != this.value) {
            this.value = val;
            if (this.value) {
                this.name = this.value.name;
                this.sid = this.value.sid;
            } else {
                this.sid = 0;
                this.name = null;
            }

            if (this.UpdateEvent) {
                this.UpdateEvent(this);
            }
        }
    }

}

///KFD(C,CLASS=SDAnyRef,CNAME=任意引用,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=数据类型,DEFAULT=SDAnyRef,OR=1,TYPE=kfname)
///KFD(*)

export class SDAnyRef extends VarScriptData
{
    public value:any = null;

    public constructor()
    {
        super("SDAnyRef");
    }

    public getValue(){return this.value;}
    public setValue(data:any)
    {
        if(data != this.value)
        {
            this.value = data;
            if (this.UpdateEvent)
            {
                this.UpdateEvent(this);
            }
        }
    }
}
