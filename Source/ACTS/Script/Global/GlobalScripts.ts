import {KFScript, KFScriptContext, KFScriptData} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../KFScriptFactory";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";
import {KFExpression} from "./KFExpression";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {LOG} from "../../../Core/Log/KFLog";

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
            let currside = toj.execSide;

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


//extends scriptdata
export class kfVector3 {

    public x:number;
    public y:number;
    public z:number;

    public constructor(x:number=0,y:number=0,z:number=0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public setValue2(v2:any)
    {
        this.x = v2.x;
        this.y = v2.y;
    }

    public setValue(v3:any)
    {
        this.x = v3.x;
        this.y = v3.y;
        this.z = v3.z;
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
}

export class SDFloat {

    public value:number = 0;

    public setValue(v)
    {
        if(isNaN(v)) {
            this.value = v.getValue();
        }
        else this.value = v;
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
}

export class SDInt32 {

    public value:number = 0;
    public setValue(v)
    {
        if(isNaN(v)) {
            this.value = v.getValue();
        }
        else this.value = v;
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
}

export class SDString {

    public value:string = "";
    public setValue(v)
    {   if(typeof(v) != "string") {
        this.value = v.getValue();
        }
        else this.value = v;
    }

    public getValue() {return this.value;};

    public add(vo)
    {
        let v = vo;
        if(typeof(v) != "string"){v = vo.getValue();}
        this.value += v;
    }
}


///定义一个对象数据结构体和一个列表

///KFD(C,CLASS=SDNewBlkDataList,CNAME=对象数据列表,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=SDNewBlkDataList,OR=1,TYPE=kfname)
///KFD(P=1,NAME=value,CNAME=对象数据,TYPE=arr,OTYPE=KFNewBlkData)
///KFD(*)

export class SDNewBlkDataList{

    public value:any[] = [];

    public getValue() {return this.value;}
    public setValue(data:any){
        if(!data)return;
        this.value.length = 0;
        if(data.getValue){
            this.value.push.apply(this.value, data.getValue());
        }else{
            this.value.push.apply(this.value, data);
        }
    }
}


///定义一个对象的引用

///KFD(C,CLASS=SDBlockTargetRef,CNAME=对象引用,EXTEND=KFScriptData)
///KFD(P=1,NAME=type,CNAME=脚本类型,DEFAULT=SDBlockTargetRef,OR=1,TYPE=kfname)
///KFD(P=1,NAME=name,CNAME=实例名,TYPE=kfname)
///KFD(P=2,NAME=sid,CNAME=实例SID,TYPE=int32)
///KFD(*)

export class SDBlockTargetRef {

    public name:KFDName;
    public sid:number = 0;

    public value:KFBlockTarget = null;

    public getValue(){return this.value;}
    public setValue(data:any){
        if(data == null){
            this.value = null;
            this.sid = 0;
            this.name = null;

            return;
        }
        if(data.getValue){
            this.value = data.getValue();
        } else
        {
            this.value = data;
        }

        if(this.value){
            this.name = this.value.name;
            this.sid = this.value.sid;
        }else{
            this.sid = 0;
            this.name = null;
        }
    }

}