import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {DefaultType, IKFMeta} from "../Meta/KFMetaManager";

export interface FileFilter
{
    (path:string, isDir:boolean);
}

export interface FileOperationEnd
{
    (ret:any,data:any);
}

export interface IKFFileIO
{
    asyncLoadFile(path:string, async:FileOperationEnd):boolean;
    asyncLoadFileList(filearr:Array<string>
                 , onprogress:FileOperationEnd
                 , async:FileOperationEnd);
    asyncSaveFile(path:string, bytesArr:KFByteArray, async:FileOperationEnd):boolean;
    asyncCreateDir(path:string, async:FileOperationEnd):boolean;
    asyncIsDirExist(path:string, async:FileOperationEnd):boolean;
    asyncIsFileExist(path:string, async:FileOperationEnd):boolean;

    asyncGetFilePaths(pathlist:Array<string>
                 , path:string
                 , recursive:boolean
                 , pattern:string
                 , async:FileOperationEnd);
    asyncIteratePaths(path:string
        , recursive:boolean
        , ffilter:FileFilter
        , async:FileOperationEnd);

    /*
      Path ： 可以是Directory|File

    virtual bool MovePath(const kfstr& path, const kfstr& destPath, bool overwrite = true, FileProgress fpCallback = nullptr) = 0;
    virtual bool CopyPath(const kfstr& path, const kfstr& destPath, bool overwrite = true, FileProgress fpCallback = nullptr) = 0;
    virtual bool DeletePath(const kfstr& path) { return false; }
    */
}

export let IKFFileIO_Type:DefaultType<IKFFileIO> = new DefaultType<IKFFileIO>();