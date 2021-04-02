import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {BlkExecSide} from "../../Context/KFBlockTarget";
import {IKFTimelineContext} from "../../Timeline/IKFTimelineProc";
import {KFTimeBlock} from "../../Timeline/KFTimeBlock";
import {KFPool} from "../../../Core/Misc/KFPool";
import {KFGlobalDefines} from "../../KFACTSDefines";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {IKFRuntime} from "../../Context/IKFRuntime";
import {KFScriptContext} from "../../Script/KFScriptDef";
import {KFActor} from "../KFActor";

export class StateBlock
{
    public stateid:number = -1;
    public length:number = 0;
    public loop:boolean = true;
    public blocks:Array<KFTimeBlock> = new Array<KFTimeBlock>();
}

export class KFTimelineComponent implements IKFTimelineContext
{
    public static Meta:IKFMeta = new IKFMeta("KFTimelineComponent");

    public runtime: IKFRuntime;

    private m_cfg:any;

    private m_states:{[key:number]:any} = {};
    private m_stateBlocks:{[key:number]:StateBlock} = {};

    private static TB_pool:KFPool<KFTimeBlock> = new KFPool<KFTimeBlock>
    (function ():KFTimeBlock {return new KFTimeBlock();});

    //private m_tpf:number = 0;
    public asseturl:string;

    public constructor(runtime:IKFRuntime, asseturl:string)
    {
        this.runtime = runtime;
        this.asseturl = asseturl;
        //this.m_tpf = KFGlobalDefines.TPF / 1000.0;
    }

    public Destroy():void
    {
        this.DestroyBlocks();
    }

    public ClearState(self:KFActor)
    {
        let stateid  = self.stateid;
        if(stateid != -1)
        {
            let stateBlock:StateBlock = this.m_stateBlocks[stateid];
            if(stateBlock) {
                for (let block of stateBlock.blocks) {
                    block.Deactive(self, true);
                }
            }
            self.stateid = -1;
        }
    }

    public ResetComponent(self:KFActor):void
    {
        let state = this.m_states[self.stateid];
        let currentFrameIndex = self.currframeindex;

        if (state && currentFrameIndex >= state.length)
        {
            currentFrameIndex = state.length - 1;
        }

        let tmp:number = self.stateid;
        this.ClearState(self);
        self.currframeindex = -1;

        this.PlayFrame(self, currentFrameIndex, tmp);
    }

    public ActivateComponent(self:KFActor):void
    {
        if(this.m_cfg == null)
        {
            this.m_cfg = this.runtime.configs.GetTimelineConfig(this.asseturl, false);
            this.SetConfig(this.m_cfg);
        }
    }

    public DeactiveComponent(self:KFActor):void
    {
        this.ClearState(self);
    }

    public EnterFrame(self:KFActor, frameindex:number):void
    {
        if(self.isPlaying)
        {
            let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
            if (stateBlock)
            {
                let nextFrameIndex = self.currframeindex + 1;
                if (nextFrameIndex >= stateBlock.length)
                {
                    if (stateBlock.loop)
                    {
                        nextFrameIndex = 0;
                        this.TickInternal(self, stateBlock, nextFrameIndex, false);
                    }
                    else {
                        //this.onPlayEnd.emit(this.currstate.id);
                    }
                }
                else {
                    this.TickInternal(self, stateBlock, nextFrameIndex, false);
                }
            }
        }
    }

    public Play(self:KFActor, stateid:number, startframe:number = 0, force:boolean = false)
    {
        if (!force && self.stateid == stateid)
            return;

        self.isPlaying = true;

        //this.ClearKeyFrame();

        self.tlProcSize = 0;

        if(this.SetState(self,stateid))
        {
            let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
            if(stateBlock)
            this.TickInternal(self, stateBlock, startframe, true);
        }
    }

    public DisplayFrame(self:KFActor,frameIndex:number, bJumpFrame:boolean = false)
    {
        if (self.currframeindex == frameIndex)
            return;
        self.currframeindex = frameIndex;
        let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
        if(stateBlock) {
            for (let block of stateBlock.blocks) {
                block.DisplayFrame(self, frameIndex, bJumpFrame);
            }
        }
    }

    //public ClearKeyFrame():void{}

    public PlayFrame(self:KFActor, frame:number, stateid:number = -1) {
        self.isPlaying = true;
        if(self.stateid != -1) {
            this.Play(self, stateid, frame);
        }else{
            let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
            if(stateBlock) {
                this.TickInternal(self, stateBlock, frame);
            }
        }
    }

    public PlayTime(self:KFActor,stateid:number, startTimeNormalized:number)
    {
        self.isPlaying = true;

        this.Play1(self,stateid, startTimeNormalized);
    }

    public PlayOnly(self:KFActor,stateid:number) {
        this.Play(self, stateid, 0);
    }

    public PlayRepeatFrame(self:KFActor,startFrameIndex:number = 0) {

        this.Play(self, self.stateid, startFrameIndex);
    }

    public PlayRepeatTime(self:KFActor,startTimeNormalized:number = 0.0)
    {
        this.Play1(self, self.stateid, startTimeNormalized);
    }

