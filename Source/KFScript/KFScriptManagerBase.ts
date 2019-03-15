import {KFScript, KFScriptContext} from "./KFScriptDef";
import {KFRegister} from "./ExecCode/KFRegister";
import {KFScriptGroupType} from "./KFScriptGroupType";
import {KFDName} from "../KFData/Format/KFDName";

export class KFScriptManagerBase implements KFScriptContext
{
    protected m_reg:KFRegister;
    protected _G_SCRIPT_INSTANCE: { [key: number]: KFScript; } = {}

    public constructor()
    {
        this.m_reg = KFRegister.Create();
    }

    public NewScriptInstance(type:KFDName):KFScript
    {
        return null;
    }

    public DelScriptInstance(script:KFScript)
    {}

    public Finalize():void
    {
        if (this.m_reg != null)
        {
            KFRegister.DestoryTop(this.m_reg);
            this.m_reg = null;
        }
        this.RemoveAllScripts();
    }

    private RemoveAllScripts():void
    {/*
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

    public ExecCodeLine(codeline: any
                        , context: KFScriptContext): void
    {
        /// 暂时不支持
    }

    public Execute(scriptData: any, context: KFScriptContext): void
    {
        if (scriptData == null)
            return;

        if (context == null)
            context = this;

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
                for (let i:number = 0; i < count; i++)
                {
                    this._G_SCRIPT_INSTANCE[sTypes[i].value] = script;
                }
                script.Execute(scriptData, context);
            }
        }
        else
        {
            script.Execute(scriptData, context);
        }
    }

    public ExecuteFrameScript(id: number, framedata: any, context: KFScriptContext): void
    {
        if (framedata == null)
            return;

        if (context == null)
        {
            context = this;
        }

        let scriptDatas:Array<any> = framedata.scripts;
        let reg:KFRegister = context.GetRegister();

        if (reg == null)
        {
            for (let i = 0; i < scriptDatas.length; i++)
            {
                // Debug.Log("    Trigger-Script 开始执行 -> " + scriptData.scriptType);
                this.Execute(scriptDatas[i], context);
            }
        }
        else
        {
            //建立新的寄存器集合
            let regs:KFRegister = context.PushRegister(framedata.paramsize, framedata.varsize);
            regs._PC = framedata.startPC;
            for (; regs._PC < scriptDatas.length;)
            {
                this.Execute(scriptDatas[regs._PC], context);
                regs._PC += 1;
            }
            context.PopRegister();
        }
    }

    public GetRegister(): KFRegister
    {
        return this.m_reg;
    }

    public GetThis(): any {return this;}

    public PopRegister(): KFRegister
    {
       if(this.m_reg != null)
       {
           this.m_reg = this.m_reg.Pop();
       }
       return this.m_reg;
    }

    public PushRegister(paramnum: number, varsize: number): KFRegister
    {
        if (this.m_reg != null)
        {
            let reg = this.m_reg.Push(paramnum, varsize);
            this.m_reg = reg;
            return this.m_reg;
        }
        return null;
    }

    public runtime(): any
    {
        return null;
    }
}