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

    public asyncLoadFile(path: string, async: FileOperationEnd): boolean
    {
        let loader:URLLoader = new URLLoader();
        loader.dataFormat = URLLoaderDataFormat.BINARY;
        let request:URLRequest = new URLRequest(path);
        loader.COMPLETE_Event.on((currloader:URLLoader)=>{
            async(true, currloader.data);
        });

        loader.IO_ERROR_Event.on((currloader:URLLoader)=>{
            async(false, null);
        });

        loader.load(request);

        return false;
    }

    public asyncLoadFileList(filearr: Array<string>
                        , onprogress: FileOperationEnd
                        , async: FileOperationEnd)
    {

    }

    public asyncSaveFile(path: string, bytesArr: KFByteArray, async: FileOperationEnd): boolean
    {
        return false;
    }


}