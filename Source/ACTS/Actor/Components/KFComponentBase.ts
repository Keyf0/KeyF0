import {KFActorModel} from "../Model/KFActorModel";

export class KFComponentBase 
{
    public targetObject:any;
    public comtype:number;
    public runtime: any;
    public model:KFActorModel;

    public constructor(target:any, type:number)
    {
        this.targetObject = target;
        this.comtype = type;
        this.runtime = target.runtime;
        this.model = target.model;
    }
    
    public ActivateComponent():void{}
    public DeactiveComponent():void{}
    public ReleaseComponent():void{}
    public ResetComponent():void {}
    public EnterFrame():void {}
    public PreEnterFrame():boolean {return true;}
    public LateEnterFrame():void{}
}