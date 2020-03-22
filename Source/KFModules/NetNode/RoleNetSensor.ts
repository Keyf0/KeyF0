import {NetSensor} from "./NetSensor";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {NetProxy} from "./NetSensorManager";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";



///KFD(C,CLASS=RoleNetSensor,EXTEND=NetSensor)
///KFD(*)

export class RoleNetSensor extends NetSensor {

    public static Meta:IKFMeta = new IKFMeta("RoleNetSensor"

        ,():KFBlockTarget=>{
            return new RoleNetSensor();
        }
    );

    protected _proxy:NetProxy;
    protected _interesteds:NetSensor[];

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.isRole = true;
    }

    private sUpdateAOI():void {


    }

    //连接到一个RPOXY上
    public Connect(proxy:NetProxy)
    {
        this._proxy = proxy;

        if(this.execSide == BlkExecSide.SERVER) {

            ///重新收集感兴趣的对象
            this._interesteds = [];
            let children:{[key:number]:any;} = this.rpcparent.children;
            ///后面需要分格子？
            for (let sid in children) {
                let child:NetSensor = <NetSensor>children[sid];
                if(child != this) {
                    this._interesteds.push(child);
                }
            }

            ///发送初始化事件给客户端吧
            let newblks = [];
            this.sCollectNewBlk(newblks);
            for(let it of this._interesteds){
                it.sCollectNewBlk(newblks);
            }
            this._proxy.rpcc_createactors(newblks);
        }
    }

    public Disconnect(){

    }
}