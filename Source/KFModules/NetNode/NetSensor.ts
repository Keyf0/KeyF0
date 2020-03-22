import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {NetData, RPCObject} from "./NetData";
import {KFDName} from "../../KFData/Format/KFDName";
import {WSConnection} from "./WSConnection";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG_ERROR, LOG_WARNING} from "../../Core/Log/KFLog";
import {KFActor} from "../../ACTS/Actor/KFActor";
import {KFGlobalDefines} from "../../ACTS/KFACTSDefines";
import {KFBytes} from "../../KFData/Format/KFBytes";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDTable} from "../../KFData/Format/KFDTable";
import {KFDJson} from "../../KFData/Format/KFDJson";


///KFD(C,CLASS=NetSensor,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=tickable,CNAME=开启更新,DEFAULT=true,OR=1,TYPE=bool)
///KFD(*)

export class NetSensor extends KFBlockTarget implements RPCObject {

    public static Meta:IKFMeta = new IKFMeta("NetSensor"
        ,():KFBlockTarget=>{
            return new NetSensor();
        });

    public children:{[key:number]:any;} = {};
    public execSide:number = BlkExecSide.UNKNOW;
    public isActived:boolean = false;
    public isRole:boolean = false;
    public connection:WSConnection = null;
    public rpcmethods: { [key: number]: { func: Function; target: any } } = {};

    //绑定的ACTORSID
    public actorsid:number = 0;
    //绑定的actor
    public actor:KFActor;
    public rpcparent:RPCObject;

    //运行在服务端有的属性
    public sKFNewBlkData:any;
    public sAttribFlags:any;
    public sInitFlags:any;

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.execSide = runtime.execSide;
        this.etable = new KFEventTable();
    }

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        let senosorname = NetSensor.Meta.name.value;
        let parentactor = <any>this.parent;

        //检测名称否则自动改名称
        if(KFGlobalDefines.IS_Debug) {

            let oldname = this.name.value;
            if (senosorname != oldname) {
                let namestr = this.name.toString();
                this.name = NetSensor.Meta.name;
                parentactor.ChildRename(oldname, this);
                LOG_ERROR("同步对象的名称错误 NetSensor,{0} != NetSensor", namestr);
            }

            //检测下父级的创建是否合法
            if(     this.execSide == BlkExecSide.SERVER
                && ( !parentactor.CreateTargetData
                ||  parentactor.CreateTargetData.createOnClient != false)) {
                LOG_ERROR("具有同步对象的ACTOR 创建属性createOnClient必需为false");
                this.tickable = false;
                return;
            }
        }

        this.actor = parentactor;
        this.actorsid = parentactor.sid;
        //寻找父级的同步对象且注册
        this.rpcparent = <RPCObject>parentactor.parent.FindChild(senosorname);
        if(this.rpcparent) {

            ///注册方法
            this.isActived  = true;
            this.tickable = true;
            this.connection = this.rpcparent.connection;
            this.connection.rpcobjects[this.actorsid] = this;

            //在服务端创建的localid都为-1,客户端创建的localid=连接的ID
            let localid = this.execSide == BlkExecSide.SERVER ? -1 : this.connection.localid;
            //在服务端注册的对象只有调用事件，没有回调事件??后面处理
            NetData.registerpc(parentactor
                ,this.execSide
                ,localid
                ,this.actorsid
            ,this.rpcmethods,this.connection);
            //注册几个同步事件
            //初始化数据
            if(this.execSide == BlkExecSide.SERVER) {

                let kfbytes = new KFBytes();
                kfbytes.bytes = new KFByteArray();
                let actormeta = this.actor.metadata;

                this.sKFNewBlkData  = {
                    __cls__:"KFNewBlkData"
                    , targetData:{
                          asseturl: actormeta.asseturl
                        , instname: this.actor.name
                        , instsid: this.actorsid
                    }
                    , metaData:{
                        data: kfbytes
                    }
                    , parentsid:this.rpcparent.actorsid
                };

                //构建好关注数据
                let kfddata = KFDTable.kfdTB.get_kfddata(actormeta.type.toString());

                this.sInitFlags = {};
                this.sAttribFlags = {_w_:true,_v_:this.actor};

                KFDJson.buildattribflags(this.actor
                    , kfddata
                    , this.sAttribFlags
                    ,true,false
                    , this.sInitFlags);

                //读取初始化数据
                KFDJson.write_value(kfbytes.bytes
                    , this.actor
                    ,null
                    , this.sInitFlags);
            }

            this.rpcparent.AddObject(this);

        } else {

            LOG_ERROR("NetSensor 对象不能独立存在");
            this.tickable = false;
        }
    }

    public DeactiveBLK(): void {

        let rpcparent = this.rpcparent;
        if(rpcparent){
            rpcparent.RemoveObject(this);
        }
        this.rpcparent = null;

        if(this.connection){
           delete this.connection.rpcobjects[this.actorsid];
        }

        this.actor = null;
        this.connection = null;
        this.rpcmethods = null;
        this.isActived = false;
        this.tickable = false;

        super.DeactiveBLK();
    }

    public getRPCMethod(method: KFDName,objsid?: number): { func: Function; target: any } {
        return this.rpcmethods[method.value];
    }

    public AddObject(obj:any) {
        let sensor = <NetSensor>obj;
        this.children[sensor.actorsid] = sensor;
    }

    public RemoveObject(obj:any) {
        let sensor = <NetSensor>obj;
        delete this.children[sensor.actorsid];
    }

    public sCollectNewBlk(arr:any[])
    {
        arr.push(this.sKFNewBlkData);
        for(let sid in this.children) {
            this.children[sid].sCollectNewBlk(arr);
        }
    }

    //同步客户端数据了
    public rpcc_update(KFMetaData:any, init:boolean = false) {

        let kfbytes:KFBytes = KFMetaData.data;
        if(kfbytes && kfbytes.bytes) {
            KFDJson.read_value(kfbytes.bytes,false, this.actor);
        }
    }
}