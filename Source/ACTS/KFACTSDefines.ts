export class KFGlobalDefines
{
    ///每帧的时间间隔ms
    public static FIX_TPF:number = 16;
    ///默认是等于FIX_TPF
    public static TPF:number = 16;
    ///渲染TICK一般是原始TICK的间隔
    public static RENDER_TPF:number = 16;

    public static FPS:number = 60;
    ///是否调试模式
    public static IS_Debug:boolean = true;

    public static SetFPS(v:number = 60){
        KFGlobalDefines.FPS = v;
        let tpf :number = Math.floor( 1000 / v);
        KFGlobalDefines.RENDER_TPF = tpf;
        KFGlobalDefines.TPF = tpf;
        KFGlobalDefines.FIX_TPF = tpf;
    }
}