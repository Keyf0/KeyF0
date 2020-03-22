import {KFByteArray} from "../Utils/FKByteArray";
import {KFDataType} from "./KFD";
import {KFDTable} from "./KFDTable";
import {KFDName} from "./KFDName";
import {KFBytes} from "./KFBytes";

export class KFDJson
{
    private static _read_base_value(bytearr:KFByteArray
                                    , valtype:number
                                    , skip:boolean=false
                                    , value:any=null
                                    , typename:string=""):any
    {
        let retval = value;
        switch (valtype)
        {
            case KFDataType.OT_INT8:
            {
                if (skip)
                    bytearr.Skip(1);
                else
                    retval = bytearr.readByte();
            }
                break;
        case KFDataType.OT_UINT8:
            {
                if(skip)
                    bytearr.Skip(1);
                else
                    retval = bytearr.readUnsignedByte();
            }
            break;
        case KFDataType.OT_INT16:
            if(skip)
                bytearr.Skip(2);
            else
                retval = bytearr.readShort();
            break;
            case KFDataType.OT_UINT16:
            if (skip)
                bytearr.Skip(2);
            else
                retval = bytearr.readUnsignedShort();
                break;
            case KFDataType.OT_INT32:
                if(skip)
                    bytearr.Skip(4);
                else
                    retval = bytearr.readInt();
                break;
            case KFDataType.OT_UINT32:
                if(skip)
                    bytearr.Skip(4);
                else
                    retval = bytearr.readUnsignedInt();
                break;
            case KFDataType.OT_FLOAT:
                if(skip)
                    bytearr.Skip(4);
                else
                    retval = bytearr.readFloat();
                break;
            case KFDataType.OT_DOUBLE:
                if(skip)
                    bytearr.Skip(8);
                else
                    retval = bytearr.readDouble();
                break;
            case KFDataType.OT_STRING:
                if(skip)
                    bytearr.skipstring();
                else{
                    retval = bytearr.readstring();
                    if(typename == "kfname")
                    {
                        retval = new KFDName(retval);
                    }
                }
                break;
            case KFDataType.OT_BYTES:
                if(skip)
                    bytearr.skipstring();
                else {
                    ///js时的字节全部转化成对象字节
                    let kfbytes = new KFBytes();
                    kfbytes.bytes = bytearr.readkfbytes();
                    retval = kfbytes;
                }
                break;
            case KFDataType.OT_BOOL:
                if(skip)
                    bytearr.Skip(1);
                else
                    retval = bytearr.readBoolean();
                break;
            case KFDataType.OT_VARUINT:
                    retval = bytearr.readvaruint();
                break;
            case KFDataType.OT_INT64:
                if(skip)
                    bytearr.Skip(8);
                else
                    retval = bytearr.readInt64();
                break;
            case KFDataType.OT_UINT64:
                if(skip)
                    bytearr.Skip(8);
                break;
            default:
                    retval = bytearr.readUInt64();
        }
        return retval
    }

    public static init_object(data,kfddata):any
    {
        if(kfddata)
        {
            ///构造函数
            if(data == null)
            {
                if( kfddata.__new__)
                    data = kfddata.__new__();
                else
                    data = {};
            }

            let initparam = kfddata.__init__;
            if (initparam)
            {
                initparam.func.call(initparam.thisobj, data, kfddata, KFDTable.kfdTB);
            }
        }

        return data
    }

    private static _read_object_value(bytearr:KFByteArray
                                      , valtype:number
                                      , kfddata:any = null
                                      , skip:boolean = false
                                      , val:any = null):any
    {
        let retval = val;
        if(skip)
        {
            let deep = 0;
            while(true)
            {
                let pid = bytearr.readvaruint();
                if (pid == KFDataType.OBJ_PROP_ID_BEGIN)
                    deep += 1;
                else if(pid == KFDataType.OBJ_PROP_ID_END)
                {
                    deep -= 1;
                    if(deep <= 0)
                        break
                }
                else {
                        KFDJson.read_value(bytearr,true);
                    }
            }
        }
        else
        {
            let deep = 0;
            let obj = (val != null ? val : null);

            if(obj == null)
            {
                ///如果提共了实初化函数则调用初始化
                obj = KFDJson.init_object(obj,kfddata);
            }

            let currKFDData = kfddata;
            let stack = [];

            while (true)
            {
                let pid = bytearr.readvaruint();
                if(pid == KFDataType.OBJ_PROP_ID_BEGIN)
                {
                    if (deep != 0)
                    {
                        let child = KFDTable.find_extend_kfddata(currKFDData);
                        stack.push(currKFDData);
                        currKFDData = child;
                    }
                    deep += 1;
                }
                else if(pid == KFDataType.OBJ_PROP_ID_END)
                {
                    deep -= 1;
                    if(deep <= 0)
                        break;
                    else
                        currKFDData = stack.pop();
                }else
                {
                    let pinfo = KFDTable.find_prop_info(currKFDData, pid);
                    if(pinfo != null)
                    {
                        let pname = pinfo["name"];
                        let propobj = null;

                        if(obj != null && obj[pname])
                        {
                            propobj = obj[pname];
                        }
                        obj[pname] = KFDJson.read_value(bytearr,false, propobj, pinfo);
                    }
                    else
                    {
                        KFDJson.read_value(bytearr,true);
                    }
                }
            }

            retval = obj;
        }
        return retval;
    }


