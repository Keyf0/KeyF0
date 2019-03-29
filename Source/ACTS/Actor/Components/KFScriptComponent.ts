import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFRegister} from "../../../KFScript/ExecCode/KFRegister";
import {KFScript, KFScriptContext} from "../../../KFScript/KFScriptDef";
import {Variable} from "../../Data/Variable";
import {KFACTSScript, KFACTSScriptContext} from "../../Script/KFScriptSystem";
import {KFScriptGroupType} from "../../../KFScript/KFScriptGroupType";
import {KFFrameDataUtils} from "../../Data/KFFrameDataUtils";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";


export class KFScriptComponent extends KFComponentBase implements KFACTSScriptContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFScriptComponent");

    private _targetScripts:{[key:number]:KFScript;} = {};
    private _scopeOnceScripts:{[key:number]:any} = {};
    private _scopeKeepScripts:Array<KFScript> = new Array<KFScript>();
    private _keepScriptID:number;
    private _scriptruning:boolean;
    private _isEndingscope:boolean;
    private _removeKeepScripts:{[key:number]:boolean} = {};
    private _hasRemoveKeep:boolean;
    private _nextFrameScripts:Array<any> = new Array<any>();
    private _beginscopeScriptes:Array<any> = new Array<any>();
    private _variables:{[key:number]:Variable} = {};
    private _ExecingFrame:any;


    public thisRegister: KFRegister;

    public constructor(target:any)
    {
        super(target, KFScriptComponent.Meta.type);
        this.thisRegister =  KFRegister.Create();
    }

    public ResetComponent():void
    {
        this.EndScope();
        this._nextFrameScripts.length = 0;
        this._beginscopeScriptes.length = 0;
        this._scriptruning = false;
        this._keepScriptID = 0;
        KFRegister.Clear(this.thisRegister);
    }

    public EnterFrame():void
    {
        let num = this._nextFrameScripts.length;
        if (num > 0)
        {
            for (let i:number = 0
                ; i < num
                ; i++)
            {
                let scriptData = this._nextFrameScripts[i];
                this.ExecuteAt(scriptData.type, scriptData
                    , null, false);
            }
            this._nextFrameScripts.length = 0;
        }

        num = this._scopeKeepScripts.length;
        if (num > 0)
        {
            this._scriptruning = true;

            for (let i = 0
                ; i < num
                ; i++)
            {
                let script:KFScript = this._scopeKeepScripts[i];
                script.Update();
            }
            this._scriptruning = false;

            if (this._hasRemoveKeep)
            {
                num = this._scopeKeepScripts.length;

                for (let i = 0;
                     i < num; )
                {
                    let script:KFScript = this._scopeKeepScripts[i];
                    if (this._removeKeepScripts[script.typeid])
                    {
                        this._scopeKeepScripts.splice(i,1);
                    }
                    else { i++; }
                }

                this._removeKeepScripts = {};
                this._hasRemoveKeep = false;
            }
        }
    }

    public AddKeepScript(script: KFScript): number
    {
        this._keepScriptID += 1;
        this._scopeKeepScripts.push(script);
        return this._keepScriptID;
    }

    public BeginScope(): void
    {
        let num = this._beginscopeScriptes.length;
        if (num > 0)
        {
            for (let i = 0
                ; i < num; i++)
            {
                let scriptData:any = this._beginscopeScriptes[i];
                this.ExecuteAt(scriptData.type, scriptData
                , null, false);
            }
            this._beginscopeScriptes.length = 0;
        }
    }

    public CallProperty(name: string, codeline: any): void {}

    public EndScope(): void
    {
        this._isEndingscope = true;
        let num = this._scopeKeepScripts.length;

        if (num > 0)
        {
            ///此处的_scopeKeepScripts.Count 需要实时的访问
            ///因为在STOP过程中有可能会继续添加脚本...
            for (let i = 0
                ;i < num;
                i++)
            {
                this._scopeKeepScripts[i].Stop();
            }
            this._scopeKeepScripts.length = 0;
        }

        this._removeKeepScripts = {};
        this._keepScriptID = 0;
        this._scopeOnceScripts = {};

        ///清空变量
        this._variables = {};
        //_currentsm = null;
        this._isEndingscope = false;
    }

    public ExecCodeLine(codeline: any, context: KFScriptContext): void
    {
        if (codeline == null)
            return;
        if (context == null)
            context = this;
        //KFVM::ExecCodeLine(codeline, context);
    }

    public Execute(scriptData: any, context: KFScriptContext): void
    {
        if (scriptData != null)
        {
            this.ExecuteAt(scriptData.type, scriptData
            , null,false);
        }
    }

    public ExecuteAt(scriptType: KFDName
                     , scriptData: any
                     , context: KFScriptContext
                     , beginscope: boolean): void
    {
        if (scriptData == null)
            return;

        if(context == null)
        {
            context = this;
        }

        let sgroup = scriptData.group;
        if (sgroup == KFScriptGroupType.Target)
        {
            ///如果正在结束中调用了脚本则在下一帧开始才能执行
            if (this._isEndingscope)
            {
                ///有些脚本需要在下一个scrope开始前执行比如说打断残影
                if (beginscope)
                    this._beginscopeScriptes.push(scriptData);
                else
                    this._nextFrameScripts.push(scriptData);
                return;
            }

            ///逻辑对角脚本由逻辑对象来执行
            let targetScript:KFScript = this._targetScripts[scriptType.value];

            if (targetScript == null)
            {
                targetScript = this.runtime.scripts.NewScriptInstance(scriptType);

                if (targetScript != null)
                {
                    targetScript.typeid = scriptType.value;
                    this._targetScripts[scriptType.value] = targetScript;

                    if(targetScript["SetContext"])
                    {
                        (<KFACTSScript>targetScript).SetContext(<KFACTSScriptContext>context);
                    }
                }
            }

            if (targetScript != null)
            {
                targetScript.Execute(scriptData, context);
            }
        }
        else
        {
            ///执行全局脚本
            this.runtime.scripts.Execute(scriptData, context);
        }
    }

    public ExecuteFrameScript(id: number
                       , frameData: any
                       , context: KFScriptContext): void
    {
        if (frameData != null)
        {
            let UpFrameData = this._ExecingFrame;
            this._ExecingFrame = frameData;
            let once:boolean = frameData.once;
            let frameid:number = KFFrameDataUtils.CreateID(frameData);

            if (false == once || this._scopeOnceScripts[frameid])
            {
                ///记录已经执行的标记
                if (once)
                {
                    this._scopeOnceScripts[frameid] = true;
                }

                ///执行脚本
                let scriptDatas = frameData.scripts;
                let count = scriptDatas.length;
                ///如果之前有正在执行的FRAMEDATA则寄存器入栈
                if (UpFrameData != null)
                {
                    this.thisRegister = this.thisRegister.Push(frameData.paramsize
                        , frameData.varsize);
                }

                this.thisRegister._PC = frameData.startPC;

                for (; this.thisRegister._PC < count;)
                {
                    let data = scriptDatas[this.thisRegister._PC];
                    let scriptType = data.type;

                    if (data.group == KFScriptGroupType.LowLevel)
                    {
                        //KFVM::ExecCodeLine(data, this);
                        /*
                        if (m_scriptmgr != nullptr)
                        {
                        m_scriptmgr->ExecCodeLine(data, this);
                        }
                        */
                    }
                else
                    this.ExecuteAt(scriptType, data, context, false);

                    this.thisRegister._PC += 1;
                }
                ///如果之前有正在执行的FRAMEDATA则寄存器出栈
                if (UpFrameData != null)
                {
                    this.thisRegister = this.thisRegister.Pop();
                }
            }

            this._ExecingFrame = UpFrameData;
        }
        else
        {
            ///可能是一次函数的调用...
            if (this._ExecingFrame != null)
            {
                let css = this._ExecingFrame.scripts;
                if (id < css.length)
                {
                    /////////
                    ///to do....
                    /*KHCodeSnippet cs = css[id] as KHCodeSnippet;
                    if (cs != null)
                    {
                    var FrameFunc = cs.Object;
                    if (FrameFunc != null)
                    {
                    ExecuteFrameScript(FrameFunc.index, FrameFunc);
                    }
                    }*/
                }
            }
        }
    }

    GetVariable(vID: number, create: boolean, varstr: string): Variable
    {
        return undefined;
    }


    public PopRegister(): KFRegister
    {
        if(this.thisRegister != null)
        {
            this.thisRegister = this.thisRegister.Pop();
        }
        return this.thisRegister;
    }

    public PushRegister(paramnum: number, varsize: number): KFRegister
    {
        if (this.thisRegister != null)
        {
            let reg = this.thisRegister.Push(paramnum, varsize);
            this.thisRegister = reg;
            return this.thisRegister;
        }
        return null;
    }

    RemoveAllKeepScript(): void
    {

    }

    RemoveKeepScript(script: KFScript): void
    {
        if (this._scriptruning)
        {
            this._removeKeepScripts[script.typeid] = true;
        }
        else if (!this._isEndingscope)
        {
            /// 不在执行过程中且不在结束scope中才处理删除
            let i = this._scopeKeepScripts.length - 1;
            while (i >= 0)
            {
                if (this._scopeKeepScripts[i] == script)
                {
                   this._scopeKeepScripts.splice(i,1);
                    break;
                }
                i--;
            }
        }
    }
}