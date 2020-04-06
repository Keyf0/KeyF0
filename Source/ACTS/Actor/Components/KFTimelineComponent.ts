import {KFComponentBase} from "./KFComponentBase";
import {IKFTimelineEventListener} from "../../Timeline/IKFTimelineProc";
import {KFTimeline} from "../../Timeline/KFTimeline";
import {Disposable} from "../../../Core/Misc/TypeEvent";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../Context/KFBlockTarget";

export class KFTimelineComponent extends KFComponentBase
{
    public static Meta:IKFMeta
        = new IKFMeta("KFTimelineComponent");
    public playing:boolean;

    private m_cfg:any;
    private m_timeline:KFTimeline;
    private m_onbeginplay:Disposable;
    private stateid:number = -1;

    public constructor(target:KFBlockTarget)
    {
        super(target, KFTimelineComponent.Meta.type);
        this.m_timeline = new KFTimeline(target);
    }

    public ReleaseComponent():void
    {
        this.m_timeline.Release();
    }

    public ResetComponent():void
    {
        let state = this.m_timeline.currstate;
        let currentFrameIndex = this.m_timeline.currframeindex;

        if (state && currentFrameIndex >= state.length)
        {
            currentFrameIndex = state.length - 1;
        }

        let tmp:number = this.stateid;
        this.stateid = -1;
        this.m_timeline.Reset();
        let tconfig = this.runtime.configs.GetTimelineConfig(this.targetObject.metadata.asseturl,false);
        this.m_cfg = tconfig;

        this.m_timeline.SetConfig(tconfig);

        this.PlayFrame(currentFrameIndex, tmp);
    }

    public ActivateComponent():void
    {
        this.m_cfg = this.runtime.configs.GetTimelineConfig(this.targetObject.metadata.asseturl,false);
        this.m_timeline.SetConfig(this.m_cfg);
    }

    public DeactiveComponent():void
    {
        if(this.m_onbeginplay != null)
        {
            this.m_onbeginplay.dispose();
            this.m_onbeginplay = null;
        }

        this.stateid = 0;
        this.playing = true;
        this.m_cfg = null;
    }

    public EnterFrame(frameindex:number):void {
        if(this.playing)
            this.m_timeline.Tick(frameindex);
    }

    public Play(stateid:number, force:boolean = false) {
        if (!force && this.stateid == stateid) return;

        this.playing = true;
        this.stateid = stateid;
        //this.ClearKeyFrame();
        this.m_timeline.Play(stateid, 0);
    }

    public SetState(stateid:number) {
        this.stateid = stateid;
        //this.ClearKeyFrame();
        this.m_timeline.SetState(stateid);
    }

    public DisplayFrame(frameindex:number, bJumpFrame:boolean = false) {
        this.m_timeline.DisplayFrame(frameindex, bJumpFrame);
    }

    //public ClearKeyFrame():void{}

    public PlayFrame(frame:number, stateid:number = -1) {
        this.playing = true;
        if(stateid != -1) {
            this.stateid = stateid;
            this.m_timeline.Play(stateid, frame);
        }else{
            this.m_timeline.TickInternal(frame);
        }
    }

    public GetFrame():number{return this.m_timeline.currframeindex;}

    public PlayTime(stateid:number, startTimeNormalized:number) {
        this.playing = true;
        this.stateid = stateid;
        this.m_timeline.Play1(stateid, startTimeNormalized);
    }

    public PlayOnly(stateid:number) {
        this.m_timeline.Play(stateid, 0);
    }

    public PlayRepeatFrame(startFrameIndex:number = 0) {

        this.m_timeline.Play(this.stateid, startFrameIndex);
    }

    public PlayRepeatTime(startTimeNormalized:number = 0.0)
    {
        this.m_timeline.Play1(this.stateid, startTimeNormalized);
    }

    public Stop()
    {
        this.playing = false;
    }

    public StopAt(stopFrameIndex:number = 0)
    {
        this.m_timeline.TickInternal(stopFrameIndex,true);
        this.playing = false;
    }

    public StopAtTime(stopTimeNormalized:number = 0.0)
    {
        
    }


    public SetTimelineEventListener(listener:IKFTimelineEventListener)
    {
        this.m_timeline.listener = listener;
    }

    public HasState(stateid:number):boolean
    {
        return this.m_timeline.HasState(stateid);
    }
}