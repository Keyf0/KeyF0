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
import {KFGlobalDefines} from "../../ACTS/KFACTSDefines";
import {LOG, LOG_ERROR, LOG_WARNING} from "../../Core/Log/KFLog";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=NetSensorManager,EXTEND=WSConnection)

export class NetSensorManager extends WSConnection implements RPCObject {

    public static Meta:IKFMeta = new IKFMeta("NetSensorManager"
        ,():KFBlockTarget=>{
            return new NetSensorManager();
        });

    ///KFD(P=1,NAME=roleTargetData,CNAME=角色创建,TYPE=object,OTYPE=KFBlockTargetData)
    //目标的TARGETDATA
    public roleTargetData:any;

    public updatetime:number = 100;

    public sensordata = {asseturl: "", instname: NetSensor.Meta.name};
    public netmeta:any = {type:NetSensor.Meta.name};
    public rolenetmeta:any = {type:RoleNetSensor.Meta.name};
    ///KFD(*)

    public children:{[key:number]:any;} = {};
    public rpcmethods:{[key:number]:{ func: Function; target: any } } = {};
    public proxy:NetProxy;
    public connection:WSConnection;
    public actorsid: number;
    public actor:KFActor;

    private isRegisted:boolean = false;
    private _netupdatetime:number = 0;
    private _fixtpf:number = 0;
    private _realframe:number = 0;

    public constructor() {
        super();
        this.proxy = new NetProxy(this);
        this.connection = this;
    }

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        this._fixtpf = this.runtime.fixtpf;

        let parentactor = <any>this.parent;

        if(KFGlobalDefines.IS_Debug) {
            //检测名称是否叫否则自动改名称
            let oldname = this.name.value;
            if (NetSensor.Meta.name.value != oldname) {
                let namestr = this.name.toString();
                this.name = NetSensor.Meta.name;
                this.parent.ChildRename(oldname, this);
                LOG_ERROR("同步对象的名称错误 NetSensor,{0} != NetSensor", namestr);
            }
        }

        this.actor = parentactor;
        this.actorsid = 0;//根的SID置0
    }

    public AddObject(obj:any) {
        let sensor = <NetSensor>obj;
        this.children[sensor.actorsid] = sensor;
    }

    public RemoveObject(obj:any) {
        let sensor = <NetSensor>obj;
        delete this.children[sensor.actorsid];
    }

    public DoOffline(fromid:number){

        let bytevalue = KFDName._Strs.GetNameID("_bye_" + fromid);
        let methodinfo = this.rpcmethods[bytevalue];

        if(methodinfo) {
            delete this.rpcmethods[bytevalue];
            methodinfo.func.call(methodinfo.target);
        }
    }

    protected onLogin(evt: KFEvent) {
        super.onLogin(evt);

        if(!this.isRegisted) {
            ///注册
            this.isRegisted = true;
            NetData.registerpc(this.proxy, this.execSide, this.localid, 0, this.rpcmethods, this);
        }

        if(this.execSide == BlkExecSide.SERVER){
            LOG("\n==============\n==============\n服务启动成功\n场景:{0}\n==============\n==============\n"
                , this.actor.metadata.asseturl);
        } else if(this.execSide == BlkExecSide.CLIENT){

            LOG("{0}请求登录" ,this._randomname);
            this.proxy.rpcs_login(this.localid,this._randomname);
        }
    }

    protected onData(evt: KFEvent) {

        let rpcdata:any = evt.arg;
        let cmd = rpcdata.cmd;

        if(cmd == NetData.RPC_cmd) {
            let databytes:KFByteArray = rpcdata.databytes;
            databytes.SetPosition(0);
            NetData.readrpcCall(databytes, this);
        } else if(cmd == NetData.OFFLINE_cmd){
            ///有连接离线了
            let fromid = rpcdata.fromid;
            LOG("收到{0}离线信息",fromid);
            this.DoOffline(fromid);
        }
    }
    //objectsid:对象sid
    //method:对象的方法
    //args:参数
    public serverCall(objectsid:number, method:string, ...args:any[]) {
        args.splice(0,0, objectsid, method);
        this._wsClient.writefromfunc(this.serverid,NetData.RPC_cmd,NetData.writerpc, args);
    }
    public clientCall(toclientid:any, objectsid:number, method:string,...args:any[]) {

        args.splice(0,0, objectsid, method);
        this._wsClient.writefromfunc(toclientid, NetData.RPC_cmd, NetData.writerpc, args);
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

    public Tick(frameindex: number): void
    {
        ///保证下如果出现网络延时连续执行时不会多次执行
        ///NETUPDATE更新不精确计时，与同步相关的更新尽量的物件自己的TICK中
        let rt = this.runtime;
        let rfindex = rt.realframeindex;
        if(this._realframe != rfindex) {
            super.Tick(frameindex);
            this._realframe = rfindex;

            if(this.execSide == BlkExecSide.SERVER) {

                this._netupdatetime += this._fixtpf;
                if (this._netupdatetime >= this.updatetime) {
                    this._netupdatetime -= this._fixtpf;
                    this.sUpdateNet(this.updatetime);
                }
            }
        }
    }

    ///网络更新
    ///NETUPDATE更新不精确计时，与同步相关的更新尽量的物件自己的TICK中
    public sUpdateNet(dt: number) {
        ///驱动网络对象更新
        for(let sid  in this.rpcobjects) {
            let rpcobj:NetSensor = this.rpcobjects[sid];
            rpcobj.sUpdateNet(dt);
        }
    }


    ///无用...
    sSubscribe(localID: number) {}
    sUnsubscribe(localID: number) {}
}

