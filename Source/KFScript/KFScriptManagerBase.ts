import {KFScript, KFScriptContext} from "./KFScriptDef";
import {KFRegister} from "./ExecCode/KFRegister";
import {KFScriptGroupType} from "./KFScriptGroupType";
import {KFDName} from "../KFData/Format/KFDName";

export class KFScriptManagerBase implements KFScriptContext
{
    targetObject: any;
    thisRegister: KFRegister;
    runtime: any;
    protected _G_SCRIPT_INSTANCE: { [key: number]: KFScript; } = {}

    public constructor()
    {
        this.thisRegister = KFRegister.Create();
    }

    public Init()
    {
        
    }

    public NewScriptInstance(type:KFDName):KFScript
    {
        return null;
    }

    public DelScriptInstance(script:KFScript)
    {}

    public Finalize():void
    {
        if (this.thisRegister != null)
        {
            KFRegister.DestoryTop(this.thisRegister);
            this.thisRegister = null;
        }
        this.RemoveAllScripts();
    }

    private RemoveAllScripts():void
    {
        this._G_SCRIPT_INSTANCE = {};
        /*
        if (_G_SCRIPT_INSTANCE.empty() == false)
        {
            kfMap<KFScript*, bool> delmap;

            for (auto iter = _G_SCRIPT_INSTANCE.begin()
            ; iter != _G_SCRIPT_INSTANCE.end()
        ; iter++)
            {
                auto sc = iter->second;
                if (delmap.find(sc) == delmap.end())
                {
                    delmap.insert(std::pair<KFScript*, bool>(sc, true));
                }
            }

            _G_SCRIPT_INSTANCE.clear();

            for (auto iter = delmap.begin()
            ; iter != delmap.end()
        ; iter++)

            {
                DelScriptInstance(iter->first);
            }
        }*/
    }

    public CallProperty(name: string, codeline: any): void
    {}

    public ExecCodeLine(codeline: any, target: any): void
    {
        /// 暂时不支持
    }
    
    public Execute(scriptData: any , target: any): void
    {
        this.targetObject = target;

        if (scriptData.group == KFScriptGroupType.LowLevel)
        {
            //KFVM::ExecCodeLine(scriptData, context);
            return;
        }

        let scriptType:KFDName = scriptData.type;
        let script:KFScript = this._G_SCRIPT_INSTANCE[scriptType.value];

        if (script == null)
        {
            script = this.NewScriptInstance(scriptType);

            if (script != null)
            {
                let sTypes:Array<KFDName> = script.GetScriptTypes();
                let count:number = sTypes.length;
                if(count > 0) {
                    for (let i: number = 0; i < count; i++) {
                        this._G_SCRIPT_INSTANCE[sTypes[i].value] = script;
                    }
                }
                else
                {
                    this._G_SCRIPT_INSTANCE[scriptType.value] = script;
                }

                script.Execute(scriptData, this);
            }
        }
        else
        {
            script.Execute(scriptData, this);
        }
    }

    public ExecuteFrameScript(id: number, framedata: any, target: any): void
    {
        this.targetObject = target;

        let scriptDatas:Array<any> = framedata.scripts;
        let reg:KFRegister = this.thisRegister;

        if (reg == null)
        {
            for (let i = 0; i < scriptDatas.length; i++)
            {
                // Debug.Log("    Trigger-Script 开始执行 -> " + scriptData.scriptType);
                this.Execute(scriptDatas[i], this);
            }
        }
        else
        {
            //建立新的寄存器集合
            let regs:KFRegister = this.PushRegister(framedata.paramsize, framedata.varsize);
            regs._PC = framedata.startPC;
            for (; regs._PC < scriptDatas.length;)
            {
                this.Execute(scriptDatas[regs._PC], this);
                regs._PC += 1;
            }
            this.PopRegister();
        }
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
}