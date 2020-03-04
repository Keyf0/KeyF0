import {LOG_ERROR} from "../Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";

export interface InstantiateFunc
{
    (): any;
}


export class IKFMeta
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

        if(this.name != "")
        {
            KFMetaManager.Register(this);
        }
    }
}

export class DefaultType<T>
{
    public meta:IKFMeta;
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
    private static typeidstart:number = 1;
    private static m_metas:Array<IKFMeta> = new Array<IKFMeta>();
    private static m_mapMetas:{[key:number]:IKFMeta} = {};

    public static Register(meta:IKFMeta):boolean
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
            return;
        }

        meta.type = this.m_metas.length;
        this.m_metas.push(meta);

        this.m_mapMetas[namevalue] = meta;
        return true;
    }

    public static GetMetaType(type:number):IKFMeta
    {
        let i = type - KFMetaManager.typeidstart;
        return this.m_metas[i];
    }

    public static GetMetaName(name:KFDName):IKFMeta
    {

        return this.m_mapMetas[name.value];
    }
}