    private static _read_array_value(bytearr:KFByteArray
                                     , valtype:number
                                     , skip:boolean = false
                                     , val:any = null
                                     , propinfo:any = null):any
    {
        let retval = val;
        if(valtype == KFDataType.OT_ARRAY)
        {
            let size = bytearr.readvaruint();
            let otype = bytearr.readUnsignedByte();
            if(otype <= KFDataType.OT_UINT64)
            {
                if(skip){
                    while (size > 0)
                    {
                        KFDJson._read_base_value(bytearr, otype, true);
                        size -= 1;
                    }
                }else
                {
                    let typename = "";
                    if(propinfo) typename = propinfo.otype;

                    if(retval == null) retval = [];
                    else retval.length = 0;

                    while (size > 0)
                    {
                        retval.push(KFDJson._read_base_value(bytearr, otype, false,null,typename));
                        size -= 1;
                    }
                }
            }
            else
            {
                if(otype == KFDataType.OT_ARRAY || otype == KFDataType.OT_MIXARRAY)
                {
                    if(skip)
                    {
                        while (size > 0)
                        {
                            KFDJson._read_array_value(bytearr, otype, true);
                            size -= 1;
                        }
                    }
                    else
                    {
                        if(retval == null){
                            //全新的读取
                        let arrobj = [];
                        while (size > 0) {
                            arrobj.push(KFDJson._read_array_value(bytearr, otype));
                            size -= 1;
                        }
                        retval = arrobj;
                        } else {
                            ///更新读取
                            retval.length = size;
                            for(let i = 0;i < size;i ++)
                            {
                                let itval = retval[i];
                                if(itval) {
                                    KFDJson._read_array_value(bytearr, otype, false, itval);
                                }
                                else
                                    retval[i] = KFDJson._read_array_value(bytearr, otype);
                            }
                        }
                    }
                }
                else if(otype == KFDataType.OT_OBJECT || otype == KFDataType.OT_MIXOBJECT)
                {
                    if(skip)
                    {
                        while (size > 0)
                        {
                            KFDJson._read_object_value(bytearr, otype,null , true);
                            size -= 1;
                        }
                    }
                    else
                    {
                        let kfddata = null;
                        if (otype == KFDataType.OT_OBJECT && propinfo)
                        {
                            kfddata = KFDTable.kfdTB.get_kfddata(propinfo["otype"]);
                        }

                        if(retval == null) {
                            let objarr = [];
                            while (size > 0) {
                                objarr.push(KFDJson._read_object_value(bytearr, otype, kfddata));
                                size -= 1;
                            }
                            retval = objarr;
                        }else{

                            retval.length = size;
                            for(let i = 0;i < size ;i ++){
                                let itmval = retval[i];
                                if(itmval){
                                    KFDJson._read_object_value(bytearr, otype, kfddata, false, itmval);
                                }else
                                    retval[i] = KFDJson._read_object_value(bytearr, otype, kfddata);
                            }

                        }
                    }
                }
            }
        }
        else if(valtype == KFDataType.OT_MIXARRAY)
        {
            let size = bytearr.readvaruint();
            if(skip)
            {
                while (size > 0)
                {
                    KFDJson.read_value(bytearr,true);
                    size -= 1;
                }
            }
            else
            {
                if(retval == null) {
                    let arrobj = [];
                    while (size > 0) {
                        arrobj.push(KFDJson.read_value(bytearr, false));
                        size -= 1;
                    }
                    retval = arrobj;
                }else{
                    retval.length = size;
                    for(let i = 0;i < size ;i ++){
                        let itmval = retval[i];
                        if(itmval){
                            KFDJson.read_value(bytearr, false, itmval);
                        }else
                            retval[i] = KFDJson.read_value(bytearr, false);
                    }
                }
            }
        }
        return retval;
    }


