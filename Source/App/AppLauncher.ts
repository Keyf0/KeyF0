import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {KFHttpFileIO} from "../KFNetwork/Http/KFHttpFileIO";
import {HttpRequest_Type} from "../KFNetwork/Http/Request/HttpRequest";
import {WebHttpRequest} from "../KFNetwork/Http/Request/web/WebHttpRequest";
import {KFByteArray} from "../KFData/Utils/FKByteArray";
import {KFDJson} from "../KFData/Format/KFDJson";
import {IKFConfigs_Type} from "../ACTS/Context/IKFConfigs";
import {DefaultAppConfig} from "./DefaultAppConfig";

export class AppLauncher
{
    public constructor()
    {
        ///默认的配置文件管理器
        IKFConfigs_Type.meta = DefaultAppConfig.Meta;
        ///生成文件系统
        HttpRequest_Type.meta = WebHttpRequest.Meta;
        IKFFileIO_Type.meta = KFHttpFileIO.Meta;
        IKFFileIO_Type.new_default();
    }

    private app_start():void
    {
        IKFFileIO_Type.instance.asyncLoadFile("appdata/main.blk",
            (ret:any,data:any)=>{

                if(ret)
                {
                    LOG("==>load success {0}");
                    let bytearr:KFByteArray = new KFByteArray(data);
                    let metaobj = KFDJson.read_value(bytearr);

                    LOG("==>read meta t {0}",metaobj);

                }
                else
                {
                    LOG_ERROR("==>load error");
                }

            },"");
    }

    public run():void
    {
        let appconfig = IKFConfigs_Type.new_default();
        appconfig.load_setting("appdata/kfds.zip"
            ,(ret:boolean)=>{

            if(ret)
            {
                this.app_start();
            }

            });
    }
}
