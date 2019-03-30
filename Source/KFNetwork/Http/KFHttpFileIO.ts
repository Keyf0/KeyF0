import {FileFilter, FileOperationEnd, IKFFileIO} from "../../Core/FileIO/IKFFileIO";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {URLLoader} from "./URLLoader";
import {URLLoaderDataFormat} from "./URLLoaderDataFormat";
import {URLRequest} from "./URLRequest";

export class KFHttpFileIO implements IKFFileIO
{
    public static Meata:IKFMeta = new IKFMeta
    (
        "KFHttpFileIO",():IKFFileIO=>{
            return new KFHttpFileIO();
        }
    );

    public constructor()
    {

    }

    public CreateDir(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public GetFilePaths(pathlist: Array<string>, path: string, recursive: boolean, pattern: string, async: FileOperationEnd)
    {

    }

    public IsDirExist(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public IsFileExist(path: string, async: FileOperationEnd): boolean
    {
        return false;
    }

    public IteratePaths(path: string, recursive: boolean, ffilter: FileFilter, async: FileOperationEnd)
    {

    }

    public LoadFile(path: string, bytesArr: KFByteArray, async: FileOperationEnd): boolean
    {
        let loader:URLLoader = new URLLoader();
        loader.dataFormat = URLLoaderDataFormat.BINARY;
        let request:URLRequest = new URLRequest(path);
        loader.COMPLETE_Event.on((currloader:URLLoader)=>{
            async(true, currloader.data);
        });

        loader.IO_ERROR_Event.on((currloader:URLLoader)=>{
            async(false,bytesArr);
        });

        loader.load(request);

        return false;
    }

    public SaveFile(path: string, bytesArr: KFByteArray, async: FileOperationEnd): boolean
    {
        return false;
    }

}