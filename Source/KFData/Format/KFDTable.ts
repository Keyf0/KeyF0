import {KFDataType} from "./KFD";

export class KFDTable
{
    public static kfdTB:KFDTable = new KFDTable();

    public static find_prop_info(   kfddata
                                 ,  pid:number):any
    {
        if(kfddata == null)return null;
        let __ids__ = kfddata["__ids__"];
        if(__ids__ == null)
        {
            __ids__ = {};
            kfddata["__ids__"] = __ids__;
            let propertys = kfddata["propertys"];
            let proplen = propertys.length;
            let i = 0;
            while (i < proplen)
            {
                let prop = propertys[i];
                __ids__[prop["id"]] = prop;
                i += 1;
            }
        }
        return __ids__[pid];
    }


    public static find_extend_kfddata(kfddata,  tb:KFDTable = null):any
    {
        if(kfddata == null) return null;
        let __extend__ = kfddata["__extend__"];
        
        if( __extend__ == null && kfddata["extend"])
        {
            if(tb == null) tb = KFDTable.kfdTB;
            __extend__ = tb.get_kfddata(kfddata["extend"]);
            if(__extend__)
                kfddata["__extend__"] = __extend__;
        }

        return __extend__;
    }


    private kfddata_maps:{[key:string]:any} = {};

    public get_kfddata(clsname:string):any
    {
        return this.kfddata_maps[clsname];
    }

    ///获取所有的继承类
    public get_kfddatas_extend(clsname:string,includeself:boolean = false): any
    {
        let all = [];
        for (const key in this.kfddata_maps)
        {
            let data = this.kfddata_maps[key];
            if(includeself && data["class"] == clsname)
            {

            }
            else if(this.is_extend(data,clsname))
            {

            }else
                data = null;

            if(data)
            {
                let clsname = data["class"];
                ///显用
                let cname = data["cname"];
                let clslabel = (cname ? cname : clsname) + "[" + clsname + "]";

                all.push({label:clsname,label0:clslabel,value:data});
            }
        }
        return all;
    }

    public is_extendname(name, clsname:string, self:boolean = false):boolean
    {
        if(self && name == clsname)
            return true;
        return this.is_extend(this.get_kfddata(name),clsname);
    }

    public is_extend(kfddata,clsname:string,self:boolean = false):boolean
    {
        if(self && kfddata["class"] == clsname)
            return true;

        let extend = kfddata["extend"];

        while (extend)
         {
             if (extend == clsname)
                 return true;
             kfddata = this.get_kfddata(extend);
             extend = kfddata ? kfddata["extend"] : null;
         }

        return false;
    }

    public has_cls(clsname:string):boolean
    {
        return this.kfddata_maps[clsname] != null;
    }

    public add_kfd(kfd):void
    {
        if(kfd instanceof Array)
        {
            for(let kfddata of kfd)
            {
                let clsname = kfddata["class"]
                this.kfddata_maps[clsname] = kfddata;
            }

        }else
        {
            let clsname = kfd["class"]
            if(clsname)
                this.kfddata_maps[clsname] = kfd;
        }
    }

    public has_otype(otype):boolean
    {
        if(otype == "")return true;
        if(KFDataType.Is_BaseTypeStr(otype))
            return true;
        return this.has_cls(otype);
    }
}