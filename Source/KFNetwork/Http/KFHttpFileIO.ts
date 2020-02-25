import {FileFilter, FileOperationEnd, IKFFileIO} from "../../Core/FileIO/IKFFileIO";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {URLLoader} from "./URLLoader";
import {URLLoaderDataFormat} from "./URLLoaderDataFormat";
import {URLRequest} from "./URLRequest";

export class KFHttpFileIO implements IKFFileIO
{
    public static Meta:IKFMeta = new IKFMeta
    (
        "KFHttpFileIO",():IKFFileIO=>{
            return new KFHttpFileIO();
        }
    );

    __loader:URLLoader = null;
    __loadindex = 0;

    public constructor()
    {

    }

    public asyncCreateDir(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public asyncGetFilePaths(pathlist: Array<string>, path: string, recursive: boolean, pattern: string, async: FileOperationEnd)
    {

    }

    public asyncIsDirExist(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public asyncIsFileExist(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public asyncIteratePaths(path: string, recursive: boolean, ffilter: FileFilter, async: FileOperationEnd)
    {

    }

    public asyncLoadFile(path: string, async: FileOperationEnd,dataft:string): boolean
    {
        if(!dataft || dataft == "")
        {
            dataft = URLLoaderDataFormat.BINARY;
        }

        let loader:URLLoader = new URLLoader();
        loader.dataFormat = dataft;
        let request:URLRequest = new URLRequest(path);
        loader.COMPLETE_Event.on((currloader:URLLoader)=>{
            async(true, currloader.data,path);
        });

        loader.IO_ERROR_Event.on((currloader:URLLoader)=>{
            async(false, null,path);
        });

        loader.load(request);

        return true;
    }

    public asyncLoadFileList(filearr: Array<string>
                        , onprogress: FileOperationEnd
                        , async: FileOperationEnd
                        , dataft:string)
    {

        if(this.__loader) return;

        if(!dataft || dataft == "")
        {
            dataft = URLLoaderDataFormat.BINARY;
        }

        let loader:URLLoader = new URLLoader();
        loader.dataFormat = dataft;
        
        this.__loader = loader;
        this.__loadindex = 0;

        let target = this;

        function NextLoad()
        {
            loader.__recycle();

            if(filearr.length > target.__loadindex)
            {
                let path = filearr[target.__loadindex]; 
                let request:URLRequest = new URLRequest(path);
                loader.load(request);
                target.__loadindex += 1;
            }
            else
            {
                ///清空
                target.__loader = null;
                async(true,null,"");
            }
        }

        loader.COMPLETE_Event.on((currloader:URLLoader)=>{
            onprogress(true
                ,   currloader.data
                ,   currloader.geturl());
                NextLoad();
        });

        loader.IO_ERROR_Event.on((currloader:URLLoader)=>{
            onprogress(false, null,currloader.geturl());
            NextLoad();
        });
        
        NextLoad();
    }

    public asyncSaveFile(path: string, bytesArr: KFByteArray, async: FileOperationEnd): boolean
    {
        return false;
    }

}