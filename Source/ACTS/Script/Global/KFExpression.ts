//

///KFD(C,CLASS=KFExpression)
///KFD(P=1,NAME=text,CNAME=代码,TYPE=kfstr,texttype=javascript)
///KFD(P=2,NAME=once,CNAME=缓存结果,TYPE=bool)
///KFD(*)


export class KFExpression
{
    public text:string = "";
    public once:boolean = false;

    public _result:any;
    public _exec:boolean = false;
    public _func:(self:any,context:any)=>any;

    public constructor() {}

    public static exec(self:any,text:string):any
    {
        return eval(text);
    }

    ///全局脚本调用需要FORCE切记
    public value(tgt:any,ctx:any = null):any
    {
        if(this._exec)
        {
            if(this.once)
                return this._result;
            return this._func(tgt,ctx);
        }
        this._exec = true;

        if(this.once)
        {
            this._result = eval(this.text);
        }
        else {
            ///有分号就是多行了
            let multi = (this.text.indexOf(";") != -1);
            if (multi) {
                this._func = eval("var __func__ = function(self,context){" + this.text + "};__func__");
            } else {
                this._func = eval("var __func__ = function(self,context){return " + this.text + ";};__func__");
            }

            this._result = this._func(tgt,ctx);
            //LOG("执行:{0}",this.text);
        }

        return this._result;
    }
}