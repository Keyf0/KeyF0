import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFDName} from "../../KFData/Format/KFDName";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";
import {KFDataType} from "../../KFData/Format/KFD";
import {WSConnection} from "./WSConnection";

export interface RPCObject
{
    connection:WSConnection;
    childrens:{[key:number]:any;};
    actorsid:number;

    getRPCMethod(method:KFDName, objsid?:number) :{func:Function,target:any};
    AddObject(obj:any);
    RemoveObject(obj:any);
}

export class NetData
{
    public static RPC_cmd:number = 100;

    public static int8(val:number):any{return {value:val,type:"int8",rpctype:true};}
    public static int32(val:number):any{return {value:val,type:"int32",rpctype:true};}
    public static num1(val:number):any{return {value:val,type:"num1",rpctype:true};}
    public static kfstr(val:string):any {return {value:val,type:"kfstr",rpctype:true};}
    public static obj(val:any):any{return {value:val,type:"mixobject",rpctype:true}}
    public static arr(val:any):any{return {value:val,type:"mixarr",rpctype:true}}

    //写入RPC数据
    public static writerpc(bytesarr:KFByteArray, args:any[]) {
        ///变长INT
        ///kfstr
        ///1byte的参数长度
        ///连续写入参数
        bytesarr.writevaruint(args[0]);
        bytesarr.writestring(args[1]);
        let arglen = args.length;
        bytesarr.writeByte(arglen - 2);

        for(let i = 2;i < arglen;i ++) {

            let argobj = args[i];
            let typename = typeof(argobj);

            if(typename == "string") {
                bytesarr.writeByte(KFDataType.OT_STRING);
                bytesarr.writestring(argobj);
            }
            else if(typename == "number"){
                bytesarr.writeByte(KFDataType.OT_INT32);
                bytesarr.writeInt(argobj);
            }
            else if(argobj.rpctype == true) {
                KFDJson.write_value(bytesarr, argobj.value, argobj);
            }
            else {
                KFDJson.write_value(bytesarr, argobj);
            }
        }
    }

    //读取并调用C++需要生成代码JS就用反射了
    public static readrpcCall(bytesarr:KFByteArray, rpcmgr:RPCObject) {
        ///变长INT
        ///kfstr
        ///1byte的参数长度
        ///连续写入参数
        let objsid = bytesarr.readvaruint();
        let methodstr = bytesarr.readstring();
        let args:any[] = [];

        let arglen = bytesarr.readByte();
        for(let i = 0;i < arglen;i ++) {
            args.push(KFDJson.read_value(bytesarr));
        }

        let methodinfo:{func:Function,target:any} = rpcmgr.getRPCMethod(
            KFDName._Param.setString(methodstr),
            objsid);
        if(methodinfo){
            methodinfo.func.apply(methodinfo.target, args)
        }
    }

    //如果只想注册一个发送调用把handlers=null 即可
    public static registerpc(obj:any
                             , execSide:number
                             , localid:number
                             , objsid:number
                             , handlers:{[key:number]:{ func: Function; target: any } }
                             , wsconn:any, allnames?:any):void {

        //public serverCall(objectsid:number, method:string, ...args:any[]) {}
        //public clientCall(toclientid:number, objectsid:number, method:string,...args:any[]) {}
        allnames =  allnames ? allnames : obj;

        if(execSide == BlkExecSide.SERVER) {
            for (let mname in allnames) {
                if (mname.indexOf("rpcc_") != -1) {
                    //此函数需要重定向到一个远程调用上
                    if(wsconn){
                    obj[mname] = function (...args:any[]) {
                        args.splice(0,0,localid, objsid, mname);
                        wsconn.clientCall.apply(wsconn, args);
                        };
                    }

                } else if (handlers && mname.indexOf("rpcs_") != -1) {
                    handlers[KFDName._Strs.GetNameID(mname)]
                    = {func:obj[mname],target:obj};
                }
            }
        } else if(execSide == BlkExecSide.CLIENT) {
            for (let mname in allnames) {
                if (handlers && mname.indexOf("rpcc_") != -1) {
                    handlers[KFDName._Strs.GetNameID(mname)]
                        = {func:obj[mname],target:obj};
                }else if (mname.indexOf("rpcs_") != -1) {
                    if(wsconn){
                        obj[mname] = function (...args:any[]) {
                            args.splice(0,0, objsid, mname);
                            wsconn.serverCall.apply(wsconn, args);
                        };
                    }
                }
            }
        }
    }
}
