import {TypeEvent} from "../../Core/Misc/TypeEvent";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFTimeBlock} from "./KFTimeBlock";
import {IKFTimelineContext} from "./IKFTimelineProc";
import {IKFBlockTargetContainer} from "../Context/KFBlockTarget";
import {IKFTimelineRenderer} from "./IKFTimelineRenderer";
import {KFGlobalDefines} from "../KFACTSDefines";
import {KFPool} from "../../Core/Misc/KFPool";
import {KFBlockTargetOption} from "../Data/KFBlockTargetOption";

export class KFTimeline
{
    public onPlayBegin:TypeEvent<number> = new TypeEvent<number>();
    public onPlayEnd:TypeEvent<number> = new TypeEvent<number>();
    public currstate:any;
    public currframeindex:number;


    private m_runtime:IKFRuntime;
    private m_cfg:any;
    private m_states:{[key:number]:any} = {};
    private m_blocks:Array<KFTimeBlock> = new Array<KFTimeBlock>();

    private static TB_pool:KFPool<KFTimeBlock> = new KFPool<KFTimeBlock>
    (function ():KFTimeBlock {
        return new KFTimeBlock();
    });



    private m_length:number;
    private m_loop:boolean;
    private m_tpf:number;

    private m_ctx:IKFTimelineContext;
    private m_container:IKFBlockTargetContainer;
    private m_renderer:IKFTimelineRenderer;

    public constructor(runtime:IKFRuntime
                       , container:IKFBlockTargetContainer
    , ctx:IKFTimelineContext)
    {
        this.m_container = container;
        this.m_ctx = ctx;
        this.m_runtime = runtime;
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
            this.m_states[data["id"]] = data;
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

        if(this.m_blocks.length == 0)
        {
            //LOG_TAG_ERROR("current state [%d, %s]'s blocks is empty!", m_state->id, m_state->name.c_str());
        }

        for (let block of this.m_blocks)
        {
            block.Tick(frameIndex, bJumpFrame);
        }

        if (this.m_renderer)
        {
            let time = this.currframeindex * this.m_tpf;
            //LOG_WARNING("%d:%f", m_frameindex, time.ToFloat());
            this.m_renderer.RenderFrame(time);
        }
        else
        {
            //LOG("%d", frameIndex);
        }
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

                if(this.currstate.layers.length == 0)
                {
                    //LOG_TAG_ERROR("state [%d, %s].layers is empty!", stateid, m_state->name.c_str());
                }
                else
                {
                    let layer:any = this.currstate.layers[0];
                    if(layer.blocks.length == 0)
                    {
                        //LOG_TAG_ERROR("state [%d, %s].layers[0].blocks is empty!", stateid, m_state->name.c_str());
                    }
                    else
                    {
                        if(layer.blocks.length > 1)
                        {
                            //LOG_TAG_ERROR("state [%d, %s].layers[0].blocks.size() > 1", stateid, m_state->name.c_str());
                        }

                        let data:any = layer.blocks[0];
                        data.target.option = KFBlockTargetOption.Ignore;
                    }
                }

                let m_pool = KFTimeline.TB_pool;
                for (let layer of this.currstate.layers)
                {
                    for (let data of layer.blocks)
                    {
                        let block = m_pool.Fetch();
                        block.Create(this.m_runtime, this.m_container, this.m_ctx, data);
                        this.m_blocks.push(block);
                    }
                }

                return true;
            }
        }

        return false;
    }

    public SetRenderer(renderer:IKFTimelineRenderer)
    {
        this.m_renderer = renderer;
    }

    public Release():void
    {
        for (let block of this.m_blocks)
        {
            block.Release();
        }
    }

    public Play(stateid:number, startFrameIndex:number)
    {
        if(this.SetState(stateid))
        {
            this.onPlayBegin.emit(stateid);
            this.TickInternal(startFrameIndex, true);
        }

        if(this.m_renderer)
        {
            this.m_renderer.Play(stateid, startFrameIndex);
        }
    }

    public Play1(stateid:number, startTimeNormalized:number)
    {
        if (this.SetState(stateid))
        {
            this.onPlayBegin.emit(stateid);
            let startFrameIndex:number = startTimeNormalized * this.m_length;
            this.TickInternal(startFrameIndex, true);
        }

        if (this.m_renderer)
        {
            this.m_renderer.PlayNormalized(stateid, startTimeNormalized);
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
                    this.onPlayEnd.emit(this.currstate.id);
                }
            }
            else
            {
                this.TickInternal(nextFrameIndex, false);
            }
        }
    }
}