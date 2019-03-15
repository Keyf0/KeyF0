


export class KFComponentBase {

    public ActivateComponent():void{}
    public DeactiveComponent():void{}
    public ResetComponent():void
    {}

    public EnterFrame():void
    {}

    PreEnterFrame():boolean {return true;}
    LateEnterFrame():void{}
}