
// @ts-ignore
import * as fs from "fs";
import {FileFilter, FileOperationEnd, IKFFileIO, IKFFileIO_Type} from "../../Core/FileIO/IKFFileIO";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {URLLoaderDataFormat} from "../../KFNetwork/Http/URLLoaderDataFormat";
import {KFByteArray} from "../../KFData/Utils/FKByteArray";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";

export class NDFileIO implements IKFFileIO
{
    public static Meta:IKFMeta = new IKFMeta
    (
        "NDFileIO",():IKFFileIO=>{
            return new NDFileIO();
        }
    );

    __loadindex = 0;

    public constructor() {}

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
    {}

    public asyncLoadFile(path: string
        , async: FileOperationEnd
        , params:any): boolean
    {
        let dataft = params;
        let basedir = "";
        if(params && typeof (params) != 'string')
        {
            dataft = params.dataFormat;
            if(params.basedir)
            {
                basedir = params.basedir;
            }
        }

        if(!dataft || dataft == "") {dataft = URLLoaderDataFormat.BINARY;}
        let isbuff = dataft == URLLoaderDataFormat.BINARY;

        fs.readFile(basedir + path, {encoding: isbuff ? null:"utf-8"}
        ,(err, data) => {
            if (err){
                async(false, null, path);
            }
            else {
                async(true, isbuff ? data.buffer : data, path);
            }
        });
        return true;
    }

    public asyncLoadFileList(filearr: Array<string>
        , onprogress: FileOperationEnd
        , async: FileOperationEnd
        , params:any)
    {

        let dataft = params;
        let basedir = "";

        if(params && typeof(params) != 'string')
        {
            dataft = params.dataFormat;
            if(params.basedir)
            {
                basedir = params.basedir;
            }
        }

        if(!dataft || dataft == "") {dataft = URLLoaderDataFormat.BINARY;}

        let isbuff = dataft == URLLoaderDataFormat.BINARY;
        let option = {encoding:isbuff ? null:"utf-8"};


        this.__loadindex = 0;

        let target = this;
        let currloadpath = "";

        let Complete = function (data, filepath) {

            onprogress(true
                ,   data
                ,   filepath);
            NextLoad();
        }

        let ErrorLoad = function (filepath) {
            onprogress(false, null,filepath);
            NextLoad();
        };


        function NextLoad()
        {
            if(filearr.length > target.__loadindex)
            {
                currloadpath = filearr[target.__loadindex];

                fs.readFile(basedir + currloadpath, option
                    ,(err, data) => {
                        if (err){
                            LOG_ERROR(err);
                            ErrorLoad(currloadpath);
                        }
                        else {
                            Complete(isbuff ?data.buffer : data, currloadpath);
                        }
                    });

                target.__loadindex += 1;
            }
            else
            {
                ///清空
                async(true,null,"");
            }
        }

        NextLoad();
    }

    public asyncSaveFile(path: string, bytesArr: KFByteArray, async: FileOperationEnd): boolean
    {
        return false;
    }
}

export function SetDefaultIO() {
    IKFFileIO_Type.meta = NDFileIO.Meta;
}