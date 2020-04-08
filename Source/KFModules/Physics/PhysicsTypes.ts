
///还是需要和blocktarget区别开,
///blocktarget是逻辑对象，有逻辑坐标，逻辑旋转等等
///display有表现对象，表示坐标，缩放等
///物理有物理对象，物理坐标等



import {KFDName} from "../../KFData/Format/KFDName";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

export interface CollisionEvent {
    (): any;
}

export interface PhyDrawWorld {
    (): any;
}

///KFD(C,CLASS=PhyShapeType,CNAME=图形类,NOF=1)
export class PhyShapeType {
    ///KFD(P=1,NAME=pCustom,CNAME=导入,TYPE=int32,DEFAULT=-1)
    public static pCustom:number = -1;
    ///KFD(P=1,NAME=sCircle,CNAME=圆形,TYPE=int32,DEFAULT=0)
    public static sCircle:number = 0;
    ///KFD(P=1,NAME=sBox,CNAME=距形,TYPE=int32,DEFAULT=1)
    public static sBox:number = 1;
    ///KFD(*)
}

///KFD(C,CLASS=PhyObjectType,CNAME=物理对象,NOF=1)
export class PhyObjectType {
    ///KFD(P=1,NAME=pStatic,CNAME=静态物体,TYPE=int32,DEFAULT=0)
    public static pStatic:number = 0;
    ///KFD(P=1,NAME=pDynamics,CNAME=动态物体,TYPE=int32,DEFAULT=1)
    public static pDynamics:number = 1;
    ///KFD(P=1,NAME=pKinematic,CNAME=运动学,TYPE=int32,DEFAULT=2)
    public static pKinematic:number = 2;
    ///KFD(P=1,NAME=pCar,CNAME=汽车,TYPE=int32,DEFAULT=3)
    public static pCar:number = 3;
    ///KFD(P=1,NAME=pCar,CNAME=子弹,TYPE=int32,DEFAULT=3)
    public static pBullet:number = 4;
    ///KFD(*)
}

///KFD(C,CLASS=PhyDef,CNAME=物理参数,NOF=1)
export class PhyDef {
    ///KFD(P=1,NAME=use,CNAME=开启,TYPE=bool,DEFAULT=false)
    public use:boolean;
    ///KFD(P=2,NAME=sim,CNAME=模拟,TYPE=bool,DEFAULT=false)
    public sim:boolean;
    ///KFD(P=3,NAME=group,CNAME=分组,TYPE=int32,DEFAULT=0)
    public group:number;
    ///KFD(P=4,NAME=shapeType,CNAME=图形,TYPE=int32,DEFAULT=0,ENUM=PhyShapeType)
    public shapeType:number;
    /// box w,h,center circle radius center
    ///KFD(P=5,NAME=shapeDatas,CNAME=图形数据,TYPE=arr,OTYPE=num1)
    public shapeDatas:number[];
    ///KFD(P=6,NAME=phyType,CNAME=对象,TYPE=int32,DEFAULT=0,ENUM=PhyObjectType)
    public phyType:number;
    ///KFD(*)
    public updateTF:(phy:any)=>void;
}

///物理对象
export interface PhyObject {
    //对象的定义
    def:PhyDef;
    tf:any;
    target:KFBlockTarget;
    get_position():{x:number,y:number,z?:number}
    set_position(v3: { x: number; y: number; z?: number });
    simulate(v2:{x:number,y:number});
};

export const Phy_Name:KFDName = new KFDName("Physics");

///物理场景
export interface PhyScene {

    ///native engine
    target:any;
    debugdraw:PhyDrawWorld;

    CreateObject(def:PhyDef, startpos:any):PhyObject;
    DeleteObject(obj:PhyObject);
    //移动物体v是速度
    MoveObject(obj:PhyObject, v:{x:number,y:number,z?:number}):boolean;
};