    public Stop(self:KFActor)
    {
        self.isPlaying = false;
    }

    public StopAt(self:KFActor,stopFrameIndex:number = 0)
    {
        let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
        if(stateBlock) {
            this.TickInternal(self, stateBlock, stopFrameIndex, true);
        }
        self.isPlaying = false;
    }

    public StopAtTime(self:KFActor,stopTimeNormalized:number = 0.0)
    {

    }

    public HasState(stateid:number):boolean
    {
        return this.m_states[stateid] != null;
    }

    public SetConfig(cfg:any):void
    {
        if(!cfg) return;

        this.DestroyBlocks();

        this.m_cfg = cfg;
        this.m_states = {};

        let statesarr = cfg.states;
        if(statesarr) {
            for (let data of statesarr) {
                this.m_states[data.id] = data;
            }
        }
    }

    private DestroyBlocks()
    {
        for(let key in this.m_stateBlocks) {

            let blockstate = this.m_stateBlocks[key];
            for (let block of blockstate.blocks) {
                block.Destroy();
                KFTimelineComponent.TB_pool.Recycle(block);
            }
        }
        this.m_stateBlocks = {};
    }

    public TickInternal(self:KFActor,stateBlock:StateBlock,frameIndex:number, bJumpFrame:boolean = false)
    {
        if (self.currframeindex == frameIndex) return;
        self.currframeindex = frameIndex;
        for (let block of stateBlock.blocks)
        {
            block.Tick(self, frameIndex, bJumpFrame);
        }
        ///帧的最后执行脚本逻辑
        this.ProcKeyFrame(self);
    }

    public SetState(self:KFActor, stateid:number):boolean
    {
        if (this.m_cfg)
        {
            if(self.stateid != stateid)
            {
                this.ClearState(self);

                self.stateid = stateid;
                self.currframeindex = -1;
                let stateblock: StateBlock = this.m_stateBlocks[stateid];
                if (stateblock == null) {
                    let currstate = this.m_states[stateid];
                    if (currstate) {
                        stateblock = new StateBlock();
                        this.m_stateBlocks[stateid] = stateblock;

                        stateblock.stateid = stateid;
                        stateblock.length = currstate.length;
                        stateblock.loop = currstate.loop;

                        //LOG_TAG("state:%d, loop:%d, length:%d", stateid, m_loop, m_length);

                        //this.DestroyBlocks();

                        let CurrSide = this.runtime.execSide;

                        let m_pool = KFTimelineComponent.TB_pool;
                        let layers: any[] = currstate.layers;
                        let layeri = layers.length - 1;
                        let blockid = 0;

                        while (layeri >= 0) {
                            let layer = layers[layeri];
                            layeri -= 1;
                            for (let data of layer.blocks) {
                                let tdata = data.target;
                                if (!tdata) {
                                    tdata = {
                                        execSide: BlkExecSide.BOTH
                                        , option: KFBlockTargetOption.Ignore
                                    };
                                    data.target = tdata;
                                }
                                let execSide = tdata.execSide ? tdata.execSide : BlkExecSide.BOTH;
                                if ((CurrSide & execSide) == 0)
                                    continue;
                                ///如果是主客户端 不判定主客户端只判定服务器还是SERVER端
                                if (execSide == BlkExecSide.SELFCLIENT) {
                                    continue;
                                }

                                let block = m_pool.Fetch();
                                blockid += 1;
                                block.Create(this, data, blockid);
                                stateblock.blocks.push(block);
                            }
                        }

                        return true;
                    }
                }
            }
        }

        return false;
    }

    public Play1(self:KFActor, stateid:number, startTimeNormalized:number)
    {
        self.tlProcSize = 0;
        if (this.SetState(self,stateid))
        {
            let stateBlock:StateBlock = this.m_stateBlocks[self.stateid];
            if(stateBlock)
            {
                let startFrameIndex: number = startTimeNormalized * stateBlock.length;
                this.TickInternal(self, stateBlock, startFrameIndex, true);
            }
        }
    }

    public GetState(stateid:number):any
    {
        return this.m_states[stateid];
    }

    public ProcKeyFrame(self:KFActor)
    {
        if (self.tlProcSize > 0)
        {
            let i = 0;
            let size = self.tlProcSize;
            let m_scripts:KFScriptContext = self.runtime.scripts;

            while ( i < size)
            {

                let frameinfo = self.tlProcKeyFrames[i];
                let keyframe = frameinfo.keyframe;
                let target = frameinfo.target;

                if(target == null)
                {
                    target = self;
                }

                let framedata = keyframe.data;
                let scripts = framedata.scripts;
                if(scripts && scripts.length > 0)
                {
                    m_scripts.ExecuteFrameScript(keyframe.id, framedata, target);
                }
                //改变成etable事件?
                //if (keyframe.evt > 0)
                //{
                //    if (this.listener)
                //    {
                //        this.listener
                //            .OnTimelineEvent(keyframe.id, keyframe.evt);
                //    }
                //}

                i += 1;
            }

            self.tlProcSize = 0;
        }
    }
}