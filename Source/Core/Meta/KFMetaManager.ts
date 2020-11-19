import {LOG, LOG_ERROR, LOG_WARNING} from "../Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";

export interface InstantiateFunc
{
    (...rest:any[]): any;
}

///一个抽角的META不用直接实例化
export class AMeta
{
    public type:number;
    public name:KFDName;
    public instantiate:InstantiateFunc;
    public execSide:number = 3;

    public constructor(name:string = "",func:InstantiateFunc = null, execSide:number = 3)
    {
        this.execSide = execSide;
        this.SetDefaultFactroy(name, func);
    }

    public SetDefaultFactroy(namestr:string, func:InstantiateFunc = null)
    {
        this.name = new KFDName(namestr);
        if(func == null)
        {
            if(this.instantiate == null)
                this.instantiate = () => {
                    return null;
                };
        }
        else
            this.instantiate = func;
    }
}


export class IKFMeta extends AMeta
{
    public constructor(name:string = "",func:InstantiateFunc = null, execSide:number = 3)
    {
        super(name,func,execSide);
    }

    public SetDefaultFactroy(namestr:string, func:InstantiateFunc = null)
    {
        super.SetDefaultFactroy(namestr,func);

        if(this.name.value != 0)
        {
            KFMetaManager.Register(this);
        }
    }
}

export class DefaultType<T>
{
    public meta:AMeta;
    public instance:T = null;

    public new_default(...rest:any[]):T
    {
        if(this.instance == null)
        {
            if(this.meta != null) {
                this.instance = this.meta.instantiate.apply(null, rest);
            }
        }
        return this.instance;
    }

    public new_instance(...rest:any[]):T
    {
        if(this.meta == null)
            return null;
        let instance = this.meta.instantiate.apply(null,rest);
        return instance;
    }
}


export class KFMetaManager
{
    private static _Inst:KFMetaManager = new KFMetaManager();

    private typeidstart:number = 1;
    private m_name = "";
    private m_metas:Array<AMeta> = new Array<AMeta>();
    private m_mapMetas:{[key:number]:AMeta} = {};

    public constructor(startid:number = 1,name:string="Meta")
    {
        this.typeidstart = startid;
        this.m_name = name;
    }

    public _Register(meta:AMeta):boolean
    {
        let namevalue = meta.name.value;

        if(meta.type > 0 || namevalue == 0)
        {
            return false;
        }

        let namestr = meta.name.toString();
        let oldmeta = this.m_mapMetas[namevalue];
        if(oldmeta)
        {
            meta.type = oldmeta.type;
            LOG_WARNING("[{0}] {1}注册重复", this.m_name, namestr);
            return;
        }
        else{
            LOG("[{0}] {1}注册成功",this.m_name, namestr);
        }

        meta.type = this.m_metas.length;
        this.m_metas.push(meta);

        this.m_mapMetas[namevalue] = meta;
        return true;
    }

    public  _GetMetaType(type:number):AMeta
    {
        let i = type - this.typeidstart;
        return this.m_metas[i];
    }

    public _GetMetaName(name:KFDName):AMeta
    {
        return this.m_mapMetas[name.value];
    }

    public static Register(meta:AMeta):boolean
    {
        return KFMetaManager._Inst._Register(meta);
    }

    public static GetMetaType(type:number):AMeta
    {
        return KFMetaManager._Inst._GetMetaType(type);
    }

    public static GetMetaName(name:KFDName):AMeta
    {
        return KFMetaManager._Inst._GetMetaName(name);
    }
}