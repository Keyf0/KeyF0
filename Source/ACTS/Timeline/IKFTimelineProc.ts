export interface IKFTimelineContext
{
    IsEditing:boolean;
    OnFrameBox(box:any):void;
    OnKeyFrame(blockdata:any, keyframe:any):void;
}


export interface IKFTimelineEventListener
{
    OnTimelineEvent(frameIndex:number, eventType:number):void;
}