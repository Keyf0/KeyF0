import {IKFTimelineContext} from "./IKFTimelineProc";
import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {KFBlockTargetOption} from "../Data/KFBlockTargetOption";

export class KFTimeBlock
{
    private m_ctx:IKFTimelineContext;
    private m_container:IKFBlockTargetContainer;
    private m_keyframes:{[key:number]:any};
    private m_v:boolean;///显隐

    public m_target:KFBlockTarget;
    public data:any;
    public keep:boolean;
    public option:number;
    public opoption:number;

    public Create(  container:IKFBlockTargetContainer
                  , ctx:IKFTimelineContext
                  , data:any)
    {
        this.m_container = container;
        this.m_ctx = ctx;
        this.SetData(data);
    }

    public Release()
    {
        this.Deactive(true);
        this.m_container = null;
        this.m_ctx = null;
        this.data = null;
        this.m_keyframes = null;
    }

    public SetData(data:any)
    {
        this.data = data;
        this.option = data.target.option;
        this.opoption = data.opOption;
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

    }

    public Tick(frameIndex:number, bJumpFrame:boolean)
    {
        if(this.option == KFBlockTargetOption.Disabled)
            return;

        let endi = this.data.end;
        if( frameIndex >= this.data.begin &&  frameIndex < endi) {
            frameIndex -= this.data.begin;
            if (this.m_target == null) {
                this.Activate();
            }

            this.TickInternal(frameIndex, bJumpFrame);
        }
        else if(this.option == KFBlockTargetOption.Create) {
            if(this.m_v) {
                this.m_v =  false;
                this.m_target.visible = false;
            }
        }
    }

    ///简单判定另开一个函数处理直接显示逻辑
    public DisplayFrame(frameIndex:number, bJumpFrame:boolean) {

        let bdata = this.data;
        let endi = bdata.end;
        let bgi = bdata.begin;

        if( frameIndex >= bgi &&  frameIndex < endi) {
            frameIndex -= bgi;
            if (this.m_target == null)
            {
                this.Activate();
            }
            if (!this.m_v) {
                this.m_v = true;
                this.m_target.visible = true;
            }

            let keyframe = this.m_keyframes[frameIndex];
            if (keyframe) {
                if (this.opoption != 0) {
                    this.m_target.display = keyframe.display;
                    this.m_target.set_datas(keyframe.values);
                }
            } else if (bJumpFrame) {

                let prevFrameIndex = frameIndex - 1;
                while (prevFrameIndex >= 0) {
                    keyframe = this.m_keyframes[prevFrameIndex];
                    if (keyframe) {
                        if (this.opoption != 0) {
                            this.m_target.display = keyframe.display;
                            this.m_target.set_datas(keyframe.values);
                        }
                        break;
                    }
                    --prevFrameIndex;
                }
            }
        }
    }

    private TickInternal(frameIndex:number, bJumpFrame:boolean)
    {
        if(!this.m_v) {
            this.m_v =  true;
            this.m_target.visible = true;
        }

        let keyframe = this.m_keyframes[frameIndex];
        if (keyframe) {
            this.m_ctx.OnKeyFrame(this.m_target, keyframe);
            if(this.opoption != 0) {
                this.m_target.display = keyframe.display;
                this.m_target.set_datas(keyframe.values);
            }
        }
        else if (bJumpFrame) {

            let prevFrameIndex = frameIndex - 1;
            while (prevFrameIndex >= 0) {
                keyframe = this.m_keyframes[prevFrameIndex];
                if (keyframe) {
                    if(this.opoption != 0) {
                        this.m_target.display = keyframe.display;
                        this.m_target.set_datas(keyframe.values);
                    }
                    break;
                }
                --prevFrameIndex;
            }
        }
    }

    private Activate()
    {
        let targetdata = this.data.target;

        if (this.option == KFBlockTargetOption.Create) {
            this.m_target = this.m_container.CreateChild(targetdata);
            this.m_v = true;
        }
        else if (this.option == KFBlockTargetOption.Attach) {
            this.m_target = this.m_container.FindChild(targetdata.instname);
        } else {
            ///是自己
            this.m_target = <any>this.m_container;
        }
    }

    private Deactive(force:boolean = false)
    {
        if (this.m_target != null)
        {
            //LOG_WARNING("%s", m_data->label.c_str());
            if (this.option == KFBlockTargetOption.Create)
            {
                this.m_container.DeleteChild(this.m_target);
            }
        }
        this.m_target = null;
    }
}