    public static read_value(bytearr:KFByteArray
                             , skip:boolean = false
                             , jsonobj:any = null
                             , propinfo:any = null):any
    {
        let retval = jsonobj;
        let size = bytearr.bytesAvailable;

        if(size > 0)
        {
            let valueType = bytearr.readUnsignedByte();

            if(valueType <= KFDataType.OT_UINT64)
            {
                ///支持下NULL空对象
                if(valueType == KFDataType.OT_NULL)
                {
                    retval = null;
                }
                else {

                    let typename = "";
                    if (propinfo) {
                        typename = propinfo.type;
                    }
                    retval = KFDJson._read_base_value(bytearr, valueType, skip, jsonobj, typename);
                }
            }
            else
            {
                if(valueType == KFDataType.OT_ARRAY || valueType == KFDataType.OT_MIXARRAY)
                {
                    retval = KFDJson._read_array_value(bytearr, valueType, skip, jsonobj, propinfo);
                }
                else if(valueType == KFDataType.OT_OBJECT)
                {
                    let kfddata = null;
                    if(propinfo != null)
                        kfddata = KFDTable.kfdTB.get_kfddata(propinfo["otype"]);
                    retval = KFDJson._read_object_value(bytearr, valueType, kfddata, skip, jsonobj);
                }
                else if(valueType == KFDataType.OT_MIXOBJECT)
                {
                    let classid = bytearr.readvaruint();
                    let classname = null;
                    if (classid == 1)
                    {
                        classname = bytearr.readstring();
                    }
                    let kfddata = null;
                    if ( classname && classname != "")
                        kfddata = KFDTable.kfdTB.get_kfddata(classname);
                    retval = KFDJson._read_object_value(bytearr, valueType, kfddata, skip, jsonobj);
                    //设置类名吧MIX对象
                    if(retval && kfddata)
                    {
                        retval["__cls__"] = kfddata["class"];
                    }
                }
            }
        }

        return retval;
    }

    public static write_value(bytearr:KFByteArray
                              , jsonobj:any
                              , propinfo:any = null
                                , attribFlags:any = null)
    {
        if(jsonobj != null)
        {
           let valueType = KFDataType.OT_NULL;
           let kfddata = null;

           if(propinfo)
           {
               valueType = KFDataType.GetTypeID(propinfo["type"]);
               if(valueType == KFDataType.OT_MIXOBJECT)
               {
                   ///从对象是MIXOBJECT则是从对角属性中获取
                   kfddata = KFDTable.kfdTB.get_kfddata(jsonobj["__cls__"]);
               }
           }
           else if(jsonobj && jsonobj["__cls__"])
           {
               ///此处有问题如果获取到属性应该用已经获取到的类型
               ///不应该用__cls__来绑架类型
               kfddata = KFDTable.kfdTB.get_kfddata(jsonobj["__cls__"]);
               valueType = KFDataType.OT_MIXOBJECT;
           }

           bytearr.writeByte(valueType);

           if(valueType == KFDataType.OT_NULL){}
           else if(valueType <= KFDataType.OT_UINT64)
           {
               KFDJson._write_base_value(bytearr, valueType, jsonobj);
           }else
               {
                   if(valueType == KFDataType.OT_ARRAY || valueType == KFDataType.OT_MIXARRAY)
                   {
                       KFDJson._write_array_value(bytearr, valueType, jsonobj, propinfo, attribFlags);
                   }
                   else if(valueType == KFDataType.OT_OBJECT)
                   {
                       kfddata = KFDTable.kfdTB.get_kfddata(propinfo["otype"]);
                       KFDJson._write_object_value(bytearr, valueType, jsonobj, kfddata, attribFlags);
                   }
                   else if(valueType == KFDataType.OT_MIXOBJECT)
                   {
                       if(kfddata)
                       {
                           bytearr.writevaruint(1);
                           bytearr.writestring(kfddata["class"]);
                       }else
                           bytearr.writevaruint(0);

                       KFDJson._write_object_value(bytearr, valueType, jsonobj, kfddata, attribFlags);
                   }
               }
        }
        else
        {
            bytearr.writeByte(KFDataType.OT_NULL);
        }
    }


