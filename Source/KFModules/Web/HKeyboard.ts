import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFDName} from "../../KFData/Format/KFDName";
import {LOG} from "../../Core/Log/KFLog";

///KFD(C,CLASS=HKeyboard,EXTEND=KFBlockTarget)
///KFD(*)

export class HKeyboard extends KFBlockTarget {

    public static Meta:IKFMeta = new IKFMeta("HKeyboard"
        ,():KFBlockTarget=>{
            return new HKeyboard();
        }
    );

    public static KeyCode2Key:{[key:number]:string} = {
        8:"BackSpace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt"
        ,37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown"
        ,45:"Insert",46:"Delete"
        ,48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9"
        ,112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9"
        ,121:"F10",122:"F11",123:"F12"
    };

    ///连续触发的间隔
    public interval:number = 150;
    ///全局事件
    public global:boolean = true;
    ///以方向输出
    public outdir:boolean = false;

    public keyCodes:{[key:string]:any};

    protected _keydown:any;
    protected _keyup:any;
    protected _Firetime:number;
    protected _ReleasAllEvt:KFEvent;
    protected _DirEvt:KFEvent;
    protected _Dir:any;

    public ActivateBLK(KFBlockTargetData: any): void {
        super.ActivateBLK(KFBlockTargetData);

        this.etable =  this.global ?
              this.runtime.etable
            : new KFEventTable();

        this._keydown = this.onKeyDown.bind(this);
        this._keyup = this.onKeyUp.bind(this);
        this._Firetime = this.runtime.realytime;
        this.keyCodes = {};

        window.addEventListener("keydown"
            ,this._keydown);
        window.addEventListener("keyup"
            ,this._keyup);

        ///后面配置化

        this.keyCodes["ArrowLeft"] = {isDown:false,attr:"x",val:-1,oppo:"ArrowRight"};
        this.keyCodes["ArrowRight"] = {isDown:false,attr:"x",val:1,oppo:"ArrowLeft"};
        this.keyCodes["ArrowUp"] = {isDown:false,attr:"y",val:-1,oppo:"ArrowUp"};
        this.keyCodes["ArrowDown"] = {isDown:false,attr:"y",val:1,oppo:"ArrowDown"};

        let Strs = KFDName._Strs;
        this._ReleasAllEvt
            = new KFEvent(Strs.GetNameID("KeyReleasAll"));
        this._DirEvt
            = new KFEvent(Strs.GetNameID("KeyDirection"));
        this._DirEvt.arg = {x:0,y:0,toString:function(){return "x=" + this.x + ",y=" + this.y;}};
        this._Dir  = {x:0,y:0};

        this._Dir.N = function (outdir) {
            let len = Math.sqrt(this.x * this.x + this.y * this.y);
            if(len > 0){
                let divlen = 1 / len;

                outdir.x = this.x * divlen;
                outdir.y = this.y * divlen;

            }else {
                    outdir.x = 0;
                    outdir.y = 0;
                }
        }
    }

    private Press(keyobj:any) {
        let attr = keyobj.attr;
        let old = this._Dir[attr];
        let newval = keyobj.val;
        this._Dir[attr] = newval;

        if(old != newval){
            //速度改变需要发事件无视间隔
            this._Dir.N(this._DirEvt.arg);
            this.etable.FireEvent(this._DirEvt);
            this._Firetime = this.runtime.realytime;

        } else {
            //记录间隔
            let realtime = this.runtime.realytime;
            if(realtime - this._Firetime >= this.interval){
                this._Firetime = realtime;
                this._Dir.N(this._DirEvt.arg);
                this.etable.FireEvent(this._DirEvt);
            }
        }
    }

    private Release(keyobj:any){
        let allreleas:boolean = true;
        for(let key in this.keyCodes){
            if(this.keyCodes[key].isDown){
                allreleas = false;
                break;
            }
        }
        if(allreleas) {
            let dirarg = this._Dir;
            dirarg.x = 0;
            dirarg.y = 0;
            ///发送全部release事件
            this.etable.FireEvent(this._ReleasAllEvt);
        }
        else
        {
            if(this._Dir[keyobj.attr] == keyobj.val){
                let oppo = this.keyCodes[keyobj.oppo];
                if(oppo && oppo.isDown){
                    this._Dir[oppo.attr] = oppo.val;
                }else
                    this._Dir[keyobj.attr] = 0;

                this._Dir.N(this._DirEvt.arg);
                this.etable.FireEvent(this._DirEvt);
                this._Firetime = this.runtime.realytime;
            }
        }
    }

    public DeactiveBLK(): void {
        window.removeEventListener("keydown"
            ,this._keydown);
        window.removeEventListener("keyup"
            ,this._keyup);
        ///非全局才需要清空
        if(this.global == false && this.etable)
            this.etable.Clear();
        this.etable = null;
        super.DeactiveBLK();
    }
    private onKeyDown(event) {

        if (event.defaultPrevented) {
            return;
            // 如果已取消默认操作，则不应执行任何操作
        }
        var handled:any;
        if (event.key !== undefined) {
            handled = event.key;
            // 使用KeyboardEvent.key处理事件，并将handled设置为true。
        }
        else if (event.keyCode !== undefined) {
            let codeint = event.keyCode;
            let keystr = HKeyboard.KeyCode2Key[codeint];
            if(!keystr)
                keystr = String.fromCharCode(codeint);
            handled = keystr;
            //使用KeyboardEvent.keyCode处理事件并将handled设置为true。
        }

        if (handled) {
            // 如果事件已处理，则禁止“双重操作”
            event.preventDefault();

            let keyobj = this.keyCodes[handled];
            if(keyobj){
                keyobj.isDown = true;
                this.Press(keyobj);
            }
        }
    }
    private onKeyUp(event) {

        if (event.defaultPrevented) {
            return;
            // 如果已取消默认操作，则不应执行任何操作
        }
        var handled:any;
        if (event.key !== undefined) {
            handled = event.key;
            // 使用KeyboardEvent.key处理事件，并将handled设置为true。
        }
        else if (event.keyCode !== undefined) {
            let codeint = event.keyCode;
            let keystr = HKeyboard.KeyCode2Key[codeint];
            if(!keystr)
                keystr = String.fromCharCode(codeint);
            handled = keystr;
            //使用KeyboardEvent.keyCode处理事件并将handled设置为true。
        }
        if (handled) {
            // 如果事件已处理，则禁止“双重操作”
            event.preventDefault();
            let keyobj = this.keyCodes[handled];
            if(keyobj){
                keyobj.isDown = false;
                this.Release(keyobj);
            }
        }
    }
}