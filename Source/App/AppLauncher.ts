import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {KFHttpFileIO} from "../KFNetwork/Http/KFHttpFileIO";
import {HttpRequest_Type} from "../KFNetwork/Http/Request/HttpRequest";
import {WebHttpRequest} from "../KFNetwork/Http/Request/web/WebHttpRequest";
import {IKFConfigs, IKFConfigs_Type} from "../ACTS/Context/IKFConfigs";
import {DefaultAppConfig} from "./DefaultAppConfig";
import {KFApp} from "../iSay/KFApp";
import {BlkExecSide} from "../ACTS/Context/KFBlockTarget";
import {KFGlobalDefines} from "../ACTS/KFACTSDefines";

export class AppLauncher
{
    private _app:KFApp;


    public config:IKFConfigs = null;
    public execSide:number = BlkExecSide.BOTH;

    public constructor(execSide:number = BlkExecSide.BOTH)
    {
        this.execSide = execSide;

        ///默认的配置文件管理器
        IKFConfigs_Type.meta = DefaultAppConfig.Meta;
        ///生成文件系统
        if(!HttpRequest_Type.meta)
            HttpRequest_Type.meta = WebHttpRequest.Meta;
        if(!IKFFileIO_Type.meta)
            IKFFileIO_Type.meta = KFHttpFileIO.Meta;
        IKFFileIO_Type.new_default();
        this.config = IKFConfigs_Type.new_default();
    }

    public setFPS(v:number)
    {
        KFGlobalDefines.SetFPS(v);
    }

    public stop_tick()
    {
        if(this._app){ this._app.gameTicker.Stop();}
    }

    public start_tick()
    {
        if(this._app){ this._app.gameTicker.Start();}
    }

    private app_start(editmode:boolean = false):void
    {
        if(this._app == null)
        {
            this._app = new KFApp();
            this._app.execSide = this.execSide;
            this._app.Create();
        }

        this._app.Play(
                this.config.basedir()
            ,   this.config.start()
            ,   editmode);

        this.start_tick();
    }

    public run(     appdatapath:string = ""
                , kfdpath:string = ""
                , start:string = "main"
                , editmode:boolean = false):void
    {
        this.config.load_config(
            appdatapath
            ,kfdpath
            ,start
            ,(ret:boolean)=>
            {
                if(ret)
                {
                    this.app_start(editmode);
                }
                else
                {
                    LOG_ERROR("加载失败...");
                }
            });
    }
}
