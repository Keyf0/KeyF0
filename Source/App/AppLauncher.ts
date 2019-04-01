import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {KFHttpFileIO} from "../KFNetwork/Http/KFHttpFileIO";
import {HttpRequest, HttpRequest_Type} from "../KFNetwork/Http/Request/HttpRequest";
import {WebHttpRequest} from "../KFNetwork/Http/Request/web/WebHttpRequest";
import {KFByteArray} from "../KFData/Utils/FKByteArray";
import {KFDJson} from "../KFData/Format/KFDJson";

export class AppLauncher
{
    public constructor()
    {
        ///生成文件系统
        HttpRequest_Type.meta = WebHttpRequest.Meta;
        IKFFileIO_Type.meta = KFHttpFileIO.Meata;
        IKFFileIO_Type.new_default();
    }

    private load_config():void
    {
        IKFFileIO_Type.instance.asyncLoadFile(
            "appdata/kfds.zip",
            (ret:any,data:any)=>{

                if(ret)
                {
                    JSZip.loadAsync(data).then((zipdata)=>{

                        if(data == null){
                            ///
                            LOG_ERROR("config zip decode error");
                        }else
                        {
                            LOG(zipdata.toString());
                        }
                    });
                }
                else
                {
                    LOG_ERROR("config load error");
                }
            }
        );
    }

    private app_start():void
    {
        IKFFileIO_Type.instance.asyncLoadFile("appdata/main.blk",
            (ret:any,data:any)=>{

                if(ret)
                {
                    LOG("==>load success {0}");

                }
                else
                {
                    LOG_ERROR("==>load error");
                }

            } );
    }

    public run():void
    {
        this.load_config();
    }
}
