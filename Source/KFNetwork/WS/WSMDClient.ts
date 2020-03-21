import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";

export class WSMDClient extends KFEventTable
{
    public isConnected:boolean = false;

    public isLogined(){return this._islogined;}
    public getLocalID(){return this._localID;}

    private _ws:WebSocket;
    private _token:string = "";
    ///如果连接成功后更改成服务端分配的ID
    private _localID:number = 0;
    private _userName:string = "";
    private _writebuff:KFByteArray;
    private _readdata:any;

    public _onDataEvt:KFEvent = new KFEvent(KFDName._Param.setString("onData"));
    public _onLoginEvt:KFEvent = new KFEvent(KFDName._Param.setString("onLogin"));
    public _onCloseEvt:KFEvent = new KFEvent(KFDName._Param.setString("onClose"));

    private _islogined:boolean = false;

    public constructor(option:any = null)
    {
        super();

        this.setparam(option);
        let buffsize = option && option.buffsize ? option.buffsize : 32;

        this._writebuff = new KFByteArray(null, buffsize * 1024);

        this._readdata = {
            cmd     :0,
            evtlen  :0,
            bodytype:0,
            datalen :0,
            fromid  :0,
            toid    :0,
            evt:"",
            datastr:"",
            databytes:new KFByteArray(null,buffsize * 1024)
        };
    }

    private onConntected(evt) {

        LOG("连接成功发送登陆信息...");

        this.isConnected = true;
        let logindata = {
            token:this._token
            , remoteID:this._localID
            , userName:this._userName
        };

        this.write_pdata(JSON.stringify(logindata));
    }

    private _onLoginData(dataobj) {

       let retinfo = JSON.parse(dataobj.datastr);
       let ret = retinfo.ret;

       if(ret != 0) {
           let msg = retinfo.msg;
           LOG_ERROR("登录失败:{0}",msg);
       }
       else
       {
           LOG("登录成功");
           this._islogined = true;
           this._localID = retinfo.remoteID;
           this.FireEvent(this._onLoginEvt);
       }
    }

    private onData(evt)
    {
        let bytesarr:KFByteArray = new KFByteArray(evt.data);
        let isa = bytesarr.readByte();
        if(isa == 97)
        {
            bytesarr.Skip(2);

            let readdata = this._readdata;

            readdata.cmd = bytesarr.readShort();
            readdata.evtlen = bytesarr.readShort();
            readdata.bodytype = bytesarr.readByte();
            readdata.datalen = bytesarr.readInt();
            readdata.fromid = bytesarr.readUnsignedInt();
            readdata.toid = bytesarr.readUnsignedInt();
            readdata.evt  = "";
            readdata.datastr = "";

            if(readdata.evtlen > 0){
                readdata.evt = bytesarr.readUTFBytes(readdata.evtlen);
            }

            if(readdata.datalen > 0){
                if(readdata.bodytype == 0){
                    readdata.datastr = bytesarr.readUTFBytes(readdata.datalen);
                }else{

                    let bodybytes:KFByteArray = readdata.databytes;
                    bodybytes.length = 0;
                    bytesarr.readBytes(bodybytes,0, readdata.datalen);
                }
            }

            if(this._islogined)
            {
                this._onDataEvt.arg = readdata;
                this.FireEvent(this._onDataEvt);
            }
            else
            {
                this._onLoginData(readdata);
            }

        }else {
            LOG_ERROR("格式不下确断开连接了")

            let self = this;
            self._ws.close(3000,"format error!");
        }
    }

    private onError(evt)
    {
        this.onClosed(evt);
    }

    private onClosed(evt)
    {
        this.isConnected = false;
        this._islogined = false;

        if(this._ws)
        {
            this._ws.onopen = null;
            this._ws.onerror = null;
            this._ws.onclose =  null;
            this._ws.onmessage = null;
            this._ws = null;
        }

        this.FireEvent(this._onCloseEvt);
    }

    public write_pdata(data:any
                        , event:string=null
                        , dataType:number=0
                        , cmd:number=0
                        , fromid:number=0
                        , toid:number=0)
    {
        let databytes = data;

        if( typeof(data)=='string')
        {
            databytes = this._writebuff.encodeUTF8(data);
            dataType = 0
        }

        let evtbytes = null;
        if(event)
        {
            evtbytes = this._writebuff.encodeUTF8(event);
        }

        this._writebuff.length = 0;

        this._writebuff.writeByte(97);
        this._writebuff.writeByte(98);
        this._writebuff.writeByte(99);
        this._writebuff.writeShort(cmd);
        ///evtlen
        this._writebuff.writeShort(evtbytes ? evtbytes.length : 0);
        ///bodytype
        this._writebuff.writeByte(dataType);
        ///datalen
        this._writebuff.writeInt(databytes ?databytes.length : 0);
        this._writebuff.writeInt(fromid);
        this._writebuff.writeInt(toid);

        if(evtbytes){
            this._writebuff._writeUint8Array(evtbytes);
        }
        if(databytes){
            this._writebuff._writeUint8Array(databytes);
        }
        ///发送数据
        this._ws.send(this._writebuff.buffer);
    }

    public writefromfunc(toid:number, cmd:number, serialize:Function, args:any,target:any = null)
    {
        this._writebuff.length = 0;

        this._writebuff.writeByte(97);
        this._writebuff.writeByte(98);
        this._writebuff.writeByte(99);
        this._writebuff.writeShort(cmd);
        ///evtlen
        this._writebuff.writeShort( 0);
        ///bodytype
        this._writebuff.writeByte(1);
        ///datalen
        let bodylenpos = this._writebuff.GetPosition();

        this._writebuff.writeInt(0);
        this._writebuff.writeInt(this._localID);
        this._writebuff.writeInt(toid);

        let bodystart = this._writebuff.GetPosition();
        serialize.call(target, this._writebuff, args);
        let endpos = this._writebuff.GetPosition();
        let cbodylen = endpos - bodystart;

        this._writebuff.SetPosition(bodylenpos);
        this._writebuff.writeInt(cbodylen);
        this._writebuff.SetPosition(endpos);

        ///发送数据
        this._ws.send(this._writebuff.buffer);
    }

    public setparam(option:any) {
        if(option) {
            this._token = option.token;
            this._localID = option.localID;
            this._userName = option.userName;
        }
    }

    public connect(url:string)
    {
        if(!this._ws)
        {
            let self  = this;

            this._ws = new WebSocket(url);
            this._ws.binaryType = 'arraybuffer';

            this._ws.onopen = function (evt) {
                self.onConntected(evt);
            };
            this._ws.onerror = function (evt) {
                LOG_ERROR("连接错误事件:{0}",evt)
                self.onError(evt);
            };
            this._ws.onclose = function (evt) {
                LOG("断开连接事件...");
                self.onClosed(evt);
            };
            this._ws.onmessage = function (evt) {
                self.onData(evt);
            };
        }
    }

    public disconnect(){
        if(this._ws && this.isConnected){
            this._ws.close(3000, "close by self");
        }
    }

}