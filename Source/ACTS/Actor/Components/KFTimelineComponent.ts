import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {IKFTimelineContext, IKFTimelineEventListener} from "../../Timeline/IKFTimelineProc";
import {KFTimeline} from "../../Timeline/KFTimeline";
import {KFTimeBlock} from "../../Timeline/KFTimeBlock";

export class KFTimelineComponent extends KFComponentBase implements IKFTimelineContext
{
    public static Meta:KFDName
        = new KFDName("KFTimelineComponent");

    private m_cfg:any;
    private m_timeline:KFTimeline;
    private m_listener:IKFTimelineEventListener;
    private m_listProcKeyFrames:Array<any> = new Array<any>();

    private freeze:boolean;
    private playing:boolean;
    private stateid:number = -1;

    public IsEditing: boolean;

    public constructor(target:any)
    {
        super(target, KFTimelineComponent.Meta.value);
    }

    public ReleaseComponent():void
    {
        this.m_timeline.Release();
    }

    public ResetComponent():void
    {

    }

    public SetFreeze(value:boolean)
    {

    }

    public OnFrameBox(box: any): void
    {

    }

    public OnKeyFrame(blockdata: any, keyframe: any): void
    {

    }
}