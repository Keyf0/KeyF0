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
    LoadFile(path:string, bytesArr:KFByteArray , async:FileOperationEnd):boolean;
    SaveFile(path:string, bytesArr:KFByteArray , async:FileOperationEnd):boolean;
    CreateDir(path:string, async:FileOperationEnd):boolean;
    IsDirExist(path:string, async:FileOperationEnd):boolean;
    IsFileExist(path:string, async:FileOperationEnd):boolean;

    GetFilePaths(pathlist:Array<string>
                 , path:string
                 , recursive:boolean
                 , pattern:string
                 , async:FileOperationEnd);
    IteratePaths(path:string
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