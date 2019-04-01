import {IKFConfigs, LoadSettingEnd} from "../ACTS/Context/IKFConfigs";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {IKFFileIO_Type} from "../Core/FileIO/IKFFileIO";
import {LOG, LOG_ERROR} from "../Core/Log/KFLog";
import {KFDTable} from "../KFData/Format/KFDTable";

export class DefaultAppConfig implements IKFConfigs
{
    public static Meta:IKFMeta = new IKFMeta("DefaultAppConfig"

        ,():IKFConfigs=>{
        return new DefaultAppConfig();
        }
    );

    private _basedir:string;
    public basedir(): string {return this._basedir;}

    public GetActorConfig(path: string, bFullpath: boolean): any
    {

    }

    public GetAnyConfig(path: string): any
    {

    }

    public GetGraphConfig(path: string, bFullpath: boolean): any
    {
    }

    public GetMetaData(asseturl: string, bFullpath: boolean): any
    {
    }

    public GetTimelineConfig(path: string, bFullpath: boolean): any
    {

    }

    public Init(basedir: string): void
    {
        this._basedir = basedir;
    }

    public SetGraphConfig(path: string, KFGraphConfig: any): void
    {
    }

    public SetTimelineConfig(path: string, KFTimelineConfig: any): void
    {

    }

    public load_setting(path:string
                        , end:LoadSettingEnd)
    {
        IKFFileIO_Type.instance.asyncLoadFile(
                path,
            (ret:any,data:any)=>{

                if(ret)
                {
                    JSZip.loadAsync(data).then((zipdata)=>{

                        if(data == null)
                        {
                            ///
                            LOG_ERROR("config zip decode error");
                            end(false);
                        }
                        else
                        {
                            let kfdtabel = KFDTable.kfdTB;
                            zipdata.forEach(
                                (relativePath,file)=>
                                {
                                    file.async("text").then(
                                        (data:string) =>
                                        {
                                            LOG("load kfd={0}",relativePath);
                                            kfdtabel.add_kfd(JSON.parse(data));
                                        }
                                    );
                                }
                            );

                            end(true);
                        }
                    });
                }
                else
                {
                    LOG_ERROR("config load error");
                    end(false);
                }
            }
        );
    }
}