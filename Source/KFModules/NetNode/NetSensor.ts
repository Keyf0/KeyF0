import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {NetData, RPCObject} from "./NetData";
import {KFDName} from "../../KFData/Format/KFDName";
import {WSConnection} from "./WSConnection";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";
import {KFGlobalDefines} from "../../ACTS/KFACTSDefines";
import {KFBytes} from "../../KFData/Format/KFBytes";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {KFDTable} from "../../KFData/Format/KFDTable";
import {KFDJson} from "../../KFData/Format/KFDJson";
import {KFAttribflags} from "../../KFData/Format/KFAttribflags";
import {KFScriptGroupType} from "../../KFScript/KFScriptGroupType";

///KFD(C,CLASS=NetSensor,EXTEND=KFBlockTarget)
///KFD(*)


export class NetSensor extends KFBlockTarget implements RPCObject {

    public static Meta:IKFMeta = new IKFMeta("NetSensor"
        ,():KFBlockTarget=>{
            return new NetSensor();
        });

    public static VarPropsDef:any;

    public static TYPE_NORMAL:number = 0;
    //角色感知器
    public static TYPE_ROLE:number = 1;
    //绑定的是自己
    public static TYPE_SELF:number = 2;
    //绑定自己的角色感知器
    public static TYPE_ROLE_SELF:number = 3;

    ///网络TICK的时间
    public updatetime:number = 100;

    public children:{[key:number]:any;} = {};
    public execSide:number = BlkExecSide.UNKNOW;
    public isActived:boolean = false;
    public sensorType:number = NetSensor.TYPE_NORMAL;
    public connection:WSConnection;
    public rpcmethods: { [key: number]: { func: Function; target: any } } = {};

    //绑定的ACTORSID
    public actorsid:number;
    //绑定的actor
    public actor:KFBlockTarget;
    public rpcparent:RPCObject;


    //运行在服务端有的属性
    public sKFNewBlkData:any;
    public sAttribFlags:KFAttribflags;
    public sInitFlags:KFAttribflags;
    public sUpdateMeta:any;
    //哪个人的关心你的状态
    public sWhoCares:number[];

