import {IKFRuntime} from "./IKFRuntime";

export class KFTimers
{
    private m_runtime:IKFRuntime;

    public enable:boolean;

    public constructor(runtime:IKFRuntime)
    {
        this.m_runtime = runtime;
    }

    public Tick():void
    {}

}