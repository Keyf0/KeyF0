import {IKFConfigs, IKFConfigs_Type, LoadConfigEnd} from "../ACTS/Context/IKFConfigs";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {KFDTable} from "../KFData/Format/KFDTable";
import {KFByteArray} from "../KFData/Utils/FKByteArray";
import {KFDJson} from "../KFData/Format/KFDJson";

export class DefaultAppConfig implements IKFConfigs
{
    public static Meta:IKFMeta = new IKFMeta("DefaultAppConfig"

        ,():IKFConfigs=>{
        return new DefaultAppConfig();
        }
    );

    private _appdatapath:string;
    private _kfdpath:string;
    private _start:string;
    private _kfdpaths:Array<string>;
    private _refs:any;
    private _metadata:{[key: string]:any;} = {};
    private _timelinedata:{[key: string]:any;} = {};
    private _graphdata:{[key: string]:any;} = {};

    public static END_BLK:string = ".blk";
    public static ADD_TIMELINE:string = "/timeline.data";
    public static ADD_GRAPH:string = "/graph.data";

    public constructor(){


    }

    public basedir(): string {return this._appdatapath;}

    public GetActorConfig(path: string, bFullpath: boolean): any {return {};}
    public GetAnyConfig(path: string): any {return {};}


    public GetMetaData(asseturl: string, bFullpath: boolean): any
    {
        return this._metadata[asseturl];
    }

    public GetTimelineConfig(path: string, bFullpath: boolean): any
    {
        return this._timelinedata[path];
    }

    public GetGraphConfig(path: string, bFullpath: boolean): any
    {
        return this._graphdata[path];
    }

    public SetGraphConfig(path: string, KFGraphConfig: any): void {}
    public SetTimelineConfig(path: string, KFTimelineConfig: any): void {}

    private load_setting(end:LoadConfigEnd)
    {
        let self = this;
        let settingfiles = [];

        settingfiles.push(this._appdatapath + "/_kfdpaths_.data");
        settingfiles.push(this._appdatapath + "/_refs_.data");

        IKFFileIO_Type.instance.asyncLoadFileList(settingfiles,
            function(ret:any,data:any,path:string)
            {
                if(ret)
                {
                    let datastr = (new KFByteArray(data)).readstring();
                    let jsondata = JSON.parse(datastr);
                    if(path.indexOf("_refs_") != -1)
                    {
                        self._refs = jsondata;
                    }
                    else
                        self._kfdpaths = jsondata;

                }
            }
        ,function (ret:any,data:any,path:string)
            {
                self.load_kfds(end);
            },"");
    }

    private load_kfds(end:LoadConfigEnd)
    {
        let self = this;
        let kfdpaths = this._kfdpaths;

        IKFFileIO_Type.instance.asyncLoadFileList(kfdpaths,
            function (ret:any,data:any,path:string)
            {
                if(ret)
                {
                    KFDTable.kfdTB.add_kfd(JSON.parse(data));
                    LOG("KFD({0} 加载成功)",path);
                }

        },function (ret) {
            self.load_start(end);
        },{
                basedir:this._kfdpath + "/"
                    ,dataFormat:"text"});
    }

    private build_assetpath(asseturl,blkmap,filelist)
    {
        ///不重复加入
        if(!blkmap[asseturl])
        {
            blkmap[asseturl] = true;
            let refmap = this._refs[asseturl];
            if(refmap)
            {
                for (let refasseturl in refmap)
                {
                    if(refasseturl.indexOf(".blk") == -1) continue;
                    this.build_assetpath(refasseturl, blkmap, filelist);
                }

                filelist.push(asseturl);

                if(refmap.__timeline__ == true)
                {
                    filelist.push(asseturl.replace(DefaultAppConfig.END_BLK,
                        DefaultAppConfig.ADD_TIMELINE));
                }

                if(refmap.__graph__ == true)
                {
                    filelist.push(asseturl.replace(DefaultAppConfig.END_BLK
                        ,DefaultAppConfig.ADD_GRAPH));
                }
            }
        }
    }

    private load_start(end:LoadConfigEnd)
    {
        let self = this;
        let filelist = [];
        let blkmap = {};

        this.build_assetpath(this._start, blkmap,filelist);

        IKFFileIO_Type.instance.asyncLoadFileList(filelist,
            function (ret, data, path:string)
            {
                if(ret)
                {
                    LOG("{0} 加载成功",path);

                    let kfbytes:KFByteArray = new KFByteArray(data);

                    if(path.indexOf(DefaultAppConfig.ADD_TIMELINE) != -1)
                    {
                        self._timelinedata[path.replace(DefaultAppConfig.ADD_TIMELINE
                        ,DefaultAppConfig.END_BLK)] = KFDJson.read_value(kfbytes);
                    }
                    else if(path.indexOf(DefaultAppConfig.ADD_GRAPH) != -1)
                    {
                        self._graphdata[path.replace(DefaultAppConfig.ADD_GRAPH
                            ,DefaultAppConfig.END_BLK)] = KFDJson.read_value(kfbytes);
                    }else
                        {
                            let metadata = KFDJson.read_value(kfbytes);
                            metadata.asseturl = path;
                            self._metadata[path] = metadata;
                        }
                }

            },
            function (ret)
            {
                if(end)
                    end(ret);
            }
        ,{basedir:this._appdatapath + "/"});
    }

    public load_config(appdatapath:string
                       , kfdpath:string
                       , start:string
                       ,    end:LoadConfigEnd)
    {
        this._appdatapath = appdatapath;
        this._kfdpath = kfdpath;

        //加上后缀
        if(start.indexOf(".blk") == -1)
        {
            start += ".blk";
        }
        this._start = start;
        this.load_setting(end);
    }

    public start(): string {return this._start;}
}