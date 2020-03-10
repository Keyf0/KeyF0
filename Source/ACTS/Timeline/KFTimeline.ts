import {TypeEvent} from "../../Core/Misc/TypeEvent";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFTimeBlock} from "./KFTimeBlock";
import {IKFTimelineContext, IKFTimelineEventListener} from "./IKFTimelineProc";
import {IKFTimelineRenderer} from "./IKFTimelineRenderer";
import {KFGlobalDefines} from "../KFACTSDefines";
import {KFPool} from "../../Core/Misc/KFPool";
import {KFBlockTargetOption} from "../Data/KFBlockTargetOption";

export class KFTimeline implements IKFTimelineContext
{
    public onPlayBegin:TypeEvent<number> = new TypeEvent<number>();
    public onPlayEnd:TypeEvent<number> = new TypeEvent<number>();
    public currstate:any;
    public currframeindex:number = 0;
    public listener:IKFTimelineEventListener;

    private m_runtime:IKFRuntime;
    private m_cfg:any;
    private m_states:{[key:number]:any} = {};
    private m_blocks:Array<KFTimeBlock> = new Array<KFTimeBlock>();

    private static TB_pool:KFPool<KFTimeBlock> = new KFPool<KFTimeBlock>
    (function ():KFTimeBlock {
        return new KFTimeBlock();
    });


    private m_length:number = 0;
    private m_loop:boolean = true;
    private m_tpf:number = 0;

    ///当前组件的对象
    private m_target:any = null;

    private m_listProcKeyFrames:Array<{
        target: any;
        keyframe: any;
    }> = [];

    private m_listProcSize:number = 0;

    public constructor(     runtime:IKFRuntime
                       ,    target:any)
    {
        this.m_runtime = runtime;
        this.m_target = target;
        this.m_tpf = KFGlobalDefines.TPF / 1000.0;
    }

    public SetConfig(cfg:any):void
    {
        if(!cfg) return;

        this.DestroyBlocks();
        this.m_cfg = cfg;
        this.m_states = {};

        for (let data of cfg.states)
        {
            this.m_states[data.id] = data;
        }
    }

    private DestroyBlocks()
    {
        for (let block of this.m_blocks)
        {
            block.Release();
            KFTimeline.TB_pool.Recycle(block);
        }
        this.m_blocks.length = 0;
    }

    private TickInternal(frameIndex:number, bJumpFrame:boolean = false)
    {
        if (this.currframeindex == frameIndex) return;

        this.currframeindex = frameIndex;

        for (let block of this.m_blocks)
        {
            block.Tick(frameIndex, bJumpFrame);
        }

        ///帧的最后执行脚本逻辑
        this.ProcKeyFrame();
    }

    private SetState(stateid:number):boolean
    {
        this.m_length = 1;
        this.m_loop = false;

        if (this.m_cfg)
        {
            this.currframeindex = -1;
            this.currstate = this.m_states[stateid];

            if (this.currstate)
            {
                this.m_length = this.currstate.length;
                this.m_loop = this.currstate.loop;

                //LOG_TAG("state:%d, loop:%d, length:%d", stateid, m_loop, m_length);

                this.DestroyBlocks();

                let m_pool = KFTimeline.TB_pool;
                for (let layer of this.currstate.layers)
                {
                    for (let data of layer.blocks)
                    {
                        let block = m_pool.Fetch();
                        block.Create(this.m_runtime, this.m_target, this, data);
                        this.m_blocks.push(block);
                    }
                }

                return true;
            }
        }

        return false;
    }

    public SetRenderer(renderer:IKFTimelineRenderer) {}

    public Release():void
    {
        for (let block of this.m_blocks)
        {
            block.Release();
        }
    }

    public Play(stateid:number, startFrameIndex:number)
    {
        this.m_listProcSize = 0;
        if(this.SetState(stateid))
        {
            this.onPlayBegin.emit(stateid);
            this.TickInternal(startFrameIndex, true);
        }
    }

    public Play1(stateid:number, startTimeNormalized:number)
    {
        this.m_listProcSize = 0;
        if (this.SetState(stateid))
        {
            this.onPlayBegin.emit(stateid);
            let startFrameIndex:number = startTimeNormalized * this.m_length;
            this.TickInternal(startFrameIndex, true);
        }
    }

    public Reset()
    {
        this.DestroyBlocks();

        this.currstate = null;
        this.m_length = 1;
        this.currframeindex = -1;
        this.m_loop = false;
    }

    public GetState(stateid:number):any
    {
        return this.m_states[stateid];
    }

    public HasState(stateid:number):boolean
    {
        return this.m_states[stateid] != null;
    }

    public Tick()
    {
        if (this.currstate)
        {
            let nextFrameIndex = this.currframeindex + 1;
            if (nextFrameIndex >= this.m_length)
            {
                if (this.m_loop)
                {
                    nextFrameIndex = 0;
                    this.TickInternal(nextFrameIndex, false);
                }
                else
                {
                    ///目标还是需要TICK的 不然只有一帧的子集也不执行了
                    for (let block of this.m_blocks)
                    {
                        if (block.option != KFBlockTargetOption.Attach)
                        {
                            block.m_target.Tick(nextFrameIndex);
                        }
                    }

                    this.onPlayEnd.emit(this.currstate.id);
                }
            }
            else
            {
                this.TickInternal(nextFrameIndex, false);
            }
        }
    }


    public OnFrameBox(box: any): void
    {

    }

    public OnKeyFrame(target: any, keyframe: any): void
    {
        if(this.m_listProcSize >= this.m_listProcKeyFrames.length)
        {
            this.m_listProcKeyFrames.push({target:target,keyframe:keyframe});
        }
        else
        {
            let info = this.m_listProcKeyFrames[this.m_listProcSize];
            info.target = target;
            info.keyframe = keyframe;
        }

        this.m_listProcSize += 1;
    }

    public ProcKeyFrame()
    {
        if (this.m_listProcSize > 0)
        {
            let i = 0;
            let size = this.m_listProcSize;

            while ( i < size) {

                let frameinfo = this.m_listProcKeyFrames[i];
                let keyframe = frameinfo.keyframe;
                let target = frameinfo.target;

                if(target == null)
                {
                    target = this.m_target;
                }

                this.m_target.script.ExecuteFrameScript(keyframe.id, keyframe.data, target);

                if (keyframe.evt > 0)
                {
                    if (this.listener)
                        this.listener
                            .OnTimelineEvent(keyframe.id, keyframe.evt);
                }

                i += 1;
            }

            this.m_listProcSize = 0;
        }
    }
}