
///KFD(C,NOF=1)
export class KFGraphBlockType
{
    ///KFD(P=1,CNAME=普通)
    public static Normal:number = 0;
    ///KFD(P=1,CNAME=输入端口)
    public static InputPoint:number = 1;
    ///KFD(P=1,CNAME=输出端口)
    public static OutputPoint:number = 2;
    ///KFD(P=1,CNAME=事件端点)
    public static EventPoint:number = 3;
    ///KFD(*)
}

export let KF_GRAPHARG_NULL:any = {};
