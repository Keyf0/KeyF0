
export interface IKFTimelineRenderer
{
    Play(stateid:number, startTimeNative:number):void;
    PlayNormalized(stateid:number, startTimeNormalized:number):void;
    speed:number;
    SetSpeed(value:number):void;
    RenderFrame(time:number):void;
}