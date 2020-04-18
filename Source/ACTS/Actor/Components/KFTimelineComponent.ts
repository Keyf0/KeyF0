import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {IKFTimelineContext} from "../../Timeline/IKFTimelineProc";
import {KFTimeBlock} from "../../Timeline/KFTimeBlock";
import {KFPool} from "../../../Core/Misc/KFPool";
import {KFScriptContext} from "../../../KFScript/KFScriptDef";
import {KFGlobalDefines} from "../../KFACTSDefines";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {IKFRuntime} from "../../Context/IKFRuntime";

export class KFTimelineComponent implements IKFTimelineContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFTimelineComponent");

    public targetObject:KFBlockTarget;
    public runtime: IKFRuntime;

    public playing:boolean;

    public currstate:any;
    public currframeindex:number = 0;

    private m_cfg:any;
    private stateid:number = -1;

    private m_states:{[key:number]:any} = {};
    private m_blocks:Array<KFTimeBlock> = new Array<KFTimeBlock>();

    private static TB_pool:KFPool<KFTimeBlock> = new KFPool<KFTimeBlock>
    (function ():KFTimeBlock {
        return new KFTimeBlock();
    });

    private m_length:number = 0;
    private m_loop:boolean = true;
    private m_tpf:number = 0;

    private m_listProcKeyFrames:Array<{
        target: any;
        keyframe: any;
    }> = [];

    private m_listProcSize:number = 0;
    private m_scripts:KFScriptContext = null;

    public constructor(target:KFBlockTarget)
    {
        this.targetObject = target;
        this.runtime = target.runtime;
        this.m_tpf = KFGlobalDefines.TPF / 1000.0;
    }

    public ReleaseComponent():void
    {
        for (let block of this.m_blocks)
        {
            block.Release();
        }
    }

    public ResetComponent():void
    {
        let state = this.currstate;
        let currentFrameIndex = this.currframeindex;

        if (state && currentFrameIndex >= state.length)
        {
            currentFrameIndex = state.length - 1;
        }

        let tmp:number = this.stateid;
        this.stateid = -1;
        this.Reset();
        let tconfig = this.runtime.configs.GetTimelineConfig(this.targetObject.metadata.asseturl,false);
        this.m_cfg = tconfig;

        this.SetConfig(tconfig);

        this.PlayFrame(currentFrameIndex, tmp);
    }

    public ActivateComponent():void
    {
        this.m_cfg = this.runtime.configs.GetTimelineConfig(this.targetObject.metadata.asseturl,false);
        this.SetConfig(this.m_cfg);
    }

    public DeactiveComponent():void
    {
        this.stateid = 0;
        this.playing = true;
        this.m_cfg = null;
    }

    public EnterFrame(frameindex:number):void {
        if(this.playing) {
            if (this.currstate) {
                let nextFrameIndex = this.currframeindex + 1;
                if (nextFrameIndex >= this.m_length) {
                    if (this.m_loop) {
                        nextFrameIndex = 0;
                        this.TickInternal(nextFrameIndex, false);
                    }
                    else {
                        //this.onPlayEnd.emit(this.currstate.id);
                    }
                }
                else {
                    this.TickInternal(nextFrameIndex, false);
                }
            }
        }
    }

    public Play(stateid:number, startframe:number = 0, force:boolean = false) {
        if (!force && this.stateid == stateid) return;

        this.playing = true;
        this.stateid = stateid;
        //this.ClearKeyFrame();

        this.m_listProcSize = 0;
        if(this.SetState(stateid)) {
            this.TickInternal(startframe, true);
        }
    }

    public DisplayFrame(frameIndex:number, bJumpFrame:boolean = false) {
        if (this.currframeindex == frameIndex) return;
        this.currframeindex = frameIndex;
        for (let block of this.m_blocks) {
            block.DisplayFrame(frameIndex, bJumpFrame);
        }
    }

    //public ClearKeyFrame():void{}

    public PlayFrame(frame:number, stateid:number = -1) {
        this.playing = true;
        if(stateid != -1) {
            this.stateid = stateid;
            this.Play(stateid, frame);
        }else{
            this.TickInternal(frame);
        }
    }

    public GetFrame():number{return this.currframeindex;}

    public PlayTime(stateid:number, startTimeNormalized:number) {
        this.playing = true;
        this.stateid = stateid;
        this.Play1(stateid, startTimeNormalized);
    }

    public PlayOnly(stateid:number) {
        this.Play(stateid, 0);
    }

    public PlayRepeatFrame(startFrameIndex:number = 0) {

        this.Play(this.stateid, startFrameIndex);
    }

    public PlayRepeatTime(startTimeNormalized:number = 0.0)
    {
        this.Play1(this.stateid, startTimeNormalized);
    }

    public Stop()
    {
        this.playing = false;
    }

    public StopAt(stopFrameIndex:number = 0)
    {
        this.TickInternal(stopFrameIndex,true);
        this.playing = false;
    }

    public StopAtTime(stopTimeNormalized:number = 0.0)
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
        this.m_scripts = this.runtime.scripts;

        let statesarr = cfg.states;
        if(statesarr) {
            for (let data of statesarr) {
                this.m_states[data.id] = data;
            }
        }
    }

    private DestroyBlocks()
    {
        for (let block of this.m_blocks)
        {
            block.Release();
            KFTimelineComponent.TB_pool.Recycle(block);
        }
        this.m_blocks.length = 0;
    }

    public TickInternal(frameIndex:number, bJumpFrame:boolean = false) {
        if (this.currframeindex == frameIndex) return;
        this.currframeindex = frameIndex;

        for (let block of this.m_blocks) {
            block.Tick(frameIndex, bJumpFrame);
        }
        ///帧的最后执行脚本逻辑
        this.ProcKeyFrame();
    }

    public SetState(stateid:number):boolean
    {
        this.stateid = stateid;
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

                let CurrSide = this.targetObject.runtime.execSide;
                let owner = this.targetObject.owner;

                let m_pool = KFTimelineComponent.TB_pool;
                let layers:any[] = this.currstate.layers;
                let layeri = layers.length - 1;
                while (layeri >= 0)
                {
                    let layer = layers[layeri];
                    layeri -= 1;
                    for (let data of layer.blocks)
                    {
                        let tdata = data.target;
                        if(!tdata){
                            tdata = {execSide:BlkExecSide.BOTH
                                ,option:KFBlockTargetOption.Ignore};
                            data.target = tdata;
                        }
                        let execSide = tdata.execSide ? tdata.execSide : BlkExecSide.BOTH;
                        if((CurrSide & execSide) == 0)
                            continue;
                        ///如果是主客户端
                        if(execSide == BlkExecSide.SELFCLIENT && !owner){
                            continue;
                        }

                        let block = m_pool.Fetch();
                        block.Create(<any>this.targetObject, this, data);
                        this.m_blocks.push(block);
                    }
                }

                return true;
            }
        }

        return false;
    }

    public Play1(stateid:number, startTimeNormalized:number)
    {
        this.m_listProcSize = 0;
        if (this.SetState(stateid)) {
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

    public GetState(stateid:number):any {
        return this.m_states[stateid];
    }

    public OnFrameBox(box: any): void {

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

    public ProcKeyFrame() {
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
                    target = this.targetObject;
                }
                let framedata = keyframe.data;
                let scripts = framedata.scripts;
                if(scripts && scripts.length > 0) {
                    this.m_scripts.ExecuteFrameScript(keyframe.id, framedata, target);
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

            this.m_listProcSize = 0;
        }
    }
}