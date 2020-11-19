import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {IKFConfigs_Type} from "../../ACTS/Context/IKFConfigs";
import {KFEventDispatcher} from "../../ACTS/Event/KFEventDispatcher";


///KFD(C,CLASS=PIXIAssetLoader,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=AssetURLs,CNAME=资源路径,TYPE=arr,OTYPE=kfstr)
///KFD(*)

export class PIXIAssetLoader extends KFBlockTarget {

    public static Meta:IKFMeta = new IKFMeta("PIXIAssetLoader"
        ,():KFBlockTarget=>{
            return new PIXIAssetLoader();
        }
        , BlkExecSide.CLIENT
    );

    public AssetURLs:string[];

    public  Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.etable = new KFEventDispatcher(runtime.domain);
    }

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        let loader = PIXI.Loader.shared;
        let basedir = IKFConfigs_Type.instance.basedir();
        loader.baseUrl = basedir;

        for(let asseturl of this.AssetURLs){
            loader.add(asseturl);
        }
        /// ADD CACHE
        loader.load(this.OnResLoaded.bind(this));
    }

    public DeactiveBLK(): void {
        if(this.etable){
            this.etable.Clear();
        }
        super.DeactiveBLK();
    }

    private OnResLoaded(loader, resources) {
        let event:KFEvent = new KFEvent("onLoadComplete");
        this.etable.FireEvent(event);
    }
}