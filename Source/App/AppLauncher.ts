import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {KFHttpFileIO} from "../KFNetwork/Http/KFHttpFileIO";
import {HttpRequest, HttpRequest_Type} from "../KFNetwork/Http/Request/HttpRequest";
import {WebHttpRequest} from "../KFNetwork/Http/Request/web/WebHttpRequest";
import {KFByteArray} from "../KFData/Utils/FKByteArray";

export class AppLauncher
{
    public constructor()
    {
        ///生成文件系统
        HttpRequest_Type.meta = WebHttpRequest.Meta;
        IKFFileIO_Type.meta = KFHttpFileIO.Meata;

        IKFFileIO_Type.new_default();
    }

    public run():void
    {
        IKFFileIO_Type.instance.LoadFile("xx.txt",null,
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
}
