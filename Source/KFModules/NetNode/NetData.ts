import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFDName} from "../../KFData/Format/KFDName";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";
import {KFDataType} from "../../KFData/Format/KFD";
import {WSConnection} from "./WSConnection";
import {LOG, LOG_WARNING} from "../../Core/Log/KFLog";

export interface RPCObject
{
    connection:WSConnection;
    children:{[key:number]:any;};
    actorsid:number;

    getRPCMethod(method:KFDName, objsid?:number) :{func:Function,target:any};

    AddObject(obj:any);
    RemoveObject(obj:any);
    ///网络更新[且只有服务端执行]
    ///NETUPDATE更新不精确计时，与同步相关的更新尽量的物件自己的TICK中
    sUpdateNet(dt:number);
    sSubscribe(localID:number);
    sUnsubscribe(localID:number);
}

export class NetData
{
    public static RPC_cmd:number = 100;
    public static OFFLINE_cmd:number = 404;

    public static int8(val:number):any{return {value:val,type:"int8",rpctype:true};}
    public static int32(val:number):any{return {value:val,type:"int32",rpctype:true};}
    public static num1(val:number):any{return {value:val,type:"num1",rpctype:true};}
    public static kfstr(val:string):any {return {value:val,type:"kfstr",rpctype:true};}
    public static obj(val:any):any{return {value:val,type:"mixobject",rpctype:true}}
    public static arr(val:any):any {return {value:val,type:"mixarr",rpctype:true}}
    public static arrint(val:any):any{return {value:val, type:"arr", otype:"int32",rpctype:true}}
    public static arrstr(val:any):any{return {value:val, type:"arr", otype:"kfstr",rpctype:true}}

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
            }else if(typename == "boolean"){
                bytesarr.writeByte(KFDataType.OT_BOOL);
                bytesarr.writeBoolean(argobj);
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
        }else{
            LOG_WARNING("对象ID={0},名称={1} 参数长度={2} RPC调用被丢失", objsid, methodstr, arglen);
        }
    }

    //如果只想注册一个发送调用把handlers=null 即可
    public static registerpc(obj:any
                             , execSide:number
                             , localid:any // number[] | number
                             , objsid:number
                             , handlers:{[key:number]:{ func: Function; target: any } }
                             , wsconn:any, allnames?:any):void {

        //public serverCall(objectsid:number, method:string, ...args:any[]) {}
        //public clientCall(toclientid:number, objectsid:number, method:string,...args:any[]) {}
        allnames =  allnames ? allnames : obj;

        ///注意在ES6中如果对象编译成class是遍历不出方法
        ///需要自己定义一个方法的map名字叫_rpcmethods_
        if(     allnames.hasOwnProperty("_rpcmethods_")
            &&  allnames._rpcmethods_){
            allnames = allnames._rpcmethods_;
        }

        if(execSide == BlkExecSide.SERVER) {

            for (let mname in allnames) {

                if (mname.indexOf("rpcc_") != -1) {
                    //此函数需要重定向到一个远程调用上
                    if(wsconn){
                    obj[mname] = function (...args:any[]) {
                        args.splice(0,0,localid, objsid, mname);
                        wsconn.clientCall.apply(wsconn, args);
                        };

                        LOG("注册RPC {0}", mname);
                    }

                } else if (handlers && mname.indexOf("rpcs_") != -1) {
                    handlers[KFDName._Strs.GetNameID(mname)]
                    = {func:obj[mname],target:obj};

                    LOG("注册回调 {0}", mname);
                }
            }
        } else if(execSide == BlkExecSide.CLIENT) {
            for (let mname in allnames) {
                if (handlers && mname.indexOf("rpcc_") != -1) {
                    handlers[KFDName._Strs.GetNameID(mname)]
                        = {func:obj[mname],target:obj};
                    LOG("注册回调 {0}", mname);
                }else if (mname.indexOf("rpcs_") != -1) {
                    if(wsconn){
                        obj[mname] = function (...args:any[]) {
                            args.splice(0,0, objsid, mname);
                            wsconn.serverCall.apply(wsconn, args);
                        };

                        LOG("注册RPC {0}", mname);
                    }
                }
            }
        }
    }
}
