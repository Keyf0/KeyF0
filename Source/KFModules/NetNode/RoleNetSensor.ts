import {NetSensor} from "./NetSensor";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {NetProxy} from "./NetSensorManager";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {NetData, RPCObject} from "./NetData";
import {LOG} from "../../Core/Log/KFLog";



///KFD(C,CLASS=RoleNetSensor,EXTEND=NetSensor)
///KFD(*)

export class RoleNetSensor extends NetSensor {

    public static Meta:IKFMeta = new IKFMeta("RoleNetSensor"

        ,():KFBlockTarget=>{
            return new RoleNetSensor();
        }
    );

    public static AOI_TIME:number = 300;

    protected _proxy:NetProxy;
    protected _interesteds:{[key:number]:NetSensor;};
    protected _backITs:{[key:number]:NetSensor;};
    protected _checktimes:number;

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.sensorType = NetSensor.TYPE_ROLE;
    }

    private sUpdateAOI(init:boolean):void {

        ///交换成背后的DICT
        let backits = this._backITs;
        this._backITs = this._interesteds;
        ///初始化时重新刷新所有
        if(init || !backits){backits = {};}

        let newblks:any[];
        this._interesteds = backits;

        let children:{[key:number]:any;} = this.rpcparent.children;
        ///后面需要分格子？
        for (let sid in children) {
            let child:NetSensor = <NetSensor>children[sid];
            if(child != this) {
                ///在此之前还需要一个可见性的判定 TODO

                this._interesteds[sid] = child;
                child.sSubscribe(this._proxy.localid);

                if(this._backITs.hasOwnProperty(sid)) {
                    delete this._backITs[sid];
                }
                else {

                    if(!init) {
                        ///通知有新的加入
                        if (!newblks)
                            newblks = [];
                        child.sCollectNewBlk(newblks);
                    }
                }
            }
        }

        if(!init) {

            let delsids:number[];
            ///检测有哪些需要通知删除
            for(let leftsid in  this._backITs){
                let rpsobj:RPCObject = this._backITs[leftsid];
                if(rpsobj) {
                    //取消关注了
                    rpsobj.sUnsubscribe(this._proxy.localid);
                    if (!delsids) {delsids = [];}
                    delsids.push(rpsobj.actorsid);
                }
                delete this._backITs[leftsid];
            }

            if(delsids || newblks) {
                //通知更新可见状态
                this._proxy.rpcc_createactors(NetData.arr(newblks)
                    , init
                    , NetData.arrint(delsids));
            }
        }
    }

    //只有服务器执行
    public sUpdateNet(dt: number) {
            super.sUpdateNet(dt);
            //可见性判定的频率再低一些吧默认0.5秒
            this._checktimes -= dt;
            if(this._checktimes <= 0) {
                this._checktimes = RoleNetSensor.AOI_TIME;
                this.sUpdateAOI(false);
            }
    }

    public sCollectNewBlk(arr: any[],ids:boolean = false) {

        super.sCollectNewBlk(arr);
        if(ids) {
            ///还需要收集自己感兴趣的
            for (let itsid in this._interesteds) {
                let it = this._interesteds[itsid];
                it.sCollectNewBlk(arr);
            }
        }
    }

    //连接到一个RPOXY上
    public Connect(proxy:NetProxy)
    {
        this._proxy = proxy;
        if(this.execSide == BlkExecSide.SERVER) {
            //0.5ms 检测一次
            this._checktimes =  RoleNetSensor.AOI_TIME;
            ///重新收集感兴趣的对象
            if(this._interesteds){
                this.ClearInterested();
            }
            this._interesteds = {};

            this.sUpdateAOI(true);
            ///关注下自己
            this.sSubscribe(proxy.localid);
            ///发送初始化事件给客户端吧
            let newblks = [];
            this.sCollectNewBlk(newblks, true);
            this._proxy.rpcc_createactors(NetData.arr(newblks), true);
            LOG("通知客户端初始化{0}个Actor",newblks.length);
        }
    }

    public ClearInterested() {
        ///把关注的对象需要清空
        for(let leftsid in  this._interesteds){
            let rpsobj:RPCObject = this._interesteds[leftsid];
            if(rpsobj) {
                //取消关注了
                rpsobj.sUnsubscribe(this._proxy.localid);
            }
        }
        this._interesteds = null;
    }

    public DeactiveBLK(): void {

        if(this.execSide == BlkExecSide.SERVER) {
            this.ClearInterested();
        }

        super.DeactiveBLK();
    }
}