import {IKFRuntime} from "../Context/IKFRuntime";
import {IKFTimelineContext} from "./IKFTimelineProc";
import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";

class KFTimeBlockTweenScope {
    begin:any;
    end:any;
}

export class KFTimeBlock
{
    private m_runtime:IKFRuntime;
    private m_data:any;
    private m_ctx:IKFTimelineContext;
    private m_container:IKFBlockTargetContainer;
    private m_keyframes:{[key:number]:any} = {};
    private m_scope:KFTimeBlockTweenScope;
    private m_target:KFBlockTarget;

    public data:any;
    public keep:boolean;

    public Create(runtime:IKFRuntime
                  , container:IKFBlockTargetContainer
                  , ctx:IKFTimelineContext
                  , data:any)
    {

    }

    public Release()
    {

    }

    public SetData(data:any)
    {

    }

    public Tick(frameindex:number, bJumpFrame:boolean)
    {

    }

    private TickInternal(frameIndex:number, bJumpFrame:boolean)
    {

    }

    private Activate()
    {

    }

    private Deactive(force:boolean = false)
    {

    }

    private TickOperator( frameIndex:number)
    {

    }

    private GetKeyFrame( id:number):any
    {

    }

    private GetNextKeyFrame( id:number):any
    {

    }
}