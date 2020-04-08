import {PhyDef, PhyObject, PhyObjectType, PhyShapeType} from "./PhysicsTypes";
import {kfVector3} from "../../ACTS/Script/Global/GlobalScripts";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

export const P_SCALE:number = 10;
export const P_1_SCALE:number = 0.1;

export function newPV2(kfv2:any):planck.Vec2{
    let v2 = new planck.Vec2(kfv2.x,kfv2.y);
    v2.mul(P_1_SCALE);
    return v2;
}

const _v3:kfVector3 = new kfVector3();

export class PlanckBody implements PhyObject {

   public def: PhyDef;
   public body:planck.Body;
   public tf: any;
   public target:KFBlockTarget;

   public constructor(indef:PhyDef, inbody:planck.Body){
       this.def = indef;
       this.body = inbody;
       this.tf = inbody.getPosition();
       let sDatas:number[] = indef.shapeDatas;
       let stype = indef.shapeType;
       let arglen = sDatas.length;
       let pos = null;

       if(stype == undefined) stype = PhyShapeType.sCircle;

       ///还有几个物理属性后面研究了再设置
       let ftdef:any = {userData:this};

       if(indef.group == undefined)
           indef.group = 0;
       ftdef.filterGroupIndex = indef.group;

       if( indef.phyType == PhyObjectType.pBullet ||
           indef.phyType == PhyObjectType.pCar) {
           ftdef.friction = 0.1;
           ftdef.restitution = 0.99;
           //ftdef.density = 0;
       }
       else if(indef.sim) {
           ftdef.friction = 0.1;
           ftdef.restitution = 0.9;
           ftdef.density = 0.5;
       }

       switch (stype) {

           case PhyShapeType.sCircle:

               let radius = sDatas[0] * P_1_SCALE;
               if(arglen == 1){
                   pos = {x:0, y:0};
               }else{
                   pos = {x:sDatas[1] * P_1_SCALE,y: sDatas[2] * P_1_SCALE};
               }

               inbody.createFixture(new planck.Circle(pos,radius), ftdef);
                break;

           case PhyShapeType.sBox:
               if(arglen == 2){
                   pos = {x:sDatas[0] / -2 * P_1_SCALE , y:sDatas[1] / -2 * P_1_SCALE};
               }else
                   pos = {x:sDatas[2] * P_1_SCALE, y:sDatas[3] * P_1_SCALE};

               inbody.createFixture(new planck.Box(sDatas[0] * P_1_SCALE
                   ,sDatas[1] * P_1_SCALE,pos), ftdef);
               break;
       }
   }

    public set_position(v3: { x: number; y: number; z?: number }) {
       _v3.setValue2(v3);
       _v3.mul2(P_1_SCALE);
       this.body.setTransform(<any>_v3, this.body.m_sweep.a);
    }

    public simulate(v2: { x: number; y: number }) {
       _v3.setValue2(v2);
       _v3.mul2(P_1_SCALE);
       this.body.setLinearVelocity(<any>_v3);
    }

    public get_position(): { x: number; y: number; z?: number } {
       _v3.setValue2(this.tf);
       _v3.mul(P_SCALE);
        return _v3;
    }
}