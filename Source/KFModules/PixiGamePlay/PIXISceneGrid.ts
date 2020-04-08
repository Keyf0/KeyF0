import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {PIXIObject} from "./PIXIInterface";
import {KFDName} from "../../KFData/Format/KFDName";
import {PIXICamera} from "./PIXICamera";


///KFD(C,CLASS=PIXISceneGrid,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=txurl,CNAME=贴图路径,TYPE=kfstr)
///KFD(*)

export class PIXISceneGrid extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("PIXISceneGrid"
        ,():KFBlockTarget=>{
            return new PIXISceneGrid();
        }
        , BlkExecSide.CLIENT
    );

    ///贴图的路径
    public txurl:string;

    public target:PIXI.Graphics;
    private _camera:PIXICamera;
    private _drawinfo:{x:number,y:number,w:number,h:number};
    private _texture:any;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        if(this.target != null) {
            LOG_ERROR("重复ActivateBLK");
            return;
        }

        let camera:PIXICamera = <PIXICamera>this.parent.FindChild(KFDName._Strs.GetNameID("camera"));
        if(camera == null){
            LOG_ERROR("找不到camera的实例");
            return;
        }

        this._camera = camera;
        let pos = camera.position;
        this._drawinfo = {x:pos.x - 1,y:0,w:camera.width,h:camera.height};


        let res = PIXI.Loader.shared.resources[this.txurl];
        if(res.texture == null){
            LOG_ERROR("找不到SpriteSheet资源:{0}", this.txurl);
            return;
        }

        this._texture = res.texture;
        this._texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

        this.target = new PIXI.Graphics();
        this.target.zIndex = -100000000;

        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();

        if (container) {
            container.addChild(this.target);
        } else {
            LOG_ERROR("{0}对象不能加入父级{1}"
                , this.name.toString()
                , pixiParent.name.toString());
        }

        this.tickable = true;
    }

    public DeactiveBLK(): void {

        super.DeactiveBLK();

        this.tickable = false;
        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container) {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }
    }

    public Tick(frameindex: number): void {

        let pos = this._camera.position;
        let di = this._drawinfo;
        if(di.x != pos.x || di.y != pos.y) {

            di.x = pos.x;
            di.y = pos.y;

            let gr = this.target;
            gr.clear();
            gr.beginTextureFill(this._texture);
            gr.drawRect(di.x - this._drawinfo.w * 0.5
                , di.y - this._drawinfo.h * 0.5,
                this._drawinfo.w,this._drawinfo.h);
            gr.endFill();
        }
    }
}