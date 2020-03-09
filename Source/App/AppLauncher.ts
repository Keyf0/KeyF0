import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {KFHttpFileIO} from "../KFNetwork/Http/KFHttpFileIO";
import {HttpRequest_Type} from "../KFNetwork/Http/Request/HttpRequest";
import {WebHttpRequest} from "../KFNetwork/Http/Request/web/WebHttpRequest";
import {KFByteArray} from "../KFData/Utils/FKByteArray";
import {KFDJson} from "../KFData/Format/KFDJson";
import {IKFConfigs, IKFConfigs_Type} from "../ACTS/Context/IKFConfigs";
import {DefaultAppConfig} from "./DefaultAppConfig";
import {KFApp} from "../iSay/KFApp";

export class AppLauncher
{
    private _app:KFApp;
    private _tickid:number = -1;

    public config:IKFConfigs = null;

    public constructor()
    {
        ///默认的配置文件管理器
        IKFConfigs_Type.meta = DefaultAppConfig.Meta;
        ///生成文件系统
        HttpRequest_Type.meta = WebHttpRequest.Meta;
        IKFFileIO_Type.meta = KFHttpFileIO.Meta;
        IKFFileIO_Type.new_default();
        this.config = IKFConfigs_Type.new_default();
    }

    public stop_tick()
    {
        if(this._tickid != -1) {
            clearInterval(this._tickid);
            this._tickid = -1;
        }
    }

    public start_tick()
    {
        if(this._tickid == -1)
        {
            let app = this._app;

            this._tickid = setInterval(function () {
                app.Tick(16);
            }, 16);
        }
    }


    private app_start():void
    {
        if(this._app == null)
        {
            this._app = new KFApp();
            this._app.Create();
        }

        this._app.Play(this.config.basedir()
            ,this.config.start());

        this.start_tick();
    }

    public run(  appdatapath:string = ""
               , kfdpath:string = ""
              , start:string = "main"):void
    {
        this.config.load_config(
            appdatapath
            ,kfdpath
            ,start
            ,(ret:boolean)=>{

            if(ret)
            {
                this.app_start();
            }
            else
            {
                LOG_ERROR("加载失败...");
            }

            });
    }
}
