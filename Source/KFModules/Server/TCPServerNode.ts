import {KFActor} from "../../ACTS/Actor/KFActor";
import {BlkExecSide} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=TCPServerNode,EXTEND=KFActor)
///KFD(*)

export class TCPServerNode extends KFActor
{
    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
    }

    public DeactiveBLK(): void
    {
        super.DeactiveBLK();
    }
}