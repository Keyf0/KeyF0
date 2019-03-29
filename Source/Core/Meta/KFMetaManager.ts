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
        this.name = name;
        if(func == null)
            this.instantiate = () =>{return null;};
        else
            this.instantiate = func;

        if(this.name != "")
        {
            KFMetaManager.Register(this);
        }
    }
}

export class KFMetaManager
{
    private static typeidstart:number = 1;
    private static m_metas:Array<IKFMeta> = new Array<IKFMeta>();
    private static m_mapMetas:{[key:string]:IKFMeta} = {};

    public static Register(meta:IKFMeta):boolean
    {
        if(meta.type > 0 || meta.name == "")
            return false;
        this.m_metas.push(meta);
        meta.type = this.m_metas.length;
        this.m_mapMetas[meta.name] = meta;
        return true;
    }

    public static GetMetaType(type:number):IKFMeta
    {
        let i = type - KFMetaManager.typeidstart;
        return this.m_metas[i];
    }

    public static GetMetaName(name:string):IKFMeta
    {
        return this.m_mapMetas[name];
    }
}