//

///KFD(C,CLASS=KFExpression)
///KFD(P=1,NAME=text,CNAME=代码,TYPE=kfstr)
///KFD(P=2,NAME=once,CNAME=缓存结果,TYPE=bool)
///KFD(*)

import {LOG} from "../../../Core/Log/KFLog";

export class KFExpression
{
    public text:string = "";
    public once:boolean = false;

    private _result:any;
    private _exec:boolean = false;
    private _func:()=>any;

    public constructor() {}

    public static exec(self:any,text:string):any
    {
        return eval(text);
    }

    ///全局脚本调用需要FORCE切记
    public value(self:any,force:boolean = false):any
    {
        if(this._exec && !force)
        {
            if(this.once)
                return this._result;
            return this._func();
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
                this._func = eval("let __func__ = function(){" + this.text + "};__func__");
            } else {
                this._func = eval("let __func__ = function(){return " + this.text + ";};__func__");
            }

            this._result = this._func();
            LOG("执行:{0}",this.text);
        }

        return this._result;
    }
}