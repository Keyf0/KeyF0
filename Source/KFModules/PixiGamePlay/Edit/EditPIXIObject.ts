import {PIXIApplication} from "../PIXIApplication";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../../ACTS/Context/KFBlockTarget";
import {IKFRuntime} from "../../../ACTS/Context/IKFRuntime";
import {HElementActor} from "../../Web/HElementActor";


///KFD(C,CLASS=EditPIXIObject,EXTEND=PIXIApplication)
///KFD(*)

export class EditPIXIObject extends PIXIApplication
{
    public static Meta:IKFMeta = new IKFMeta("EditPIXIObject"
        ,():KFBlockTarget=>{
            return new EditPIXIObject();
        }
    );

    public editTarget:KFBlockTarget;
    public messagehandler:any;
    public _scale:number = 1.0;
    public _bgcolor:number = 0x000000;

    public Construct(metadata: any, runtime: IKFRuntime)
    {
        super.Construct(metadata, runtime);

        //this.transparent = true;
        this.width = 1024;
        this.height = 768;
        this.resolution = window.devicePixelRatio;
    }

    public OnScaleChange(scale:number):void
    {
        scale = scale < 0.1 ? 0.1 : scale;
        this._scale = scale;
        let canvas = <any>this.target;

        canvas.style.width = this.width * scale + "px";
        canvas.style.height = this.height * scale + "px";
    }


    public OnBGColorChange(color:number):void
    {
        this._bgcolor = color;
        this._target.renderer.backgroundColor = color;
    }

    public OnAlignChange(align:number):void
    {
        if(this.editTarget)
        {
            let loc = {x:0,y:0};
            if(align == 1){
                loc.x = this.width / 2;
                loc.y = this.height / 2;
            }
            this.editTarget.set_position(loc);

        }
    }

    public OnWindowMessage(event)
    {
        let arg = event.data;
        if(arg){
            let type:string = arg.type;
            let callback = this[type];
            if(callback){
                callback.call(this,arg.data);
            }
        }
    }

    public OnPreviewReady()
    {
        window.parent.postMessage({type:"OnPreviewReady"},"*");
    }


    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        // create preview child
        let startFiles:string[] = this.runtime.configs.startFiles();
        if(startFiles && startFiles.length > 0)
        {
            let targetData:any = {};
            targetData.asseturl = startFiles[0];
            this.editTarget = this.CreateChild(targetData);

            if(this.editTarget)
            {
                //this.editTarget.set_position({x:379.5500000000001,y:291.45});
            }
        }

        this.messagehandler = this.OnWindowMessage.bind(this);

        window.addEventListener("message", this.messagehandler, false);
    }

    public DeactiveBLK(): void
    {
        window.removeEventListener("message", this.messagehandler, false);
        this.messagehandler = null;
        super.DeactiveBLK();
    }
}