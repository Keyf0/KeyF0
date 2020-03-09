export interface IKFTimelineContext
{
    OnFrameBox(box:any):void;
    OnKeyFrame(target:any, keyframe:any):void;
}


export interface IKFTimelineEventListener
{
    OnTimelineEvent(frameIndex:number, eventType:number):void;
}