    ///运行时间
    protected  m_timeincr:number = 0;

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.execSide = runtime.execSide;
    }

    protected BuildInternalRpc(){
        let self = this;
        if(this.execSide == BlkExecSide.SERVER)
        {
            ///服务端注册调用
            self.cUpdateActor = function (...args:any[]) {
            args.splice(0
                ,0
                , self.sWhoCares
                , this.actorsid
                , "cUpdateActor");
            self.connection.clientCall.apply(self.connection, args);
            };
            ///通知自己子集有对象被删除了
            ///TODO


        } else {
            ///客户端注册回调
           this.rpcmethods[KFDName._Strs.GetNameID("cUpdateActor")]
                = {func:this.cUpdateActor,target: this};
        }
    }

    public ActivateBLK(KFBlockTargetData: any): void {

        super.ActivateBLK(KFBlockTargetData);

        let senosorname = NetSensor.Meta.name.value;

        if((this.sensorType & NetSensor.TYPE_SELF) == 0) {
            let parentactor = <any>this.parent;
            //如果是绑定型同步对象
            //检测名称否则自动改名称
            if (KFGlobalDefines.IS_Debug) {

                let oldname = this.name.value;
                if (senosorname != oldname) {
                    let namestr = this.name.toString();
                    this.name = NetSensor.Meta.name;
                    parentactor.ChildRename(oldname, this);
                    LOG_ERROR("同步对象的名称错误 NetSensor,{0} != NetSensor", namestr);
                }

                //检测下父级的创建是否合法
                let execSide = parentactor.execSide ? parentactor.execSide : BlkExecSide.BOTH;
                if ((this.execSide & execSide) != this.execSide) {
                    LOG_ERROR("具有同步对象的ACTOR execSide 必需为服务器");
                    return;
                }
            }
            this.actor = parentactor;
            this.actorsid = parentactor.sid;
        }else {

            ///自己就是那个对象
            this.actor = this;
            this.actorsid = this.sid;
        }

        //寻找父级的同步对象且注册
        this.rpcparent = <RPCObject><any>this.actor.parent.FindChild(senosorname);
        if(this.rpcparent) {
            ///注册方法
            this.isActived  = true;
            this.connection = this.rpcparent.connection;
            this.connection.rpcobjects[this.actorsid] = this;
            //在服务端创建的localid都为-1,客户端创建的localid=连接的ID
            let localid:any = this.connection.localid;
            if(this.execSide == BlkExecSide.SERVER)
            {
                this.sWhoCares = [];
                ///同步事件是向所有关注你的客户端发送的
                localid = this.sWhoCares;
            }

            //在服务端注册的对象只有调用事件，没有回调事件??后面处理
            NetData.registerpc(this.actor
                , this.execSide
                , localid
                , this.actorsid
            , this.rpcmethods,this.connection);

            //注册几个同步事件
            this.BuildInternalRpc();

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
                let clsname = actormeta.type.toString();
                let kfddata = KFDTable.kfdTB.get_kfddata(clsname);

                let InitFlags:KFAttribflags = new KFAttribflags();
                InitFlags._isdirty_ = false;
                this.sInitFlags = InitFlags;
                let AttribFlags:KFAttribflags = new KFAttribflags(this.actor,undefined,true);
                this.sAttribFlags = AttribFlags;

                let extProps:any[];
                let actorvars:{[key:number]:any} = this.actor.vars;
                if(actorvars) {
                    let has = false;
                    let extprops = [];

                    for (let vari in actorvars) {
                        let varo =  actorvars[vari];
                        if(varo.group == KFScriptGroupType.NetVar){
                            has = true;
                            //网络对象需要添加到同步数组中...
                            if(NetSensor.VarPropsDef == null) {
                               let varprop = {name: "vars"
                                   , unknowtags: [{tag: "NET", val: "life"}]
                                   , type:"object"
                                   , kfd:{}};
                                NetSensor.VarPropsDef = varprop;
                            }
                            
                            let extp:any = {};
                            extp.name = vari;
                            extp.type = "mixobject";
                            extp.otype = "KFScriptData";
                            extprops.push(extp)
                        }
                    }

                    if(has) {
                        NetSensor.VarPropsDef.kfd.propertys = extprops;
                        extProps = [NetSensor.VarPropsDef];
                    }
                }

                KFAttribflags.buildattribflags(this.actor
                    , kfddata
                    , AttribFlags
                    ,true,false
                    , InitFlags
                    , extProps);

                //读取初始化数据
                KFDJson.write_value(kfbytes.bytes
                    , this.actor
                    ,null
                    , this.sInitFlags);
            }

            this.rpcparent.AddObject(this);

        } else {

            LOG_ERROR("NetSensor 对象不能独立存在");
        }
    }

    public DeactiveBLK(): void {

        let rpcparent = this.rpcparent;
        if(rpcparent){
            rpcparent.RemoveObject(this);
        }
        this.rpcparent = null;

        if (this.connection) {
            delete this.connection.rpcobjects[this.actorsid];
        }

        if(this.execSide == BlkExecSide.SERVER) {

            if(this.sWhoCares) {
                this.sClearWhoCares();
            }

            this.sWhoCares = null;
            this.connection = null;
            this.rpcmethods = null;

            this.sKFNewBlkData = null;
            this.sAttribFlags = null;
            this.sInitFlags = null;

        }

        this.isActived = false;
        this.actor = null;

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

    //增加关注
    public sSubscribe(localID:number) {

        if(this.sWhoCares && this.sWhoCares.indexOf(localID) == -1){
            this.sWhoCares.push(localID);
        }
    }

    //取消关注
    public sUnsubscribe(localID:number){
        if(this.sWhoCares) {
            let index = this.sWhoCares.indexOf(localID);
            if (index != -1) {
                this.sWhoCares.splice(index, 1);
            }
        }
    }

    public sClearWhoCares() {
        ///此处需要把关注我的人物通知其消失吗？TODO？？
        ///人物的定时TICK会关注到消失但会有延时，所以需要做一个反向通知吗？
        ///暂时不处理
    }


    public sCollectNewBlk(arr:any[])
    {
        if(this.sInitFlags._isdirty_)
        {
            ///如果已经脏了，大其他人访问初始的时候就需要更新下
            this.sInitFlags._isdirty_ = false;
            let bytearr = this.sKFNewBlkData.metaData.data.bytes;
            bytearr.length = 0;

            KFDJson.write_value(bytearr
                , this.actor
                ,null
                , this.sInitFlags);
        }

        arr.push(this.sKFNewBlkData);

        for(let sid in this.children)
        {
            this.children[sid].sCollectNewBlk(arr);
        }
    }

    //同步客户端数据了
    public cUpdateActor(KFMetaData:any, init:boolean = false) {
        let kfbytes:KFBytes = KFMetaData.data;
        if(kfbytes && kfbytes.bytes) {
            KFDJson.read_value(kfbytes.bytes,false, this.actor);
        }
    }

    ///网络更新
    ///NETUPDATE更新不精确计时，与同步相关的更新尽量的物件自己的TICK中
    public sUpdateNet(dt: number) {

        this.m_timeincr += dt;
        if(this.m_timeincr >= this.updatetime){
            this.m_timeincr -= this.updatetime;

            let _w_:boolean = this.sAttribFlags.update();
            if(_w_){

                this.sInitFlags._isdirty_ = true;

                if(!this.sUpdateMeta) {
                    let UpdateMeta = {
                         __cls__:"KFMetaData"
                        ,data: new KFBytes()
                    };
                    UpdateMeta.data.bytes = new KFByteArray();
                    this.sUpdateMeta = UpdateMeta;
                }

                let bytesarr = this.sUpdateMeta.data.bytes;
                bytesarr.length = 0;

                KFDJson.write_value(bytesarr
                    , this.actor
                    ,null
                    , this.sAttribFlags);

                this.cUpdateActor(this.sUpdateMeta, false);
            }
        }
    }
}