export class NetProxy {

    public mgr:NetSensorManager;
    public attachactor:KFBlockTarget;
    public localid:number = 0;
    public name:KFDName;
    public proxys:{[key:number]:NetProxy;} = {};
    private _offlineid:number = 0;

    public constructor(mgr:NetSensorManager) {
        this.mgr = mgr;
    }

    public offline() {
        ///离线调用
        LOG("目前没有登录成功,无需离线");
    }

    private _soffline(){
        ///服务端的退出调用
        if(this.attachactor) {
            let actorname = this.attachactor.name;
            this.mgr.actor._DeleteChild(this.attachactor);
            this.attachactor = null;
            ///删除引用
            delete this.mgr.proxy.proxys[actorname.value];
            LOG("{0} 成功离线", actorname.toString());
        }
    }


    //服务端调用，
    //定义RPC方法 rpcs_ rpcc_
    public rpcs_login(localid:number, username:string) {

        let instname = new KFDName(username);
        let clientproxy = this.proxys[instname.value];

        if(!clientproxy) {

            this.mgr.DoOffline(localid);

            clientproxy = new NetProxy(this.mgr);
            clientproxy.localid = localid;
            clientproxy.name = instname;

            this.proxys[instname.value] = clientproxy;
            //只注册发送不注册侦听
            NetData.registerpc(clientproxy, this.mgr.execSide, localid, 0, null, this.mgr);

            //注册一个退出回调
            this.mgr.rpcmethods[KFDName._Strs.GetNameID("_bye_" + localid)]
                = {func:clientproxy._soffline,target:clientproxy};
        }

        let parent = this.mgr.parent;
        let blk = parent.FindChild(instname.value);

        //没有找到则创建一个吧
        if(!blk) {

            let targetdata = this.mgr.roleTargetData;
            targetdata.execSide = BlkExecSide.SERVER;
            targetdata.instname = instname;
            blk = parent.CreateChild(targetdata);
            blk.set_position({x:300,y:10 + Math.random() * 500});
            (<any>blk).velocity.x = 1;
            (<any>blk).velocity.y = 1;
        }

        if(blk) {
            //通知登录成功
            clientproxy.rpcc_postlogin(blk.sid, username);
            //创建或寻找感知对象 第一级对象不从全局找而直接从父级找吧
            let rolesensor = <RoleNetSensor>this.mgr.children[blk.sid];
            if(!rolesensor) {
                let roleactor = <KFActor>blk;
                rolesensor = <RoleNetSensor>roleactor.CreateChild(
                        this.mgr.sensordata
                    ,   this.mgr.rolenetmeta);
            }
            LOG("{0}服务端对象创建成功...",username);
            //连接proxy
            clientproxy.attachactor = blk;
            rolesensor.Connect(clientproxy);
        }
        else {
            clientproxy.rpcc_postlogin(-1,"对象创建失败");
        }
    }