    private static _write_base_value(bytearr:KFByteArray
                                     , dataType:number
                                     , valObject:any)
    {
        if(dataType == KFDataType.OT_UNKNOW)return;

        switch (dataType)
        {
            case KFDataType.OT_INT8:
            case KFDataType.OT_UINT8:
                bytearr.writeByte(valObject);
                break;
            case KFDataType.OT_INT16:
                bytearr.writeShort(valObject);
                break;
            case KFDataType.OT_UINT16:
                bytearr.writeUnsignedShort(valObject);
                break;
            case KFDataType.OT_INT32:
                bytearr.writeInt(valObject);
                break;
            case KFDataType.OT_UINT32:
                bytearr.writeUnsignedInt(valObject);
                break;
            case KFDataType.OT_INT64:
                bytearr.writeInt64(valObject);
                break;
            case KFDataType.OT_UINT64:
                bytearr.writeUInt64(valObject);
                break;
            case KFDataType.OT_FLOAT:
                bytearr.writeFloat(valObject);
                break;
            case KFDataType.OT_DOUBLE:
                bytearr.writeDouble(valObject);
                break;
            case KFDataType.OT_STRING:
                ///类型判定
                if(valObject instanceof KFDName)
                {
                    valObject = valObject.toString();
                }
                bytearr.writestring(valObject);
                break;
            case KFDataType.OT_BYTES:
                if(valObject instanceof KFBytes)
                {
                    let bytesobj = valObject.object;
                    let bytes = valObject.bytes;

                    if(bytesobj)
                    {
                        if(bytes == null)
                        {
                            bytes = new KFByteArray();
                            valObject.bytes = bytes;
                        }
                        bytes.length = 0;
                        KFDJson.write_value(bytes, bytesobj);
                        bytearr.writekfBytes(bytes);
                    }
                    else if(bytes == null) {bytearr.writestring("");}
                    else {
                        //直接写入二进制吧
                        bytearr.writekfBytes(bytes);
                    }
                }
                else {bytearr.writestring("");}
                ///=============
                break;
            case KFDataType.OT_BOOL:
                bytearr.writeBoolean(valObject);
                break;
            case KFDataType.OT_VARUINT:
                bytearr.writevaruint(valObject);
                break;

        }
    }

    private static _write_array_value(bytearr:KFByteArray
                                      , valtype:number
                                      , val:any
                                      , propinfo:any
                                      , attribFlags:any = null)
    {
        let arrval = val
        let arrsize = arrval.length;



        let oType = 0;
        let kfddata = null;

        if(propinfo && propinfo["otype"])
        {
            let otypestr = propinfo["otype"]
            oType = KFDataType.GetTypeID(otypestr);

            if(oType == 0)
            {
                kfddata = KFDTable.kfdTB.get_kfddata(otypestr)
                if (kfddata)
                {
                    if (valtype == KFDataType.OT_ARRAY)
                        oType = KFDataType.OT_OBJECT
                    else
                        oType = KFDataType.OT_MIXOBJECT
                }
            }
        }

        if(valtype == KFDataType.OT_ARRAY)
        {
            if(oType != 0 && oType <= KFDataType.OT_UINT64)
            {
                bytearr.writevaruint(arrsize);
                bytearr.writeByte(oType);

                for (let i = 0 ; i < arrsize; i ++)
                {
                    let item = arrval[i];
                    KFDJson._write_base_value(bytearr, oType, item);
                }
            }
            else
            {
                if(oType == 0 || oType == KFDataType.OT_ARRAY || oType == KFDataType.OT_MIXARRAY)
                {
                    ///不支持
                    bytearr.writevaruint(0);
                    bytearr.writeByte(KFDataType.OT_NULL);
                }
                else if(oType == KFDataType.OT_OBJECT || oType == KFDataType.OT_MIXOBJECT)
                {
                    bytearr.writevaruint(arrsize);
                    bytearr.writeByte(oType);

                    if(oType == KFDataType.OT_MIXOBJECT){}

                    for (let i = 0 ; i < arrsize; i ++)
                    {
                        let item = arrval[i];
                        let attribFlag = attribFlags ? attribFlags._flags_[i] : null;

                        KFDJson._write_object_value(bytearr, oType, item, kfddata, attribFlag);
                    }
                }
            }

        }
        else if(valtype == KFDataType.OT_MIXARRAY)
        {
            bytearr.writevaruint(arrsize);

            for (let i = 0 ; i < arrsize; i ++)
            {
                let item = arrval[i];
                let attribFlag = attribFlags ? attribFlags._flags_[i] : null;

                KFDJson.write_value(bytearr, item, null, attribFlag);
            }
        }
    }

