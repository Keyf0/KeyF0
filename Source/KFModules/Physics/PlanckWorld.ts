import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {PhyDef, Phy_Name, PhyObject, PhyObjectType, PhyScene, PhyDrawWorld} from "./PhysicsTypes";
import {newPV2, PlanckBody} from "./PlanckTypes";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {EventEndFrame, onEndFrame} from "../../ACTS/Context/IKFRuntime";
import {KFEvent} from "../../Core/Misc/KFEventTable";


///KFD(C,CLASS=PlanckWorld,EXTEND=KFBlockTarget)
///KFD(*)

const HitEvent:KFEvent = new KFEvent("onHitEvent");
HitEvent.stacks = [];

export class PlanckWorld extends KFBlockTarget implements PhyScene {

    public static Meta:IKFMeta = new IKFMeta("PlanckWorld"
        ,():KFBlockTarget=>{return new PlanckWorld();});

    public target:planck.World;
    public debugdraw: PhyDrawWorld;


    private _fixtpf:number;
    private _tickhander:any;
    private _simPyhbds:PlanckBody[];
    private _contactHD:(contact: planck.Contact) => void;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        //let Settings:{maxTranslation:number,maxTranslationSquared:number}
        //let internal = planck.internal;

        //internal.Settings.maxTranslation  = 10000;
        //internal.Settings.maxTranslationSquared = 10000 * 10000;

        this.target = new planck.World();

        this._contactHD = this.onContact.bind(this);
        this.target.on("begin-contact",this._contactHD);
        this.runtime.systems[Phy_Name.value] = this;

        this._fixtpf = this.runtime.fixtpf;
        this._tickhander = this.Tick.bind(this);
        this._simPyhbds = [];
        this.runtime.etable.AddEventListener(EventEndFrame,this._tickhander);
    }

    public DeactiveBLK(): void {
        this.runtime.etable.RemoveEventListener(EventEndFrame,this._tickhander);
        delete this.runtime.systems[Phy_Name.value];
        this.target = null;
    }

    public Tick(): void {
        this.target.step(this._fixtpf);
        for(let bd of this._simPyhbds) {
            let tffunc = bd.def.updateTF;
            if(tffunc) {tffunc(bd);}
        }

        if(this.debugdraw) {
            this.debugdraw();
        }
    }

    public onContact(contact: planck.Contact) {

        let abd:PlanckBody = <PlanckBody>contact.m_fixtureA.m_userData;
        let bbd:PlanckBody = <PlanckBody>contact.m_fixtureB.m_userData;

        let chg:boolean = false;
        if(abd && bbd){
            if(abd.def.group > bbd.def.group){
                let t = abd;abd =bbd;bbd=t;
            }
        }else
            return;

        //还有其他参数再说
        let etb = abd.target.etable;
        if(etb) {
            HitEvent.arg = bbd.target;
            abd.target.etable.FireEvent(HitEvent);
        }
    }

    public CreateObject(def: PhyDef, startpos:any): PhyObject {
        ///坐标需要转化吗？
        let bodydef:any = {angle:0
            , allowSleep:true
            , awake: false
            , active: true
            , fixedRotation:true
            , position:newPV2(startpos)};
        let body:planck.Body = null;
        if(def.phyType == undefined)
            def.phyType = PhyObjectType.pStatic;

        if(def.sim) {
            bodydef.awake = true;
        }

        switch (def.phyType) {

            case PhyObjectType.pBullet:
                bodydef.bullet = true;
                body = this.target.createDynamicBody(bodydef);
                break
            case PhyObjectType.pStatic:
                body = this.target.createBody(bodydef);
                break;
            case PhyObjectType.pDynamics:
                body = this.target.createDynamicBody(bodydef);
                break;
            case PhyObjectType.pCar:
                bodydef.fixedRotation = false;
                body = this.target.createDynamicBody(bodydef);
                break;
            default:
                body = this.target.createKinematicBody(bodydef);
                break;
        }

        let newbody = new PlanckBody(def, body);
        if(def.sim){
            this._simPyhbds.push(newbody);
        }
        return newbody;
    }
    public DeleteObject(obj: PhyObject) {

        if(obj.def.sim){
            let i:number = this._simPyhbds.indexOf(<any>obj);
            if(i != -1){
                this._simPyhbds.splice(i,1);
            }
        }

        this.target.destroyBody((<PlanckBody>obj).body);
    }
    public MoveObject(obj: PhyObject, v: { x: number; y: number; z?: number }): boolean {

        return false;
    }


}