import {IKFRuntime} from "../Context/IKFRuntime";
import {IKFTimelineContext} from "./IKFTimelineProc";
import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../Data/KFBlockTargetOption";
import {KFTimeBlockOpOption} from "../Data/KFTimeBlockOpOption";

class KFTimeBlockTweenScope
{
    begin:any;
    end:any;
}

export class KFTimeBlock
{
    private m_runtime:IKFRuntime;
    private m_ctx:IKFTimelineContext;
    private m_container:IKFBlockTargetContainer;
    private m_keyframes:{[key:number]:any} = {};

    public m_target:KFBlockTarget;
    public data:any;
    public keep:boolean;
    public option:number = KFBlockTargetOption.Ignore;

    public Create(runtime:IKFRuntime
                  , container:IKFBlockTargetContainer
                  , ctx:IKFTimelineContext
                  , data:any)
    {
        this.m_container = container;
        this.m_runtime = runtime;
        this.m_ctx = ctx;
        this.SetData(data);
    }

    public Release()
    {
        this.Deactive(true);
        this.m_container = null;
        this.m_runtime = null;
        this.m_ctx = null;
        this.data = null;
        this.m_keyframes = {};
    }

    public SetData(data:any)
    {
        this.data = data;
        this.m_keyframes = {};

        let keyframes = data.keyframes;
        let blocklength = data.end - data.begin;

        ///暂时保持和C++版本一致后面需要同时优化下
        ///H5编辑器保证关键帧的顺序
        // if(!keyframes["__order__"])
        // {
        //    keyframes.sort((a,b)=> {return a.id - b.id});
        //    keyframes["__order__"] = true;
        // }

        let preframe = null;
        if(keyframes) {
            let begini = data.begin;

            for (let keyframe of keyframes) {
                this.m_keyframes[keyframe.id] = keyframe;
                if (keyframe != null) {
                    if (preframe != null)
                        preframe["__next__"] = keyframe;
                    preframe = keyframe;
                }
            }
        }

        if(preframe != null)
        {
            preframe["__next__"] = null;
        }

        this.option = this.data.target.option;
    }

    public Tick(frameIndex:number, bJumpFrame:boolean)
    {
        let endi = this.data.end;
        if(     frameIndex >= this.data.begin
            &&  frameIndex <= endi)
        {
            frameIndex -= this.data.begin;

            if (    frameIndex == 0
                &&  this.m_target == null)
            {
                this.Activate();
            }

            this.TickInternal(frameIndex, bJumpFrame);
        }
        else if(frameIndex == endi + 1)
        {
            if(!this.keep)
            {
                this.Deactive();
            }
        }
    }

    private TickInternal(frameIndex:number, bJumpFrame:boolean)
    {
        let keyframe = this.m_keyframes[frameIndex];
        if (keyframe)
        {
            this.m_ctx.OnKeyFrame(this.m_target, keyframe);

            if (this.option == KFBlockTargetOption.Create)
            {
                this.m_target.Tick(frameIndex);
            }
        }
        else if (bJumpFrame)
        {
            let prevFrameIndex = frameIndex - 1;
            while (prevFrameIndex >= 0)
            {
                keyframe = this.m_keyframes[prevFrameIndex];
                if (keyframe)
                {
                    if (this.option == KFBlockTargetOption.Create)
                    {
                        this.m_target.Tick(frameIndex);
                    }
                    break;
                }
                --prevFrameIndex;
            }
        }
        else
        {
            if (this.option == KFBlockTargetOption.Create)
            {
                this.m_target.Tick(frameIndex);
            }
        }
    }

    private Activate()
    {
        let targetdata = this.data.target;

        if (this.option == KFBlockTargetOption.Create)
        {
            this.m_target = this.m_runtime.domain
                .CreateBlockTarget(targetdata);

            if (this.m_target != null)
            {
                this.m_container.AddChild(this.m_target);
                this.m_target.ActivateBLK(targetdata);
            }
            else
            {
                //LOG_ERROR("Cannot Create BlockTarget: %s", m_data->target.asseturl.c_str());
            }
        }
        else if (this.option == KFBlockTargetOption.Attach)
        {
            this.m_target = this.m_container
                .FindChild(targetdata.instname);
        }
    }

    private Deactive(force:boolean = false)
    {
        if (this.m_target != null)
        {
            //LOG_WARNING("%s", m_data->label.c_str());
            let targetdata = this.data.target;
            if (targetdata.option == KFBlockTargetOption.Create)
            {
                this.m_target.DeactiveBLK(targetdata);
                this.m_container.RemoveChild(this.m_target);
                this.m_runtime.domain.DestroyBlockTarget(this.m_target);
            }
        }

        this.m_target = null;
    }

}