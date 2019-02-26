

export class KFRegister
{
    static Create(varsize:number = 3):KFRegister
    {
        return null;
    }

    ///销毁寄存器
    static Destory(reg:KFRegister):boolean
    {
        return false;
    }

       ///清空寄存器的子节点
    static Clear(reg:KFRegister):boolean
    {
        return false;
    }

    static DestoryTop(reg:KFRegister)
    {

    }

    static ClearTop(reg:KFRegister):KFRegister
    {
        return null;
    }

    ///将自己压入
    Push(paranum:number, varsize:number = 3):KFRegister
    {
        return null;
    }

    ///弹出父级
    Pop():KFRegister
    {
        return null;
    }

    ///最顶端的寄存器
    Top():KFRegister
    {
        return null;
    }

    ///最底端的寄存器
    Bottom(): KFRegister
    {
        return null;
    }

    ///invm 是否在VM内部调用，如果invm是真则直接填充当前寄存器
    ReturnValue(value:number, invm:boolean = false)
    {
        //判定VALUE的类型定义
    }

    ///invm 是否在VM内部调用，如果invm是真则直接填充当前寄存器
    ///ReturnValue(num1 value, bool invm = false);
    ///invm 是否在VM内部调用，如果invm是真则直接填充当前寄存器
    ReturnValueAny(value:any, invm:boolean = false)
    {

    }

    _PC:number;
    _NUMS:Array<number> = new Array<number>();
    _OBJECTS:Array<any> = new Array<any>();

    ///清空寄存器数据
    _Clear()
    {

    }

    _Destory()
    {

    }

    _NewVarSize(paramnum:number, varsize:number)
    {

    }

    _Parent:KFRegister;
    _Child:KFRegister;
}