    //客户端调用
    public rpcc_postlogin(actorsid:number,data?:string) {
        if(actorsid > 0) {
            LOG("{0}[{1}]登录服务器成功", data, actorsid);
            //绑定一个退出调用
            if(this._offlineid != this.localid) {
                this._offlineid = this.localid;
                let self = this;
                self.offline = function (...args: any[]) {
                    args.splice(0, 0, self.localid, 0, "_bye_" + self.localid);
                    self.mgr.clientCall.apply(self.mgr, args);
                };
            }
        }else{
            LOG_ERROR("登录失败{0}",data);
        }
    }

    //调用客户端创建对象arr<KFTargetData>
    public rpcc_createactors(newblkdatas:any[], init:boolean, deletSIDs?:number[]) {

        ///如果传递过来是INIT需要做一些ACTOR的清理和删除
        LOG("收到创建角色的信息长度:{0} init:{1}",newblkdatas? newblkdatas.length: 0 ,init);

        if(init) {
            deletSIDs = [];
            ///把场景中的所有元素遍历出来
            let rpcobjects = this.mgr.rpcobjects;
            for(let sid in rpcobjects){
                let actorsid = rpcobjects[sid].actorsid;
                if(actorsid != 0){
                    deletSIDs.push(actorsid);
                }
            }
        }

        if(newblkdatas) {

            let scene: KFActor = this.mgr.actor;
            let parent: KFActor = null;

            for (let newdata of newblkdatas) {

                let parentsid = newdata.parentsid;
                if (parentsid == 0) {
                    parent = scene;
                } else {
                    let rpcobj: NetSensor = <NetSensor>this.mgr.rpcobjects[parentsid];
                    parent = <KFActor>rpcobj.actor;
                }
                if (parent) {
                    ///先寻找
                    let targetData = newdata.targetData;

                    let newblk: KFBlockTarget = parent.FindChild(targetData.instname.value);
                    ///SID对不上的话还是需要删除的
                    if(newblk && newblk.sid != targetData.instsid){newblk = null;}

                    if (!newblk) {
                        newblk = parent.CreateChild(targetData);
                    }
                    else if(init) {
                        ///寻找到了元素,需要从删除列表中去掉
                        let delindex = deletSIDs.indexOf(newblk.sid);
                        if(delindex != -1)
                            deletSIDs.splice(delindex,1);
                    }

                    if (newblk) {

                        //查看是否有网络对象
                        let netobject: NetSensor = this.mgr.rpcobjects[newblk.sid];
                        //创建网络对象
                        if (netobject == null) {
                            let newactor = <KFActor>newblk;
                            netobject = <NetSensor>newactor.CreateChild(
                                this.mgr.sensordata, this.mgr.netmeta);
                        }
                        //写入初始数据
                        if (netobject) {
                            netobject.cUpdateActor(newdata.metaData, true);
                        }
                    }
                } else {
                    LOG_ERROR("没有找到父级,对象创建失败aasseturl={0}"
                        , newdata.targetData.asseturl);
                }
            }
        }

        if(deletSIDs) {

            let rpcobjects:{[key:number]:NetSensor} = this.mgr.rpcobjects;
            for(let delsid of  deletSIDs) {
                let rspobj = rpcobjects[delsid];
                if(rspobj) {
                    let delactor = rspobj.actor;
                    LOG("取消关注删除对象{0}", delactor.name.toString());
                    let parent = delactor.parent;
                    parent._DeleteChild(delactor);
                }
            }
        }
    }
}


