import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {PIXIObject} from "./PIXIInterface";


///KFD(C,CLASS=PIXIAnimatedSprite,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=ssurl,CNAME=资源路径,TYPE=kfstr)
///KFD(P=2,NAME=animSpeed,CNAME=播放速度,DEFAULT=1,TYPE=num1)
///KFD(*)

export class PIXIAnimatedSprite extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("PIXIAnimatedSprite"
        ,():KFBlockTarget=>{
            return new PIXIAnimatedSprite();
        }
        , BlkExecSide.CLIENT
    );

    public ssurl:string;
    public animSpeed:number = 1.0;
    public target:PIXI.AnimatedSprite;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        if(this.target != null) {
            LOG_ERROR("重复ActivateBLK");
            return;
        }

        let res = PIXI.Loader.shared.resources[this.ssurl];
        if(res == null){
            LOG_ERROR("找不到SpriteSheet资源:{0}", this.ssurl);
            return;
        }

        let sheet = res.spritesheet;

        this.target = new PIXI.AnimatedSprite(sheet.animations["Main"]);
        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();

        if (container) {
            container.addChild(this.target);
            this.target.animationSpeed = this.animSpeed;
            this.target.play();
        } else {
            LOG_ERROR("{0}对象不能加入父级{1}"
                , this.name.toString()
                , pixiParent.name.toString());
        }
    }

    public DeactiveBLK(): void {

        super.DeactiveBLK();

        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container) {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }
    }

    public set_position(v3?: { x: number; y: number; z?: number }): void {
        if(!v3)v3 = this.position;
        if(this.target){
            this.target.setTransform(v3.x,v3.y);
        }
    }

    public set_rotation(v3?: { x?: number; y?: number; z: number }): void {
        if(!v3)v3 = this.rotation;
        if(this.target){
            this.target.rotation = v3.z;
        }
    }
}