import {IKFRuntime} from "../../Context/IKFRuntime";
import {KFBlockTarget} from "../../Context/KFBlockTarget";

export class KFComponentBase
{
    //兼容KFSCRIPTCONTEXT的类型用any
    public targetObject:KFBlockTarget;
    //兼容KFSCRIPTCONTEXT的类型用any
    public runtime: IKFRuntime;
    public comtype:number;

    public constructor(target:KFBlockTarget, type:number)
    {
        this.targetObject = target;
        this.comtype = type;
        this.runtime = target.runtime;
    }
    
    public ActivateComponent():void{}
    public DeactiveComponent():void{}
    public ReleaseComponent():void{}
    public ResetComponent():void {}
    public EnterFrame(frameindex:number):void {}
}