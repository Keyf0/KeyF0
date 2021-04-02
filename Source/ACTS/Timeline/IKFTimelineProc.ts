export interface IKFTimelineContext
{

}


export interface IKFTimelineEventListener
{
    OnTimelineEvent(frameIndex:number, eventType:number):void;
}