
export class KFComponentBase 
{
    target:any;
    public constructor(target:any, type:number)
    {
        this.target = target;
    }

    public ActivateComponent():void{}
    public DeactiveComponent():void{}
    public ResetComponent():void
    {}

    public EnterFrame():void
    {}

    PreEnterFrame():boolean {return true;}
    LateEnterFrame():void{}
}