/****
* 网络对象感知器管理
* 把服务端的对象通知给各个客户端知晓
* */

import {WSConnection} from "./WSConnection";
import {NetSensor} from "./NetSensor";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {NetData, RPCObject} from "./NetData";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFActor} from "../../ACTS/Actor/KFActor";
import {RoleNetSensor} from "./RoleNetSensor";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFGlobalDefines} from "../../ACTS/KFACTSDefines";

export class NetSensorManager extends WSConnection implements RPCObject {

    //目标的TARGETDATA
    public roleTargetData:any;
    public childrens:{[key:number]:any;} = {};
    public rpcmethods:{[key:number]:{ func: Function; target: any } } = {};
    public proxy:NetProxy;
    public connection:WSConnection;
    public actorsid: number;

    private isRegisted:boolean = false;

    public constructor() {
        super();
        this.proxy = new NetProxy(this);
        this.connection = this;
    }

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);
        if(KFGlobalDefines.IS_Debug) {
            //检测名称是否叫否则自动改名称
            let oldname = this.name.value;
            if (NetSensor.Meta.name.value != oldname) {
                this.name = NetSensor.Meta.name;
                this.parent.ChildRename(oldname, this);
            }
        }

    }

    public AddObject(obj:any) {
        let sensor = <NetSensor>obj;
        this.childrens[sensor.actorsid] = sensor;
    }

    public RemoveObject(obj:any) {
        let sensor = <NetSensor>obj;
        delete this.childrens[sensor.actorsid];
    }

    protected onLogin(evt: KFEvent) {
        super.onLogin(evt);
        if(!this.isRegisted) {
            ///注册
            this.isRegisted = true;
            NetData.registerpc(this.proxy, this.execSide, this.localid, 0, this.rpcmethods, this);
        }
    }


    protected onData(evt: KFEvent) {
        let rpcdata:any = evt.arg;
        if(rpcdata.cmd == NetData.RPC_cmd) {
            let databytes:KFByteArray = rpcdata.databytes;
            databytes.SetPosition(0);
            NetData.readrpcCall(databytes, this);
        }
    }
    //objectsid:对象sid
    //method:对象的方法
    //args:参数
    public serverCall(objectsid:number, method:string, ...args:any[]) {
        args.splice(0,0, objectsid, method);
        this._wsClient.writefromfunc(this.serverid,NetData.RPC_cmd,NetData.writerpc, args);
    }
    public clientCall(toclientid:number, objectsid:number, method:string,...args:any[]) {

        args.splice(0,0, objectsid, method);
        this._wsClient.writefromfunc(toclientid,NetData.RPC_cmd,NetData.writerpc,args);
    }
    //获取一个RPC的注册
    public getRPCMethod(method: KFDName, objsid?: number): { func: Function; target: any } {

        if(isNaN(objsid) || objsid == 0) {
            //0是从根节点调用
            return this.rpcmethods[method.value];
        }
        else {
            let rpcobj = this.rpcobjects[objsid];
            return rpcobj == null ? null : rpcobj.getRPCMethod(method, objsid);
        }
    }
}

export class NetProxy {

    public mgr:NetSensorManager;
    public localid:number = 0;
    public proxys:{[key:number]:NetProxy;} = {};

    public constructor(mgr:NetSensorManager) {
        this.mgr = mgr;
    }

    //服务端调用，
    //定义RPC方法 rpcs_ rpcc_
    public rpcs_login(localid:number, username:string) {

        let instname = new KFDName(username);
        let clientproxy = this.proxys[instname.value];

        if(!clientproxy) {

            clientproxy = new NetProxy(this.mgr);
            clientproxy.localid = localid;
            this.proxys[instname.value] = clientproxy;
            //只注册发送不注册侦听
            NetData.registerpc(clientproxy, this.mgr.execSide, localid, 0, null, this.mgr);
        }

        let targetdata = this.mgr.roleTargetData;
        let parent = this.mgr.parent;
        let blk = <KFActor>parent.FindChild(instname.value);

        //没有找到则创建一个吧
        if(!blk) {
            targetdata.instname = instname;
            blk = <KFActor>parent.CreateChild(targetdata);
        }

        if(blk) {
            //通知登录成功
            clientproxy.rpcc_postlogin(blk.sid);
            //创建或寻找感知对象
            let rolesensor = <RoleNetSensor>this.mgr.childrens[blk.sid];
            if(!rolesensor) {
                //通过名称关联
                let sensordata = {asseturl: "", instname: NetSensor.Meta.name};
                let meta:any = {type:RoleNetSensor.Meta.name};
                rolesensor = <RoleNetSensor>blk.CreateChild(sensordata ,meta);
            }
            //连接proxy
            rolesensor.Connect(clientproxy);
        }
        else {
            clientproxy.rpcc_postlogin(-1,"对象创建失败");
        }
    }

    //客户端调用
    public rpcc_postlogin(actorsid:number,msg?:string) {

    }

    //调用客户端创建对象arr<KFTargetData>
    public rpcc_createactors(newblkdatas:any[]) {

    }
}