    private static _write_object_value(bytearr:KFByteArray
                                       , dataType:number
                                       , objectval:any
                                       , kfddata:any
                                       , attribFlags:any = null)
    {
        bytearr.writevaruint(KFDataType.OBJ_PROP_ID_BEGIN);
        if(kfddata)
        {
             let extendcls = kfddata["extend"];
             if(extendcls)
             {
                 let extenddata = KFDTable.kfdTB.get_kfddata(extendcls);
                 if(extenddata != null) {

                     KFDJson._write_object_value(bytearr, dataType, objectval, extenddata, attribFlags);
                 }
             }

             let valarr = kfddata["propertys"];
            for (let item of valarr)
            {
                let pid = item["id"];
                let name = item["name"];
                let attribFlag = null;

                if(attribFlags) {
                    //略过不需要写的属性
                    attribFlag = attribFlags[name];

                    if(!attribFlag || attribFlag._w_ == false) {
                        continue;
                    }
                    else if(attribFlag._w_){
                        //_w_可写
                        //已经写过就重置属性状态
                        attribFlag._w_ = false;
                    }
                }

                if(objectval.hasOwnProperty(name) &&
                    pid != KFDataType.OBJ_PROP_ID_BEGIN &&
                    pid != KFDataType.OBJ_PROP_ID_END)
                {
                    bytearr.writevaruint(pid);
                    KFDJson.write_value(bytearr, objectval[name], item, attribFlag);
                }
            }
        }
        bytearr.writevaruint(KFDataType.OBJ_PROP_ID_END);
    }


    ////////////////////////////////////////////////
    ///如果数组或对象不为空后再置空可能会有问题[没有完善]
    /////////////////////////////////////////////////


    public static getpropertynet(item):string {
        let unknowtags = item.unknowtags;
        if(unknowtags) {
            for (let tagitem of unknowtags) {
                if (tagitem.tag == "net")
                    return tagitem.val;
            }
        }
        return "";
    }

