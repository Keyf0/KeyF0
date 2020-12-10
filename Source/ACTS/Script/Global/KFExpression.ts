//

///KFD(C,CLASS=KFExpression)
///KFD(P=1,NAME=text,CNAME=代码,TYPE=kfstr,TEXTTYPE=javascript)
///KFD(*)


export class KFExpression
{
    public text:string = "";
    public _func:(self:any,context:any)=>any;

    public constructor() {}

    public static exec(self:any,text:string):any
    {
        return eval(text);
    }

    ///全局脚本调用需要FORCE切记
    public value(tgt:any,ctx:any = null):any
    {
        if(this._func == null) {
            ///有分号就是多行了
            let multi = (this.text.indexOf(";") != -1);
            if (multi) {
                this._func = eval("var __func__ = function(self,context){" + this.text + "};__func__");
            } else {
                this._func = eval("var __func__ = function(self,context){return " + this.text + ";};__func__");
            }
        }
        return this._func(tgt,ctx);
    }
}