import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {WSMDClient} from "../../KFNetwork/WS/WSMDClient";
import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";

///KFD(C,CLASS=WSConnection,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=tickable,CNAME=开启更新,DEFAULT=true,OR=1,TYPE=bool)


export class WSConnection extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("WSConnection"
        ,():KFBlockTarget=>{
            return new WSConnection();
        });

    ///KFD(P=1,NAME=wsurl,CNAME=网络地址,TYPE=kfstr)
    public wsurl:string = "ws://127.0.0.1:8000/ws";
    ///KFD(P=2,NAME=localid,CNAME=本地编号,DEFAULT=10000,TYPE=int32)
    public localid:number = 10000;
    ///KFD(P=3,NAME=serverid,CNAME=服务编号,DEFAULT=100,TYPE=int32)
    public serverid:number = 100;
    ///KFD(P=4,NAME=token,CNAME=服务密码,DEFAULT=abc,TYPE=kfstr)
    public token:string = "abc";
    ///KFD(P=5,NAME=timeout,CNAME=超时时间[ms],DEFAULT=3000,TYPE=int32)
    public timeout:number = 3000;
    ///默认32kb
    ///KFD(P=6,NAME=readbuffsize,CNAME=缓冲大小[b],DEFAULT=32768,TYPE=int32)
    public readbuffsize:number = 1024 * 32;
    ///尝试时间
    ///KFD(P=7,NAME=tryinterval,CNAME=重连间隔[ms],DEFAULT=1000,TYPE=int32)
    public tryinterval:number = 1000;


    ///KFD(*)

    public isLogined():boolean {
        return this._wsClient ?
            this._wsClient.isLogined() : false;
    }

    public execSide:number  = BlkExecSide.UNKNOW;
    public rpcobjects:{[key:number]:any;} = {};

    ///是否在连接中
    private _Conntecting:boolean = false;
    private _trytimes:number = 0;
    private _waittime:number = 0;

    protected _wsClient:WSMDClient;
    protected _randomname:string;

    public Construct(metadata: any, runtime: IKFRuntime) {

        super.Construct(metadata, runtime);

        this.tickable = true;
        this.etable = new KFEventTable();
        this.execSide = runtime.execSide;
    }

    public ActivateBLK(KFBlockTargetData: any): void {

        super.ActivateBLK(KFBlockTargetData);

        if(!this._wsClient) {

            //如果运行的服务端用服务端的ID
            let localid = this.execSide == BlkExecSide.SERVER ?  this.serverid : this.localid;

            this._randomname = "d_" + (new Date()).getTime() + "_" + Math.floor(Math.random() * 1000000);
            this._wsClient = new WSMDClient({
                    token :  this.token
                ,   localID : localid
                ,   userName: this._randomname
            });

            this._wsClient.AddEventListener(this._wsClient._onLoginEvt.type
                ,this.onLogin,this);
            this._wsClient.AddEventListener(this._wsClient._onCloseEvt.type
                ,this.onClose,this);
            this._wsClient.AddEventListener(this._wsClient._onDataEvt.type
                ,this.onData,this);
        }
    }

    public DeactiveBLK(): void {

        super.DeactiveBLK();

        if(this._wsClient){
            this._wsClient.RemoveEventListener(this._wsClient._onLoginEvt.type
                ,this.onLogin);
            this._wsClient.RemoveEventListener(this._wsClient._onCloseEvt.type
                ,this.onClose);
            this._wsClient.RemoveEventListener(this._wsClient._onDataEvt.type
                ,this.onData);

            this._wsClient.disconnect();
            this._wsClient = null;
        }
    }

    public Tick(frameindex: number): void
    {
        if(this._wsClient && this._wsClient.isConnected) {

        }
        else if(false == this._Conntecting) {

            let now:number = (new Date()).getTime();
            if((now - this._waittime) >= this._trytimes * this.tryinterval) {
                this._waittime = now;
                this.tryconnect();
            }
        }
    }

    protected tryconnect() {

        this._Conntecting = true;
        this._wsClient.connect(this.wsurl);
    }

    protected onLogin(evt:KFEvent) {
        //更新当前的ID
        this._trytimes = 0;
        this._Conntecting = false;
        this.localid = this._wsClient.getLocalID();
    }

    protected onClose(evt:KFEvent) {
        this._trytimes += 1;
        this._Conntecting = false;
    }

    protected onData(evt:KFEvent) {

    }

    ///寻找localid的rpcobject
    public FindTarget(localid:number):any{}

    public serverCall(objectsid:number, method:string, ...args:any[]) {}
    public clientCall(toclientid:any, objectsid:number, method:string,...args:any[]) {}
}