    public static buildattribflags( obj:any
                                   , kfddata:any
                                   , attribflags:any = null
                                   , creatupdate:boolean = true
                                   , allprops:boolean = true
                                   , initflags = null):any {

        attribflags = attribflags ? attribflags : {_w_:true,_v_:obj};
        let extendcls = kfddata["extend"];
        if(extendcls) {
            let extenddata = KFDTable.kfdTB.get_kfddata(extendcls);
            if(extenddata != null) {
                KFDJson.buildattribflags(obj, extenddata, attribflags,false, allprops, initflags);
            }
        }
        let valarr = kfddata["propertys"];
        for (let item of valarr)
        {
            let netvalue = (allprops == true ? "life" : KFDJson.getpropertynet(item));
            if(netvalue != "")
            {
                if (netvalue == "life") {

                    let name = item.name;
                    let currval = obj ? obj[name] : null;

                    let flag: any = {_w_: true, _t_: obj, _v_: currval, _n_: name};
                    attribflags[name] = flag;
                    if (!attribflags._flags_)
                        attribflags._flags_ = [];
                    attribflags._flags_.push(flag);

                    let typeid = KFDataType.GetTypeID(item.type);
                    if (typeid <= KFDataType.OT_UINT64) {
                        ///普通属性的检测
                        flag.update = function () {
                            this._w_ = false;
                            if (this._t_) {
                                let curr = this._t_[this._n_];
                                if (curr != this._v_) {
                                    this._w_ = true;
                                    this._v_ = curr;
                                }
                            }
                            return this._w_;
                        };
                    } else if (typeid == KFDataType.OT_OBJECT) {
                        let okfd = KFDTable.kfdTB.get_kfddata(item.otype);
                        KFDJson.buildattribflags(currval, okfd, flag);
                    } else if (typeid == KFDataType.OT_MIXOBJECT) {
                        ///对象为空时先用一个空检测函数
                        flag._null_ = function () {
                            this._w_ = false;
                            if (this._t_) {
                                let curr = this._t_[this._n_];
                                if (curr != null) {
                                    this._w_ = true;
                                    this._v_ = curr;
                                    let mixkfd = KFDTable.kfdTB.get_kfddata(curr.__cls__);
                                    KFDJson.buildattribflags(curr, mixkfd, this);
                                }
                            }
                            return this._w_;
                        };

                        if (currval) {
                            let mixkfd = KFDTable.kfdTB.get_kfddata(currval.__cls__);
                            KFDJson.buildattribflags(currval, mixkfd, flag);
                        } else {
                            flag.update = flag._null_;
                        }
                    } else if (typeid == KFDataType.OT_ARRAY) {
                        let okfd = KFDTable.kfdTB.get_kfddata(item.otype);
                        if (okfd) {
                            ///对象数组
                            flag._flags_ = [];

                            flag.update = function () {
                                this._w_ = false;
                                if (this._t_) {
                                    let curr = this._t_[this._n_];
                                    if (curr != this._v_) {
                                        this._w_ = true;
                                        this._v_ = curr;
                                        //变成了空对象了
                                        if (curr == null) {
                                            this._flags_ = [];
                                        }
                                    }

                                    if (curr) {
                                        let vallen = curr.length;
                                        for (let i = 0; i < vallen; i++) {

                                            let arritemval = curr[i];
                                            let arritemflag = this._flags_[i];

                                            if (arritemflag && arritemflag._v_ != arritemval) {
                                                //对象都已经变更了
                                                arritemflag = null;
                                            }

                                            if (!arritemflag) {
                                                arritemflag = {
                                                    _w_: true
                                                    , _t_: curr
                                                    , _v_: arritemval
                                                    , _n_: i
                                                };
                                                KFDJson.buildattribflags(arritemval, okfd, arritemflag);
                                                this._flags_[i] = arritemflag;
                                                this._w_ = true;
                                            } else {
                                                //还是原始对象可以调用更新检测
                                                this._w_ = this._w_ || arritemflag.update();
                                            }
                                        }
                                    }
                                }
                                return this._w_;
                            }


                        } else {
                            ///普通的数组
                            flag._v_ = currval ? currval.concat() : null;
                            flag.update = function () {
                                this._w_ = false;
                                if (this._t_) {
                                    let curr = this._t_[this._n_];
                                    if (curr) {
                                        if (!this._v_ || curr.length != this._v_.length) {
                                            this._w_ = true;
                                            this._v_ = curr.concat();
                                        } else {
                                            ///记录比较
                                            for (let i = 0; i < this._v_.length; i++) {
                                                let citemv = curr[i];
                                                if (this._v_[i] != citemv) {
                                                    this._v_[i] = citemv;
                                                    this._w_ = true;
                                                }
                                            }
                                        }
                                    } else if (this._v_) {
                                        this._v_ = null;
                                        this._w_ = true;
                                    }
                                }
                                return this._w_;
                            }
                        }
                    } else if (typeid == KFDataType.OT_MIXARRAY) {
                        flag._flags_ = [];
                        flag.update = function () {
                            this._w_ = false;
                            if (this._t_) {
                                let curr = this._t_[this._n_];
                                if (curr != this._v_) {
                                    this._w_ = true;
                                    this._v_ = curr;
                                    //变成了空对象了
                                    if (curr == null) {
                                        this._flags_ = [];
                                    }
                                }
                                if (curr) {
                                    let vallen = curr.length;
                                    for (let i = 0; i < vallen; i++) {

                                        let arritemval = curr[i];
                                        let arritemflag = this._flags_[i];

                                        if (arritemflag && arritemflag._v_ != arritemval) {
                                            //对象都已经变更了
                                            arritemflag = null;
                                        }

                                        if (!arritemflag) {
                                            arritemflag = {
                                                _w_: true
                                                , _t_: curr
                                                , _v_: arritemval
                                                , _n_: i
                                            };
                                            let arritmkfd = KFDTable.kfdTB.get_kfddata(arritemval.__cls__);
                                            KFDJson.buildattribflags(arritemval, arritmkfd, arritemflag);
                                            this._flags_[i] = arritemflag;
                                            this._w_ = true;

                                        } else {
                                            //还是原始对象可以调用更新检测
                                            this._w_ = this._w_ || arritemflag.update();
                                        }
                                    }
                                }
                            }
                            return this._w_;
                        };
                    }

                }

                if(allprops == false && initflags)
                {
                    initflags[name] = {};
                }
            }
        }

        if(creatupdate != false) {
            attribflags.update = function () {
                this._w_ = false;
                let cval = this._v_;
                if(cval && this._flags_){
                    let flaglen = this._flags_.length;
                    for(let i = 0;i < flaglen;i ++) {
                        let itemflag = this._flags_[i];
                        if(itemflag._t_ != cval){
                            itemflag._t_ = cval;
                            this._w_ = true;
                        }
                        this._w_ = this._w_ || itemflag.update();
                    }
                }
                return this._w_;
            }
        }
        return attribflags;
    }

}