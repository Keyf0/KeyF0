import {LOG, LOG_ERROR, LOG_WARNING} from "../Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";

export interface InstantiateFunc
{
    (): any;
}

///一个抽角的META不用直接实例化
export class AMeta
{
    public type:number;
    public name:string;
    public instantiate:InstantiateFunc;

    public constructor(name:string = "",func:InstantiateFunc = null)
    {
        this.SetDefaultFactroy(name, func);
    }

    public SetDefaultFactroy(name:string, func:InstantiateFunc = null)
    {
        this.name = name;

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
    public constructor(name:string = "",func:InstantiateFunc = null)
    {
        super(name,func);
    }

    public SetDefaultFactroy(name:string, func:InstantiateFunc = null)
    {
        super.SetDefaultFactroy(name,func);

        if(this.name != "")
        {
            KFMetaManager.Register(this);
        }
    }
}

export class DefaultType<T>
{
    public meta:AMeta;
    public instance:T = null;

    public new_default():T
    {
        if(this.instance == null)
        {
            this.instance = this.new_instance();
        }
        return this.instance;
    }

    public new_instance():T
    {
        if(this.meta == null)
            return null;
        let instance = this.meta.instantiate();
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
        let name = meta.name;
        if(meta.type > 0 || name == "")
        {
            return false;
        }
        let namevalue = KFDName._Strs.GetNameID(name);
        let oldmeta = this.m_mapMetas[namevalue];
        if(oldmeta)
        {
            meta.type = oldmeta.type;
            LOG_WARNING("[{0}] {1}注册重复", this.m_name, name);
            return;
        }
        else{
            LOG("[{0}] {1}注册成功",this.m_name, name);
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