import {PIXIGraphics} from "./PIXIGraphics";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {Phy_Name} from "../Physics/PhysicsTypes";
import {PlanckWorld} from "../Physics/PlanckWorld";
import {LOG} from "../../Core/Log/KFLog";
import {kfVector3} from "../../ACTS/Script/Global/GlobalScripts";
import {P_SCALE} from "../Physics/PlanckTypes";

///KFD(C,CLASS=PlanckDebugGraphics,EXTEND=PIXIGraphics)
///KFD(P=1,NAME=closed,CNAME=关闭,TYPE=bool,DEFAULT=false)
///KFD(*)

export class PlanckDebugGraphics extends PIXIGraphics {

    public static Meta:IKFMeta = new IKFMeta("PlanckDebugGraphics"
        ,():KFBlockTarget=>{
            return new PlanckDebugGraphics();
        }
        , BlkExecSide.CLIENT
    );
    public closed:boolean;
    private _world:planck.World;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);
        let phy:PlanckWorld = this.runtime.systems[Phy_Name.value];
        if(phy){
            this._world = phy.target;
            phy.debugdraw = this.DebugDrawWorld.bind(this);
        }
        this.target.zIndex = 100000000;
    }

    private _v3:kfVector3 = new kfVector3();
    private drawcircle(body:planck.Body
                       ,shape:planck.CircleShape){

        let gr:PIXI.Graphics = this.target;
        let pos = this._v3;

        pos.setValue2(body.m_xf.p);
        pos.mul2(P_SCALE);

        gr.beginFill(0x008800,0.2);
        gr.drawCircle(pos.x + shape.m_p.x * P_SCALE,pos.y + shape.m_p.y * P_SCALE, shape.m_radius * P_SCALE);
        gr.endFill();
    }

    //绘画功能
    private DebugDrawWorld() {
        if(this.closed) return;
        this.target.clear();
        let world:planck.World = this._world;
        for (let j = world.m_jointList; j; j = j.m_next) {
            // 绘制关节
            // drawJoint(j, context);
        }
        for (let b = world.m_bodyList; b; b = b.m_next) {
            for (let s = b.m_fixtureList; s != null; s = s.m_next) {
                // 绘制刚体形状
                let shape:planck.Shape = s.m_shape;
                let stype = shape.m_type;
                switch (stype) {
                    case 'circle':
                        this.drawcircle(b,<planck.CircleShape>shape);
                        break;
                }
            }
        }
    }

    public DeactiveBLK(): void
    {
        let phy:PlanckWorld = this.runtime.systems[Phy_Name.value];
        if(phy){ phy.debugdraw = null;
        }
        super.DeactiveBLK();
    }

}