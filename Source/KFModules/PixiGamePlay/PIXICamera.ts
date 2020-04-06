import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFDName, NVal} from "../../KFData/Format/KFDName";


///KFD(C,CLASS=PIXICamera,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=tickable,CNAME=开启更新,DEFAULT=true,OR=1,TYPE=bool)

///KFD(P=1,NAME=width,CNAME=视野长,DEFAULT=800,TYPE=num1)
///KFD(P=2,NAME=height,CNAME=视野宽,DEFAULT=800,TYPE=num1)
///KFD(*)

export class PIXICamera extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("PIXICamera"
        ,():KFBlockTarget=>{
            return new PIXICamera();
        }
        , BlkExecSide.CLIENT
    );

    public width:number = 800;
    public height:number = 800;

    ///跟随目标
    public follow:KFBlockTarget;
    private _sw:number;
    private _sh:number;
    private _ditance:number;

    public ActivateBLK(KFBlockTargetData: any): void {

        super.ActivateBLK(KFBlockTargetData);

        this.tickable = true;
        this.position = {x:0,y:0};
        this._sw = 800;
        this._sh = 600;
        this._ditance = 100;
    }

    public DeactiveBLK(): void {
        this.tickable  = false;
        super.DeactiveBLK();
    }

    public Tick(frameindex: number): void {
        let p:KFBlockTarget = <KFBlockTarget><any>this.parent;
        let cp = this.position;

        if(this.follow){
            let tpos = this.follow.position;
            cp.x = tpos.x;
            cp.y = tpos.y;
        }

        let v = {x:this._sw * 0.5 - cp.x,
                y:this._sh * 0.5 - cp.y};
        p.set_position(v);
    }

}